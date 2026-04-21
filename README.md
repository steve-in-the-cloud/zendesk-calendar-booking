# Zendesk Calendar Booking System

A Google Calendar integration for Zendesk that allows both end users and customer service agents to book appointments.

## Features

- **Google Calendar Integration**: Connects to admin's Google Calendar to check availability
- **Multiple Booking Types**: Create different appointment types with custom durations
- **Smart Availability**: Automatically prevents bookings outside working hours and shows only available slots
- **Zendesk Integration**: Posts booking confirmations directly into Zendesk conversations
- **Dual Interface**:
  - **Web Widget**: Conversation Extension for end users to self-book
  - **Zendesk App**: Ticket sidebar app for agents to book on behalf of customers
- **URL Parameters**: Pass booking type and conversation ID via URL for seamless integration

## Architecture

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: SQLite
- **APIs**: Google Calendar API, Zendesk Messaging API

## Prerequisites

1. Node.js 14+ and npm
2. Google Cloud Project with Calendar API enabled
3. Zendesk account with Messaging enabled
4. API credentials for both services

## Installation

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Save the Client ID and Client Secret

### 3. Set Up Zendesk API

1. Log into your Zendesk account
2. Go to Admin Center > Apps and integrations > APIs > Zendesk API
3. Enable Token Access
4. Click "Add API token"
5. Copy the token and save it securely

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Zendesk
ZENDESK_SUBDOMAIN=your_subdomain
ZENDESK_API_TOKEN=your_api_token_here
ZENDESK_EMAIL=your_email@example.com

# Server
PORT=3001
CLIENT_URL=http://localhost:3000
```

## Running the Application

### Development Mode

Run backend and frontend separately:

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

The backend will run on `http://localhost:3001` and frontend on `http://localhost:3000`.

### Production Mode

```bash
# Build frontend
npm run build

# Start server
npm start
```

## Admin Setup

1. Navigate to `http://localhost:3000/admin`
2. Click "Connect Google Calendar"
3. Authorize the application
4. Select which calendar to use for bookings
5. Create booking types:
   - Name (e.g., "Sales Demo", "Support Call")
   - Duration in minutes
   - Description
   - Color for visual identification

## Zendesk Integration

This system provides two integration options:

### Option 1: Web Widget (Conversation Extension)

For end users to self-book appointments from Zendesk Messaging:

1. In Zendesk Admin Center, go to Messaging > Conversation Extensions
2. Create a new extension
3. Use the booking URL format:
   ```
   http://localhost:3000/?bookingTypeId={BOOKING_TYPE_ID}&conversationId={{ticket.id}}
   ```
4. Replace `{BOOKING_TYPE_ID}` with the actual ID from your admin panel
5. The `{{ticket.id}}` will be automatically replaced by Zendesk with the conversation ID

Example URL:
```
http://localhost:3000/?bookingTypeId=1&conversationId=CONVERSATION_ID
```

### Option 2: Zendesk Ticket Sidebar App

For agents to book appointments on behalf of customers:

1. Package the app:
   ```bash
   cd zendesk-app
   ./package-app.sh
   ```

2. Install in Zendesk:
   - Go to Admin Center > Apps and integrations > Zendesk Support apps > Manage
   - Click "Upload private app"
   - Select `zendesk-calendar-app.zip`
   - Click Upload

3. Configure the app:
   - Set **API Server URL** to your backend URL:
     - Development: `http://localhost:3001`
     - Production: Your deployed URL (e.g., `https://your-app.onrender.com`)
   - Save settings

4. Usage:
   - Open any ticket in Zendesk Support
   - Find "Calendar Booking System" in the right sidebar
   - Select booking type, date, and time
   - Click "Confirm Booking"

See `zendesk-app/README.md` for detailed installation and usage instructions.

## API Endpoints

### Admin Endpoints

- `GET /api/admin/status` - Check authentication and configuration status
- `GET /api/admin/calendars` - List available Google Calendars
- `POST /api/admin/calendar` - Set the calendar to use
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback

### Booking Types

- `GET /api/booking-types` - List all active booking types
- `GET /api/booking-types/:id` - Get specific booking type
- `POST /api/booking-types` - Create new booking type
- `PUT /api/booking-types/:id` - Update booking type
- `DELETE /api/booking-types/:id` - Deactivate booking type

### Bookings

- `GET /api/availability` - Get available time slots
  - Query params: `start`, `end`, `duration`
- `POST /api/bookings` - Create a booking
  - Body: `{ bookingTypeId, conversationId?, ticketId?, startTime, endTime }`
  - Use `conversationId` for web widget bookings
  - Use `ticketId` for Zendesk app bookings
- `GET /api/bookings` - List recent bookings

## Database Schema

### admin_config
- Stores Google Calendar tokens and settings
- Single row (id=1) for the admin configuration

### booking_types
- Different types of appointments
- Each has a name, duration, and description

### bookings
- Individual booking records
- Links to booking type with either conversation ID (web) or ticket ID (app)
- Stores Google Calendar event ID

## Customization

### Working Hours

Currently set to 9 AM - 5 PM, Monday-Friday. To modify:

Edit `server/googleCalendar.js`:

```javascript
const workingHoursStart = 9; // Change start hour
const workingHoursEnd = 17; // Change end hour
```

### Time Slot Intervals

Default is 30-minute intervals. To change:

Edit `server/googleCalendar.js` in `calculateAvailableSlots()`:

```javascript
slotStart = new Date(slotStart.getTime() + 30 * 60000); // Change 30 to desired minutes
```

### Styling

- Frontend styling: `client/src/components/*.css`
- Main colors can be customized in CSS variables

## Production Deployment

### Environment Updates

Update `.env` for production:

```env
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
CLIENT_URL=https://your-domain.com
```

Update Google Cloud Console:
- Add production redirect URI to OAuth credentials

### Build Process

```bash
cd client
npm run build
cd ..
```

Serve the built frontend from Express or use a separate static hosting service.

## Troubleshooting

### Google Calendar Connection Issues

- Verify OAuth credentials in Google Cloud Console
- Check redirect URI matches exactly
- Ensure Calendar API is enabled
- Try revoking and reconnecting

### Zendesk Message Not Posting

- Verify API token is valid
- Check subdomain is correct
- Ensure email has API access
- Test with Zendesk API explorer

### No Available Slots

- Check calendar has events blocking time
- Verify working hours configuration
- Ensure booking duration isn't too long
- Check timezone settings

## Security Considerations

- Never commit `.env` file
- Use environment variables for all secrets
- Implement rate limiting for production
- Add authentication for admin panel
- Validate all user inputs
- Use HTTPS in production

## Future Enhancements

- Configurable working hours per day
- Multiple admin users
- Email notifications
- SMS reminders
- Timezone detection
- Recurring bookings
- Buffer time between appointments
- Custom availability rules

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
