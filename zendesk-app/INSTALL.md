# Quick Installation Guide

## Prerequisites

✓ Backend server running (development or production)
✓ Google Calendar configured via `/admin` panel
✓ At least one booking type created
✓ Zendesk Support account with admin access

## Installation Steps

### 1. Package the App

```bash
cd zendesk-app
./package-app.sh
```

This creates `zendesk-calendar-app.zip`.

### 2. Upload to Zendesk

1. Log into Zendesk Admin Center
2. Navigate to: **Apps and integrations** → **Zendesk Support apps** → **Manage**
3. Click **Upload private app**
4. Select `zendesk-calendar-app.zip`
5. Click **Upload**

### 3. Configure API URL

1. After upload, click on the app settings
2. Set **API Server URL**:
   - Local development: `http://localhost:3001`
   - Production: `https://your-domain.onrender.com` (or your server URL)
3. Click **Update**

### 4. Install on Account

1. Click **Install**
2. Select your Zendesk account
3. Confirm installation

### 5. Verify Installation

1. Open any ticket in Zendesk Support
2. Look for **Calendar Booking System** in the right sidebar
3. You should see:
   - Booking type dropdown
   - Loading indicator

If the dropdown populates with booking types, installation is successful!

## Troubleshooting

### App doesn't appear in sidebar
- Refresh the ticket page
- Check if app is enabled for your account
- Verify app installed correctly in Manage Apps

### "Loading..." never completes
- Check API URL in app settings
- Verify backend server is running
- Open browser console for errors

### No booking types in dropdown
- Verify booking types exist in admin panel (`/admin`)
- Check backend server logs
- Ensure CORS allows Zendesk domains

### CORS errors in console
Backend should allow:
```javascript
origin: [
  process.env.CLIENT_URL || 'http://localhost:3000',
  /\.zendesk\.com$/,
  /\.zdassets\.com$/
]
```

### Booking fails
- Check Google Calendar is connected
- Verify OAuth tokens are valid
- Check backend logs for detailed errors

## Usage for Agents

1. Open any ticket
2. Find the app in right sidebar
3. Select a booking type from dropdown
4. Choose a date on calendar
5. Click an available time slot
6. Click **Confirm Booking**

The appointment is created in Google Calendar and linked to the ticket.

## Updating the App

To make changes:

1. Edit files in `zendesk-app/assets/`
2. Re-run `./package-app.sh`
3. Re-upload the zip to Zendesk
4. Agents refresh their browsers

## Support

See full documentation:
- `README.md` - Detailed app documentation
- `../README.md` - Complete system documentation
- `../PROJECT_STRUCTURE.md` - Architecture overview
