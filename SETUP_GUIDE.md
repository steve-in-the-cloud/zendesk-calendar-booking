# Complete Setup Guide

This guide walks you through setting up the Calendar Booking System from scratch.

## Part 1: Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Zendesk Calendar Booking")
5. Click "Create"

### Step 2: Enable Google Calendar API

1. In the Google Cloud Console, click on the hamburger menu (☰)
2. Navigate to **APIs & Services** > **Library**
3. In the search bar, type "Google Calendar API"
4. Click on "Google Calendar API"
5. Click the **Enable** button
6. Wait for it to enable (usually takes a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: "Calendar Booking System"
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Add or Remove Scopes**
7. Add these scopes:
   - `.../auth/calendar.readonly`
   - `.../auth/calendar.events`
8. Click **Update** then **Save and Continue**
9. Add test users (your email address)
10. Click **Save and Continue**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** at the top
3. Select **OAuth client ID**
4. Choose **Web application**
5. Enter a name: "Calendar Booking Web Client"
6. Under **Authorized redirect URIs**, click **+ Add URI**
7. Add: `http://localhost:3001/auth/google/callback`
8. For production, also add your production URL
9. Click **Create**
10. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately
11. Save these securely - you'll need them for the `.env` file

## Part 2: Zendesk Setup

### Step 1: Enable Zendesk API

1. Log into your Zendesk account as an admin
2. Click the **Admin** icon (gear icon) in the sidebar
3. Select **Admin Center**
4. Navigate to **Apps and integrations** > **APIs** > **Zendesk API**
5. Click the **Settings** tab
6. Under **Token Access**, toggle to enable it
7. Click **Save**

### Step 2: Generate API Token

1. Still in the Zendesk API settings page
2. Click the **+ Add API token** button
3. Enter a description: "Calendar Booking System"
4. Click **Create**
5. **IMPORTANT**: Copy the token immediately - you won't see it again
6. Save it securely

### Step 3: Get Your Subdomain

Your Zendesk subdomain is in your URL:
- If your Zendesk is `https://mycompany.zendesk.com`
- Your subdomain is `mycompany`

### Step 4: Verify Messaging is Enabled

1. In Admin Center, go to **Channels** > **Messaging and social**
2. Ensure Messaging is enabled
3. Note: You'll need this to test the conversation extension

## Part 3: Application Setup

### Step 1: Clone and Install

```bash
cd /path/to/project
npm install
cd client && npm install && cd ..
```

### Step 2: Create Environment File

Create `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Google Calendar API (from Step 4 of Google Cloud Setup)
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Zendesk (from Part 2)
ZENDESK_SUBDOMAIN=mycompany
ZENDESK_API_TOKEN=abc123def456ghi789jkl012
ZENDESK_EMAIL=admin@mycompany.com

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Step 3: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3001
Admin panel: http://localhost:3000/admin
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Browser should open to `http://localhost:3000`

## Part 4: Initial Configuration

### Step 1: Connect Google Calendar

1. Open `http://localhost:3000/admin` in your browser
2. Click the **Connect Google Calendar** button
3. You'll be redirected to Google
4. Select your Google account
5. Review the permissions (read/write calendar)
6. Click **Allow**
7. You'll be redirected back to the admin panel
8. You should see "✓ Connected to Google Calendar"

### Step 2: Select Calendar

1. In the admin panel, you'll see a dropdown with your calendars
2. Select the calendar you want to use for bookings
3. It will save automatically

### Step 3: Create Your First Booking Type

1. In the admin panel, click **+ Add Booking Type**
2. Fill in the form:
   - **Name**: "Demo Call" (or any name)
   - **Duration**: 30 (minutes)
   - **Description**: "Product demonstration call"
   - **Color**: Choose a color
3. Click **Create Booking Type**
4. The booking type will appear in the list
5. Copy the booking URL shown

## Part 5: Testing

### Test 1: Check Availability

1. Copy the booking URL from your booking type
2. Replace `CONVERSATION_ID` with any test ID (e.g., "test123")
3. Open the URL in a new browser tab
4. You should see:
   - The booking type name and description
   - A calendar for selecting dates
   - Available time slots for today (if within working hours)

### Test 2: Make a Test Booking

1. Select a date from the calendar
2. Choose an available time slot
3. Click **Confirm Booking**
4. You should see a success message
5. Check your Google Calendar - the event should appear

### Test 3: Verify Working Hours

1. Try selecting a date
2. You should only see slots between 9 AM - 5 PM
3. Weekends should show no available slots
4. Times when you have existing calendar events should be blocked

## Part 6: Zendesk Conversation Extension Setup

### Step 1: Create the Extension

1. In Zendesk Admin Center
2. Go to **Messaging** > **Conversation extensions**
3. Click **+ Add extension**
4. Choose **Link** type
5. Configure:
   - **Name**: "Book Appointment"
   - **Description**: "Schedule a call or meeting"
   - **URL**: Use your booking URL

   For development:
   ```
   http://localhost:3000/?bookingTypeId=1&conversationId={{ticket.id}}
   ```

   Replace `1` with your actual booking type ID

6. **Display settings**:
   - Choose when to show (e.g., "Always" or based on conditions)
   - Set icon and button text

7. Click **Save**

### Step 2: Test in Messaging

1. Go to your Zendesk Messaging widget
2. Start a conversation
3. You should see the "Book Appointment" button/link
4. Click it - the booking widget should open
5. Make a booking
6. The confirmation message should post to the conversation

**Note**: For localhost testing, you may need to use ngrok or similar tunneling service:

```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 3000

# Use the ngrok URL in your Zendesk extension
https://abcd1234.ngrok.io/?bookingTypeId=1&conversationId={{ticket.id}}
```

## Part 7: Production Deployment

### Update Configuration

1. Deploy backend to your hosting service (Heroku, AWS, etc.)
2. Deploy frontend (build and serve static files)
3. Update `.env` with production values:
   ```env
   GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
   CLIENT_URL=https://your-domain.com
   ```

4. Update Google Cloud Console:
   - Add production redirect URI to OAuth credentials
   - Publish OAuth consent screen (if needed)

5. Update Zendesk extension URL to production URL

### Security Checklist

- [ ] Never commit `.env` file
- [ ] Use HTTPS for all URLs
- [ ] Add rate limiting
- [ ] Implement admin authentication
- [ ] Set up proper CORS
- [ ] Enable database backups
- [ ] Monitor API usage
- [ ] Set up error logging

## Troubleshooting

### "Failed to load booking type"

- Check the `bookingTypeId` in the URL matches an existing booking type
- Verify the backend is running
- Check browser console for errors

### "Not connected to Google Calendar"

- Verify OAuth credentials in `.env`
- Check redirect URI matches exactly
- Try disconnecting and reconnecting

### "Failed to send Zendesk message"

- Verify API token is valid
- Check subdomain is correct
- Ensure the conversation ID is valid
- Test with Zendesk API directly

### No available slots showing

- Check if the date is a weekend
- Verify working hours in `server/googleCalendar.js`
- Check if calendar has events blocking the entire day
- Ensure booking duration isn't too long

### OAuth error "redirect_uri_mismatch"

- The redirect URI in Google Cloud Console must exactly match
- Check for typos
- Ensure protocol (http/https) matches
- Verify port number is included if using localhost

## Getting Help

If you encounter issues:

1. Check the server logs in Terminal 1
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all API credentials are valid
5. Test each API independently (Google, Zendesk)

## Next Steps

- Add more booking types for different services
- Customize working hours
- Set up email notifications
- Add admin authentication
- Configure timezone handling
- Set up monitoring and analytics
