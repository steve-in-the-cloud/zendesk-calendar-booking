const { google } = require('googleapis');
const db = require('./database');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent'
    });
  }

  async handleCallback(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO admin_config (id, google_refresh_token, google_access_token, google_token_expiry, updated_at)
         VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [tokens.refresh_token, tokens.access_token, tokens.expiry_date],
        (err) => {
          if (err) reject(err);
          else resolve(tokens);
        }
      );
    });
  }

  async loadCredentials() {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM admin_config WHERE id = 1', async (err, row) => {
        if (err) {
          reject(err);
        } else if (row && row.google_refresh_token) {
          this.oauth2Client.setCredentials({
            refresh_token: row.google_refresh_token,
            access_token: row.google_access_token,
            expiry_date: row.google_token_expiry
          });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async getCalendarList() {
    await this.loadCredentials();
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    const response = await calendar.calendarList.list();
    return response.data.items;
  }

  async getAvailableSlots(startDate, endDate, durationMinutes) {
    await this.loadCredentials();

    const calendarId = await this.getCalendarId();
    if (!calendarId) {
      throw new Error('Calendar not configured');
    }

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    // Get events in the date range
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    return this.calculateAvailableSlots(startDate, endDate, events, durationMinutes);
  }

  calculateAvailableSlots(startDate, endDate, busyEvents, durationMinutes) {
    const slots = [];
    const workingHoursStart = 9; // 9 AM
    const workingHoursEnd = 17; // 5 PM

    let currentDate = new Date(startDate);
    currentDate.setHours(workingHoursStart, 0, 0, 0);

    while (currentDate < endDate) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        let slotStart = new Date(currentDate);
        slotStart.setHours(workingHoursStart, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(workingHoursEnd, 0, 0, 0);

        while (slotStart.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

          // Check if slot conflicts with any busy events
          const hasConflict = busyEvents.some(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            return (slotStart < eventEnd && slotEnd > eventStart);
          });

          if (!hasConflict) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString()
            });
          }

          slotStart = new Date(slotStart.getTime() + 30 * 60000); // 30-minute intervals
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workingHoursStart, 0, 0, 0);
    }

    return slots;
  }

  async createEvent(bookingData) {
    await this.loadCredentials();
    const calendarId = await this.getCalendarId();

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event = {
      summary: bookingData.summary,
      description: bookingData.description,
      start: {
        dateTime: bookingData.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: bookingData.endTime,
        timeZone: 'UTC',
      }
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event
    });

    return response.data;
  }

  async getCalendarId() {
    return new Promise((resolve, reject) => {
      db.get('SELECT calendar_id FROM admin_config WHERE id = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row?.calendar_id || 'primary');
      });
    });
  }

  async setCalendarId(calendarId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE admin_config SET calendar_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [calendarId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = new GoogleCalendarService();
