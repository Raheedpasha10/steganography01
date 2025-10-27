# Database Setup Instructions

## Quick Start (Works Without Database!)

**The app now works perfectly without a database!** History is automatically saved to your browser's local storage. You can start using the app immediately.

## Optional: Set Up Supabase Database

If you want to use the cloud database for syncing history across devices:

### Step 1: Go to Your Supabase Dashboard

1. Visit: https://lyjhwoxkmyybetowqppr.supabase.co
2. Log in to your Supabase account
3. Select your project: `SteganoText Pro`

### Step 2: Run the SQL Script

1. In the Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `setup-database.sql`
4. Paste it into the SQL editor
5. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify the Setup

1. Go to **Table Editor** in the left sidebar
2. You should see a new table called `history`
3. Click on it to verify the columns:
   - id (uuid)
   - user_id (text)
   - action (text)
   - technique (text)
   - text_preview (text)
   - success (boolean)
   - created_at (timestamp)

### That's it!

The app will automatically detect the database and use it. If the database is not available, it will seamlessly fall back to local storage.

## Features

### With Database:
- ✅ History synced across all your devices
- ✅ Persistent history (doesn't clear when you clear browser data)
- ✅ Centralized data management

### With Local Storage (No Database):
- ✅ Works offline
- ✅ No setup required
- ✅ Privacy-focused (data stays on your device)
- ✅ Fast and responsive

## Troubleshooting

**Q: History not showing up?**
- Check browser console (F12) for errors
- If you see "Database not available", the app is using local storage (this is normal)
- Make sure you've encoded/decoded at least one message

**Q: Want to clear history?**
- Local storage: Clear browser data or open DevTools → Application → Local Storage → delete `steganotext_history`
- Database: Run in SQL Editor: `DELETE FROM history WHERE user_id = 'your-user-id';`

**Q: Migration from local to database?**
- Currently, you'll need to re-encode/decode messages after setting up the database
- Previous local history will remain in browser storage

