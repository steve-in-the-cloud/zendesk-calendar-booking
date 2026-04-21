# Zendesk Calendar Booking App

This is a Zendesk ticket sidebar application that allows customer service agents to book calendar appointments on behalf of customers.

## Features

- **Booking Type Selection**: Agents can choose from admin-configured booking types
- **Calendar Interface**: Visual calendar for selecting appointment dates
- **Time Slot Selection**: Shows available time slots based on Google Calendar availability
- **Real-time Booking**: Creates appointments in Google Calendar and saves to database
- **Ticket Integration**: Automatically links bookings to Zendesk tickets

## Installation

### 1. Package the App

From the project root directory:

```bash
cd zendesk-app
zip -r zendesk-calendar-app.zip . -x "*.git*" -x "*node_modules*" -x "README.md"
```

### 2. Install in Zendesk

1. Go to your Zendesk Admin Center
2. Navigate to **Apps and integrations** > **Zendesk Support apps** > **Manage**
3. Click **Upload private app**
4. Select the `zendesk-calendar-app.zip` file
5. Click **Upload**

### 3. Configure the App

After installation:

1. Go to the app settings
2. Set the **API Server URL** to your backend server URL
   - Development: `http://localhost:3001`
   - Production: Your deployed server URL (e.g., `https://your-app.onrender.com`)
3. Save the settings

### 4. Enable CORS

Make sure your backend server allows CORS requests from your Zendesk domain. Update the `.env` file:

```env
CLIENT_URL=https://your-subdomain.zendesk.com
```

Or allow multiple origins in `server/index.js`:

```javascript
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    /\.zendesk\.com$/
  ]
}));
```

## Usage

### For Agents

1. Open any ticket in Zendesk Support
2. Look for the **Calendar Booking System** app in the right sidebar
3. Select a booking type from the dropdown
4. Choose a date from the calendar
5. Select an available time slot
6. Click **Confirm Booking**

The appointment will be:
- Created in Google Calendar
- Saved to the database
- Linked to the current ticket

### For Admins

Before agents can use the app, admins must:

1. Configure Google Calendar integration (via `/admin` panel)
2. Create booking types (e.g., "Technical Support Call", "Sales Demo")
3. Set working hours and timezone

## Technical Details

### App Structure

```
zendesk-app/
├── manifest.json          # App configuration
├── assets/
│   ├── index.html        # Main HTML
│   ├── app.js            # React application
│   └── main.css          # Styling
└── translations/
    └── en.json           # English translations
```

### API Integration

The app communicates with your backend server using these endpoints:

- `GET /api/booking-types` - Fetch available booking types
- `GET /api/availability` - Get available time slots
- `POST /api/bookings` - Create a new booking

### Zendesk Apps Framework

The app uses ZAF SDK v2.0 to:
- Get current ticket ID
- Resize the iframe
- Show notifications
- Access app settings

## Development

### Testing Locally

1. Install Zendesk Apps Tools:
```bash
npm install -g @zendesk/zcli
```

2. Start the local server:
```bash
cd zendesk-app
zcli apps:server
```

3. Append `?zcli_apps=true` to any Zendesk ticket URL to load local apps

### Making Changes

After modifying files:

1. Re-package the app
2. Upload the new version to Zendesk
3. Refresh the browser to see changes

## Troubleshooting

### App doesn't load
- Check browser console for errors
- Verify API URL in app settings
- Ensure backend server is running

### No booking types appear
- Verify booking types exist in admin panel
- Check backend server logs
- Confirm API URL is correct

### CORS errors
- Add Zendesk domain to CORS configuration
- Restart backend server after changes

### Booking fails
- Check backend server logs
- Verify Google Calendar is configured
- Ensure ticket ID is being captured

## Support

For issues or questions, check:
- Backend server logs
- Browser developer console
- Zendesk app logs (Admin Center > Manage apps > App name > Logs)
