# Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed. Here's what to do next:

## Step 1: Configure API Credentials

You need to set up credentials for Google Calendar and Zendesk:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

### Required Credentials:

**Google Calendar API:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GOOGLE_REDIRECT_URI` - Keep as `http://localhost:3001/auth/google/callback`

**Zendesk:**
- `ZENDESK_SUBDOMAIN` - Your Zendesk subdomain (e.g., "mycompany")
- `ZENDESK_API_TOKEN` - Generated in Zendesk Admin
- `ZENDESK_EMAIL` - Your Zendesk admin email

📖 See `SETUP_GUIDE.md` for detailed instructions on obtaining these credentials.

## Step 2: Run the Application

### Option A: Use the Start Script (Recommended)

```bash
./start-dev.sh
```

This will:
- Automatically use Node v22
- Start both backend and frontend
- Open the app in your browser

### Option B: Manual Start

Run in two separate terminals:

**Terminal 1 - Backend:**
```bash
nvm use 22
npm run dev
```

**Terminal 2 - Frontend:**
```bash
nvm use 22
cd client
npm start
```

## Step 3: Configure the Application

1. Open `http://localhost:3000/admin` in your browser
2. Click "Connect Google Calendar"
3. Authorize the application
4. Select which calendar to use
5. Create your first booking type

## URLs

- **Frontend (End User):** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin`
- **Backend API:** `http://localhost:3001`

## Booking Widget URL Format

```
http://localhost:3000/?bookingTypeId=1&conversationId=CONVERSATION_ID
```

Replace:
- `1` with your actual booking type ID
- `CONVERSATION_ID` with the Zendesk conversation ID (use `{{ticket.id}}` in Zendesk)

## Common Issues

### "Module not found" errors
Make sure you're using Node v22:
```bash
nvm use 22
```

### ".env file not found"
Copy and configure the environment file:
```bash
cp .env.example .env
# Then edit .env with your credentials
```

### Port already in use
If ports 3000 or 3001 are in use, you can change them in `.env`:
```env
PORT=3002  # Backend port
```

For frontend port, edit `client/package.json` and add:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

## Next Steps

1. ✅ Install dependencies (Done!)
2. ⚠️ Configure `.env` file
3. 🚀 Run the application
4. 🔧 Configure via admin panel
5. 🔗 Integrate with Zendesk

Need help? Check `SETUP_GUIDE.md` for detailed instructions!
