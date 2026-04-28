# Render Deployment Troubleshooting Guide

## Quick Diagnostics

### 1. Check Health Status
Visit your deployed app at: `https://your-app.onrender.com/api/health/detailed`

This will show you:
- ✅ Database connection status
- ✅ Database tables existence
- ✅ Google Calendar authentication status
- ✅ Environment variables configuration
- ✅ Active booking types count

### 2. Common Issues & Solutions

#### Issue: No available dates showing

**Possible Causes:**

1. **Google Calendar not authenticated**
   - Visit: `https://your-app.onrender.com/admin`
   - Click "Connect Google Calendar"
   - Complete OAuth flow
   - Select your calendar

2. **Missing environment variables on Render**
   - Go to Render Dashboard → Your Service → Environment
   - Ensure these are set:
     ```
     GOOGLE_CLIENT_ID=your_actual_client_id
     GOOGLE_CLIENT_SECRET=your_actual_client_secret
     GOOGLE_REDIRECT_URI=https://your-app.onrender.com/auth/google/callback
     NODE_ENV=production
     CLIENT_URL=https://your-app.onrender.com
     ```

3. **Database not initialized**
   - Check logs for "Database initialized successfully"
   - If missing, restart the service
   - Ensure persistent disk is configured at `/opt/render/project/data`

4. **Timezone issues**
   - Fixed in latest code (uses UTC)
   - Redeploy after pulling latest changes

#### Issue: Database errors

**Solution:**
1. Check if persistent disk is configured:
   - Render Dashboard → Your Service → Disks
   - Should have a disk mounted at `/opt/render/project/data`
   
2. If no disk configured:
   - Add a new disk (minimum 1GB)
   - Set mount path: `/opt/render/project/data`
   - Redeploy the service

#### Issue: Google Calendar API errors

**Solution:**
1. Verify OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services → Credentials
   - Check that your OAuth 2.0 Client ID has:
     - Authorized redirect URI: `https://your-app.onrender.com/auth/google/callback`
     - Calendar API is enabled

2. Re-authenticate:
   - Visit `/admin` on your deployed app
   - Disconnect and reconnect Google Calendar

### 3. View Logs

On Render:
1. Go to your service dashboard
2. Click "Logs" tab
3. Look for:
   - "=== Getting Available Slots ===" messages
   - Error messages
   - Database initialization messages

Key log patterns to search for:
- `Database initialized successfully` - Database setup
- `=== Getting Available Slots ===` - Availability checks
- `Found X calendar events` - Google Calendar connection
- `Generated X available slots` - Slot calculation

### 4. Test Locally First

Before debugging on Render, test locally:

```bash
# Start the server
npm run dev

# In another terminal, test availability
curl "http://localhost:3001/api/health/detailed" | json_pp

# Check availability for a date
curl "http://localhost:3001/api/availability?start=2026-04-29T00:00:00.000Z&end=2026-04-29T23:59:59.999Z&duration=30" | json_pp
```

## Step-by-Step Render Setup

1. **Fork/Push code to GitHub**
   - Ensure latest code is pushed

2. **Create Render service**
   - New → Web Service
   - Connect your repository
   - Settings:
     - Build Command: `npm install && cd client && npm install && npm run build && cd ..`
     - Start Command: `node server/start-with-migration.js`
     - Instance Type: Free or Starter

3. **Add Persistent Disk**
   - Go to service → Disks tab
   - Add disk: 1GB minimum
   - Mount path: `/opt/render/project/data`

4. **Configure Environment Variables**
   - Go to service → Environment tab
   - Add all variables from `.env` file
   - **Important:** Update `GOOGLE_REDIRECT_URI` to your Render URL

5. **Deploy**
   - Click "Manual Deploy" → Deploy latest commit

6. **Authenticate Google Calendar**
   - Visit `https://your-app.onrender.com/admin`
   - Click "Connect Google Calendar"
   - Authorize and select calendar

7. **Create Booking Type**
   - In admin panel, create at least one booking type
   - Example: "30-minute Consultation", 30 minutes

8. **Test**
   - Visit the booking widget
   - Select a date
   - Verify available slots appear

## Getting Help

If issues persist:
1. Check `/api/health/detailed` output
2. Copy relevant error logs from Render
3. Check that all environment variables are set correctly
4. Verify Google Calendar API quotas haven't been exceeded
