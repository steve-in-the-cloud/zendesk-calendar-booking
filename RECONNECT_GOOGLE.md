# How to Reconnect Google Calendar on Render

## The Problem
Your Google OAuth token has expired or been revoked. This causes the error:
```
error: 'invalid_grant',
error_description: 'Token has been expired or revoked.'
```

## The Solution (Quick Fix)

### Step 1: Deploy Latest Changes
1. Go to your Render dashboard
2. Find your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (2-3 minutes)

### Step 2: Disconnect Google Calendar
1. Visit: `https://your-app.onrender.com/admin`
2. You'll see "✓ Connected to Google Calendar"
3. Click the **"Disconnect & Reconnect"** button
4. Confirm the disconnect

### Step 3: Reconnect Google Calendar
1. You'll now see "Not connected to Google Calendar"
2. Click **"Connect Google Calendar"**
3. Sign in with your Google account
4. Grant calendar permissions
5. You'll be redirected back to the admin panel

### Step 4: Select Your Calendar
1. After reconnecting, you'll see a dropdown
2. Select the calendar you want to use for bookings
3. It will save automatically

### Step 5: Test
1. Visit your booking widget URL
2. Select a date
3. You should now see available time slots! 🎉

## Alternative: Manual Database Reset (If disconnect button doesn't work)

If you deployed before I added the disconnect button, you can manually reset the tokens:

### Option A: Use the API directly
```bash
curl -X POST https://your-app.onrender.com/api/admin/disconnect
```

### Option B: Reset via Render Shell
1. Go to Render Dashboard → Your Service → Shell
2. Run:
```bash
sqlite3 /opt/render/project/data/calendar_booking.db "UPDATE admin_config SET google_refresh_token=NULL, google_access_token=NULL WHERE id=1"
```
3. Exit shell
4. Go to `/admin` and click "Connect Google Calendar"

## Why This Happens

Google OAuth tokens can expire or be revoked when:
- The token hasn't been used in a long time (6 months+)
- You changed your Google password
- You revoked access in Google account settings
- The OAuth app was in testing mode and the 7-day limit expired

## Preventing This in the Future

Once reconnected, the tokens should refresh automatically as long as the app is used regularly. The refresh token doesn't expire unless:
- Explicitly revoked by user
- Not used for 6 months
- Google account password changes

## Still Having Issues?

1. Check health status: `https://your-app.onrender.com/api/health/detailed`
2. Look for `"googleAuth": { "status": "ok" }`
3. Check Render logs for any other errors
4. Ensure your Google Cloud project OAuth consent screen is set to "Published" (not "Testing")
