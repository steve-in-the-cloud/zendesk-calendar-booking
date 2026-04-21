# Project Structure

## Overview

This project consists of three main components:
1. **Backend Server** - Node.js/Express API
2. **Web Frontend** - React web application for end users
3. **Zendesk App** - Ticket sidebar app for agents

## Directory Structure

```
.
├── server/                      # Backend API
│   ├── index.js                # Main Express server
│   ├── database.js             # SQLite database setup
│   ├── googleCalendar.js       # Google Calendar integration
│   └── zendeskService.js       # Zendesk Messaging API
│
├── client/                      # React web frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingWidget.js    # Customer booking interface
│   │   │   └── AdminPanel.js       # Admin configuration
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── zendesk-app/                 # Zendesk ticket sidebar app
│   ├── manifest.json           # App configuration
│   ├── assets/
│   │   ├── index.html          # App HTML
│   │   ├── app.js              # React app for agents
│   │   └── main.css            # Styling
│   ├── translations/
│   │   └── en.json             # Localization
│   ├── package-app.sh          # Packaging script
│   └── README.md               # Installation guide
│
├── .env                         # Environment variables (not in git)
├── .env.example                # Example environment config
├── calendar_booking.db         # SQLite database (created on first run)
├── package.json                # Backend dependencies
└── README.md                   # Main documentation
```

## Component Details

### Backend Server (`server/`)

**Purpose**: Provides REST API for both web frontend and Zendesk app

**Key Files**:
- `index.js` - Express routes and middleware
- `database.js` - SQLite schema and connection
- `googleCalendar.js` - Calendar availability and event creation
- `zendeskService.js` - Messaging API integration

**Endpoints**:
- `/api/booking-types` - Manage booking types
- `/api/availability` - Get available time slots
- `/api/bookings` - Create and list bookings
- `/api/admin/*` - Admin configuration
- `/auth/google/*` - OAuth flow

### Web Frontend (`client/`)

**Purpose**: Self-service booking interface for end users

**Key Features**:
- Receives booking type via URL parameter
- Shows calendar and available slots
- Creates booking and posts to conversation
- Designed to be embedded in Zendesk Messaging

**Components**:
- `BookingWidget` - Main booking interface
- `AdminPanel` - Google Calendar setup and booking type management

**Usage**:
```
http://localhost:3000/?bookingTypeId=1&conversationId=abc123
```

### Zendesk App (`zendesk-app/`)

**Purpose**: Agent-facing interface for booking on behalf of customers

**Key Features**:
- Dropdown to select booking type (no URL param needed)
- Same calendar and slot selection UI
- Automatically captures ticket ID from context
- No conversation messaging (agent-initiated)

**Installation**:
1. Run `./package-app.sh` to create zip
2. Upload to Zendesk Admin Center
3. Configure API URL in app settings

**Framework**: Zendesk Apps Framework v2.0 (ZAF SDK)

## Data Flow

### Web Frontend Flow

```
User → Web App → Backend API → Google Calendar
                  ↓
            Database + Zendesk Message
```

1. User opens URL with bookingTypeId and conversationId
2. Frontend fetches booking type details
3. User selects date/time
4. Backend creates calendar event
5. Backend saves to database
6. Backend posts confirmation to Zendesk conversation

### Zendesk App Flow

```
Agent → Zendesk App → Backend API → Google Calendar
                       ↓
                   Database only
```

1. Agent opens ticket (app loads automatically)
2. Agent selects booking type from dropdown
3. Agent selects date/time
4. Backend creates calendar event
5. Backend saves to database with ticketId
6. No conversation message (agent-initiated)

## Database Schema

### Tables

**admin_config**
- Stores Google OAuth tokens
- Calendar ID selection
- Working hours configuration

**booking_types**
- Name, duration, description, color
- Managed via admin panel
- `is_active` flag for soft delete

**bookings**
- Links to booking_type_id
- Either `conversation_id` (web) OR `ticket_id` (app)
- Start/end times
- Google Calendar event ID

## Integration Points

### Google Calendar API

**Authentication**: OAuth 2.0
**Scopes**: `calendar.readonly`, `calendar.events`

**Operations**:
- List calendars
- Get busy times
- Create events

### Zendesk Messaging API

**Authentication**: Email + API Token
**Operations**:
- Post messages to conversations (web bookings only)

### Zendesk Apps Framework

**Version**: 2.0
**Context Access**:
- Ticket ID
- Agent information
**Operations**:
- Resize iframe
- Show notifications
- Get settings

## Environment Configuration

### Development

```env
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
CLIENT_URL=http://localhost:3000
PORT=3001
```

### Production

```env
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
CLIENT_URL=https://your-domain.com
PORT=3001
```

**Zendesk App Settings**:
- Development: `http://localhost:3001`
- Production: Your deployed backend URL

## Security Considerations

- All secrets in `.env` (never committed)
- CORS configured for:
  - Client URL (web frontend)
  - `*.zendesk.com` (Zendesk app iframes)
  - `*.zdassets.com` (Zendesk assets)
- OAuth tokens stored server-side only
- Input validation on all endpoints

## Development Workflow

### Starting Development

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Web Frontend
npm run client

# Terminal 3 - Zendesk App (optional)
cd zendesk-app
zcli apps:server
```

### Making Changes

**Backend Changes**:
- Edit `server/*.js`
- Server auto-restarts (nodemon)

**Web Frontend Changes**:
- Edit `client/src/**/*`
- Hot reload in browser

**Zendesk App Changes**:
- Edit `zendesk-app/assets/*`
- Re-package: `./package-app.sh`
- Re-upload to Zendesk
- Refresh ticket page

## Deployment

### Backend + Web Frontend

1. Build frontend: `npm run build`
2. Deploy to hosting (Render, Heroku, etc.)
3. Set environment variables
4. Update Google OAuth redirect URI
5. Update Zendesk app API URL setting

### Zendesk App

1. Update manifest.json default API URL (optional)
2. Run `./package-app.sh`
3. Upload new version to Zendesk
4. Agents refresh to see changes

## Testing

### Manual Testing

**Web Frontend**:
1. Create booking type in admin panel
2. Open booking URL with ID
3. Select date/time and book
4. Verify calendar event created
5. Check database for booking record
6. Confirm message posted to conversation

**Zendesk App**:
1. Install app in Zendesk
2. Open any ticket
3. App appears in sidebar
4. Select booking type from dropdown
5. Book appointment
6. Verify calendar event and database

### Common Issues

**CORS errors**: Update `server/index.js` cors config
**App won't load**: Check API URL in Zendesk app settings
**No slots available**: Verify working hours and calendar events
**Booking fails**: Check Google Calendar permissions and tokens

## Future Enhancements

- Timezone support per user
- Email notifications
- SMS reminders via Twilio
- Custom availability rules
- Multiple agent calendars
- Meeting notes/attachments
- Rescheduling/cancellation
- Recurring appointments
