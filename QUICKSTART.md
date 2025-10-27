# 🚀 Quick Start Guide

Get SteganoText Pro running in **2 minutes**!

## Step 1: Clone & Install

```bash
git clone https://github.com/Raheedpasha10/steganography01.git
cd steganography01/Steg2
npm install
```

## Step 2: Run!

```bash
npm run dev
```

That's it! Open **http://localhost:3000** 🎉

## Optional: Cloud Sync Setup

Want history to sync across devices? 

1. **Get Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create a free project
   - Copy URL & anon key from Settings → API

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Create database table:**
   - Open Supabase SQL Editor
   - Run the SQL from `setup-database.sql`
   - Run `fix-rls-policies.sql`

Done! Your history will now sync to the cloud ☁️

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Dependencies issue?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Need help?** Check the full [README.md](README.md)

---

**Enjoy hiding your secrets!** 🔒✨
