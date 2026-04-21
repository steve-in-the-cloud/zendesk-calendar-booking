require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const googleCalendar = require('./googleCalendar');
const zendeskService = require('./zendeskService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    /\.zendesk\.com$/,
    /\.zdassets\.com$/,
    /\.zdusercontent\.com$/
  ]
}));
app.use(bodyParser.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Google OAuth routes
app.get('/auth/google', (req, res) => {
  const authUrl = googleCalendar.getAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    await googleCalendar.handleCallback(code);
    res.redirect(`${process.env.CLIENT_URL}/admin?success=true`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/admin?error=auth_failed`);
  }
});

// Admin endpoints
app.get('/api/admin/status', async (req, res) => {
  try {
    const isAuthenticated = await googleCalendar.loadCredentials();

    db.get('SELECT * FROM admin_config WHERE id = 1', (err, config) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        authenticated: isAuthenticated,
        calendarConfigured: !!config?.calendar_id,
        config: config ? {
          calendarId: config.calendar_id,
          workingHoursStart: config.working_hours_start,
          workingHoursEnd: config.working_hours_end,
          timezone: config.timezone
        } : null
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/calendars', async (req, res) => {
  try {
    const calendars = await googleCalendar.getCalendarList();
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/calendar', async (req, res) => {
  try {
    const { calendarId } = req.body;
    await googleCalendar.setCalendarId(calendarId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Booking types endpoints
app.get('/api/booking-types', (req, res) => {
  db.all('SELECT * FROM booking_types WHERE is_active = 1 ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

app.get('/api/booking-types/:id', (req, res) => {
  db.get('SELECT * FROM booking_types WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Booking type not found' });
    }
    res.json(row);
  });
});

app.post('/api/booking-types', (req, res) => {
  const { name, duration_minutes, description, color } = req.body;

  db.run(
    'INSERT INTO booking_types (name, duration_minutes, description, color) VALUES (?, ?, ?, ?)',
    [name, duration_minutes, description, color || '#3b82f6'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name, duration_minutes, description, color });
    }
  );
});

app.put('/api/booking-types/:id', (req, res) => {
  const { name, duration_minutes, description, color, is_active } = req.body;

  db.run(
    'UPDATE booking_types SET name = ?, duration_minutes = ?, description = ?, color = ?, is_active = ? WHERE id = ?',
    [name, duration_minutes, description, color, is_active !== undefined ? is_active : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/booking-types/:id', (req, res) => {
  db.run('UPDATE booking_types SET is_active = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Availability endpoint
app.get('/api/availability', async (req, res) => {
  try {
    const { start, end, duration } = req.query;

    if (!start || !end || !duration) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes = parseInt(duration);

    const slots = await googleCalendar.getAvailableSlots(startDate, endDate, durationMinutes);
    res.json(slots);
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const { bookingTypeId, conversationId, ticketId, startTime, endTime, customerMessage } = req.body;

    if (!bookingTypeId || (!conversationId && !ticketId) || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get booking type details
    db.get('SELECT * FROM booking_types WHERE id = ?', [bookingTypeId], async (err, bookingType) => {
      if (err || !bookingType) {
        return res.status(404).json({ error: 'Booking type not found' });
      }

      try {
        // Create Google Calendar event
        const sourceText = conversationId
          ? `Zendesk conversation ${conversationId}`
          : `Zendesk ticket ${ticketId}`;

        const googleEvent = await googleCalendar.createEvent({
          summary: `${bookingType.name} - Booking`,
          description: customerMessage || `Booking from ${sourceText}`,
          startTime,
          endTime
        });

        // Save booking to database
        db.run(
          'INSERT INTO bookings (booking_type_id, conversation_id, ticket_id, start_time, end_time, customer_message, google_event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [bookingTypeId, conversationId, ticketId, startTime, endTime, customerMessage, googleEvent.id],
          async function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Send confirmation message to Zendesk conversation (only for web bookings)
            if (conversationId) {
              try {
                const message = zendeskService.formatBookingMessage({
                  bookingType: bookingType.name,
                  startTime,
                  endTime
                });

                await zendeskService.sendMessage(conversationId, message);

                res.json({
                  id: this.lastID,
                  googleEventId: googleEvent.id,
                  success: true
                });
              } catch (zendeskError) {
                console.error('Failed to send Zendesk message:', zendeskError);
                res.json({
                  id: this.lastID,
                  googleEventId: googleEvent.id,
                  success: true,
                  warning: 'Booking created but failed to send confirmation message'
                });
              }
            } else {
              // Zendesk app booking - no conversation message needed
              res.json({
                id: this.lastID,
                googleEventId: googleEvent.id,
                success: true
              });
            }
          }
        );
      } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings
app.get('/api/bookings', (req, res) => {
  const query = `
    SELECT b.*, bt.name as booking_type_name
    FROM bookings b
    LEFT JOIN booking_types bt ON b.booking_type_id = bt.id
    ORDER BY b.start_time DESC
    LIMIT 100
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: ${process.env.CLIENT_URL}/admin`);
});
