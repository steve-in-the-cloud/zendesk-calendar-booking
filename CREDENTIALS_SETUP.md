# Step-by-Step Credentials Setup

Follow this guide to obtain all required API credentials.

## Part 1: Google Calendar API Setup (15-20 minutes)

### Step 1: Access Google Cloud Console

1. Open your browser and go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. You should see the Google Cloud Console dashboard

### Step 2: Create a New Project

1. Click the **project dropdown** at the top of the page (next to "Google Cloud")
2. In the popup, click **"NEW PROJECT"** (top right)
3. Fill in the form:
   - **Project name:** `Zendesk Calendar Booking` (or any name you prefer)
   - **Organization:** Leave as default
   - **Location:** Leave as default
4. Click **"CREATE"**
5. Wait 10-20 seconds for the project to be created
6. You'll see a notification - click **"SELECT PROJECT"** or use the dropdown to switch to it

### Step 3: Enable Google Calendar API

1. In the left sidebar, click the hamburger menu (☰)
2. Navigate to: **APIs & Services** → **Library**
3. You'll see a search box at the top
4. Type: `Google Calendar API`
5. Click on **"Google Calendar API"** in the results
6. Click the blue **"ENABLE"** button
7. Wait a few seconds - you'll see "API enabled" confirmation

### Step 4: Configure OAuth Consent Screen

This tells users what your app does when they authorize it.

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** user type (unless you have Google Workspace)
3. Click **"CREATE"**

**Page 1 - App Information:**
- **App name:** `Calendar Booking System`
- **User support email:** Select your email from dropdown
- **App logo:** (optional - skip for now)
- **Application home page:** (optional - skip)
- **Application privacy policy:** (optional - skip)
- **Application terms of service:** (optional - skip)
- **Authorized domains:** (leave empty for now)
- **Developer contact information:** Enter your email
- Click **"SAVE AND CONTINUE"**

**Page 2 - Scopes:**
- Click **"ADD OR REMOVE SCOPES"**
- In the search box, type: `.../auth/calendar.readonly`
- Check the box for: `https://www.googleapis.com/auth/calendar.readonly`
- Also search and check: `.../auth/calendar.events`
- You should have 2 scopes selected
- Click **"UPDATE"** at the bottom
- Click **"SAVE AND CONTINUE"**

**Page 3 - Test Users:**
- Click **"+ ADD USERS"**
- Enter your Gmail address (the one you'll use for the calendar)
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**

**Page 4 - Summary:**
- Review everything
- Click **"BACK TO DASHBOARD"**

### Step 5: Create OAuth Credentials

Now we'll get your Client ID and Secret.

1. In the left sidebar, click **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Fill in the form:
   - **Application type:** Select **"Web application"**
   - **Name:** `Calendar Booking Web Client`

5. Under **"Authorized redirect URIs"**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3001/auth/google/callback`
   - Click **"ADD URI"** again (for production later)
   - Enter: `https://yourdomain.com/auth/google/callback` (you can change this later)

6. Click **"CREATE"**

### Step 6: Save Your Credentials

You'll see a popup with your credentials!

**IMPORTANT:** Copy these immediately:
- **Client ID** - looks like: `1234567890-abc123def456.apps.googleusercontent.com`
- **Client Secret** - looks like: `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`

**Save these somewhere safe!** You'll need them for your `.env` file.

✅ **Google Calendar API Setup Complete!**

---

## Part 2: Zendesk API Setup (5-10 minutes)

### Step 1: Access Zendesk Admin Center

1. Log into your Zendesk account: `https://your-subdomain.zendesk.com`
2. Click the **Admin** icon (gear icon ⚙️) in the left sidebar
3. Select **"Admin Center"**

### Step 2: Enable API Token Access

1. In Admin Center, navigate to:
   - **Apps and integrations** → **APIs** → **Zendesk API**
2. Click the **"Settings"** tab
3. Under **"Token Access"**, toggle the switch to **ON** (enabled)
4. Click **"Save"** at the bottom

### Step 3: Generate API Token

1. Still in the Zendesk API page, you should see **"Active API Tokens"**
2. Click **"+ Add API token"** button
3. Fill in:
   - **API token description:** `Calendar Booking System`
4. Click **"Create"**

**IMPORTANT:** A popup will show your API token:
- It looks like: `aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890`
- **Copy this immediately!** You can't see it again.
- Click **"Copy"** then click **"Save"**

### Step 4: Get Your Subdomain and Email

You need two more pieces of information:

**Subdomain:**
- Look at your Zendesk URL: `https://mycompany.zendesk.com`
- Your subdomain is: `mycompany`

**Admin Email:**
- The email address you use to log into Zendesk
- Usually shown in the top-right corner of Admin Center

✅ **Zendesk API Setup Complete!**

---

## Part 3: Create Your .env File

Now let's put it all together!

1. In your project folder, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor

3. Fill in the values:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Zendesk
ZENDESK_SUBDOMAIN=your_subdomain
ZENDESK_API_TOKEN=paste_your_api_token_here
ZENDESK_EMAIL=your_email@example.com

# Server (leave these as-is for now)
PORT=3001
CLIENT_URL=http://localhost:3000
```

4. Save the file

## Summary Checklist

✅ Google Cloud Project created
✅ Google Calendar API enabled
✅ OAuth consent screen configured
✅ OAuth credentials created (Client ID & Secret)
✅ Zendesk API token access enabled
✅ Zendesk API token generated
✅ `.env` file created and filled

## What You Should Have

- ✅ Google Client ID (long string ending in .apps.googleusercontent.com)
- ✅ Google Client Secret (starts with GOCSPX-)
- ✅ Zendesk Subdomain (e.g., "mycompany")
- ✅ Zendesk API Token (long random string)
- ✅ Zendesk Email (your admin email)

## Next Steps

Once your `.env` file is complete, run:

```bash
./start-dev.sh
```

Then visit `http://localhost:3000/admin` to connect your Google Calendar!

## Troubleshooting

**Can't find Google Cloud Console options:**
- Make sure you're logged into the correct Google account
- Try refreshing the page
- Check that you've selected your project (top dropdown)

**Zendesk options not showing:**
- Make sure you have Admin permissions
- Try the old Admin interface if new one doesn't show options
- Contact your Zendesk account owner if needed

**Need help?**
- Google Cloud Console: https://console.cloud.google.com/
- Zendesk Admin: https://your-subdomain.zendesk.com/admin
