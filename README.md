# SteganoText Pro 🔒

A modern, feature-rich text steganography platform built with Next.js 14, featuring 8 advanced encoding techniques, AI-powered suggestions, and cloud-based history tracking.

## ✨ Features

### 🎯 Core Functionality
- **8 Steganography Techniques:**
  - Zero-Width Characters
  - Whitespace Encoding
  - Homoglyph Substitution
  - Unicode Normalization
  - Synonym Replacement
  - Character Frequency
  - Punctuation Variation
  - Invisible Ink

### 🤖 AI-Powered Features
- Smart auto-detection of hidden messages
- Intelligent technique recommendations
- Context-aware capacity suggestions
- One-shot auto-fill for cover text

### 💾 Data Management
- Supabase cloud database integration
- Local storage fallback
- Cross-device history synchronization
- Comprehensive activity tracking

### 🎨 Modern UI/UX
- Emergent-style design with smooth animations
- Responsive 2-column layout
- Dark mode support
- Clean inline suggestions
- Paste & Clear buttons for convenience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, works with local storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/Raheedpasha10/steganography01.git
cd steganography01/Steg2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials (optional)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** The app works perfectly without any configuration! Supabase setup is optional for cloud sync.

## 🗄️ Database Setup (Optional)

The app works perfectly without database setup using browser localStorage. For cloud sync across devices:

### 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from Settings → API

### 2. Configure Environment
Edit your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Create Database Table

Go to your Supabase SQL Editor and run:

```sql
-- See setup-database.sql for the complete SQL
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  technique TEXT NOT NULL,
  text_preview TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then run the RLS policies from `fix-rls-policies.sql`.

**That's it!** The app will automatically use the database.

## 📖 Usage

### Encoding a Message

1. Navigate to **Encode** page
2. Enter your **cover text** (the visible message)
3. Enter your **secret message** (to hide)
4. Select a **steganography technique**
5. Click **Encode**
6. Copy the encoded text!

**AI Features:**
- If cover text is too short, click **Auto-Fill** button
- Get intelligent technique recommendations
- See real-time capacity indicators

### Decoding a Message

1. Navigate to **Decode** page
2. Paste the **encoded text**
3. Click **Auto-Detect** or select technique manually
4. View your **decoded message**!

**Smart Detection:**
- Tries both compressed & uncompressed
- Tests all 8 techniques automatically
- Shows confidence scores

## 🏗️ Project Structure

```
Steg2/
├── app/
│   ├── api/
│   │   └── history/          # History API routes
│   ├── dashboard/            # Main dashboard
│   ├── encode/              # Encoding interface
│   ├── decode/              # Decoding interface
│   ├── history/             # History page
│   ├── login/               # Authentication
│   └── signup/
├── components/
│   ├── CleanSuggestions.jsx # AI suggestion component
│   ├── AnimatedCard.jsx     # Animated UI cards
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── stego/               # 8 steganography techniques
│   ├── ai-detection.js      # AI detection logic
│   ├── auto-extend.js       # Auto-fill logic
│   ├── local-history.js     # Local storage fallback
│   └── supabase.js          # Database client
├── setup-database.sql       # Database setup
└── fix-rls-policies.sql     # Security policies
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18
- **Styling:** Tailwind CSS, Shadcn UI
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude (detection)
- **Compression:** pako (gzip)

## 🔒 Security

- Row-Level Security (RLS) enabled
- HTTPS/TLS encryption
- JWT authentication
- Only metadata stored (not secret messages)
- Client-side encoding/decoding

## 📊 Storage & Costs

### Free Tier (Default)
- **Database:** 500 MB (using ~0.004%)
- **API Calls:** 50,000/month
- **Cost:** $0.00 forever (for personal use)

### What's Stored
```json
{
  "action": "encode",
  "technique": "zero-width",
  "text_preview": "First 100 chars...",
  "success": true,
  "timestamp": "2025-10-26T..."
}
```

**NOT stored:** Your secret messages, full texts, or sensitive data.

## 🎯 Key Features Explained

### Auto-Fill
Intelligently generates contextual text to meet capacity requirements in **one click**.

### Dual Storage
- Tries Supabase database first
- Falls back to localStorage automatically
- Works offline seamlessly

### Smart Detection
- Tests all techniques with both compression modes
- Validates message quality
- Returns confidence scores

### Clean UI
- No intrusive toast notifications
- Context-aware inline suggestions
- Smooth animations and transitions

## 📝 Environment Variables

Create `.env.local` (optional, credentials are embedded):

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 🐛 Troubleshooting

**History not showing?**
- Run `fix-rls-policies.sql` in Supabase
- Check browser console for errors
- Verify localStorage: `localStorage.getItem('steganotext_history')`

**Decode showing garbage?**
- Make sure you're using the same technique
- Try Auto-Detect instead
- Check if compression was used during encoding

**App not starting?**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## 📜 License

MIT License - feel free to use for personal or commercial projects.

## 👤 Author

**Raheed Pasha**
- GitHub: [@Raheedpasha10](https://github.com/Raheedpasha10)

## 🙏 Acknowledgments

- Supabase for database infrastructure
- Shadcn for beautiful UI components
- Anthropic for AI capabilities

---

**Built with ❤️ using Next.js and modern web technologies.**

For detailed setup instructions, see `DATABASE_SETUP.md`.
