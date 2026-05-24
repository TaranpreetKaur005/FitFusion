# FitFusion - AI-Powered Fashion Styling Platform

FitFusion is a premium AI-powered fashion platform that provides real-time style analysis, outfit generation, and personalized fashion recommendations using state-of-the-art AI models.

## 📂 Project Structure

```text
FitFusion/
├── index.html              # Main Landing Page
├── auth.html               # Authentication (Login/Signup)
├── analysis.html           # AI Outfit Analysis & Chat
├── stylist.html            # AI Outfit Generation
├── wardrobe.html           # Personal Collection & Saves
├── trending.html           # Fashion Trends & Inspiration
├── outfit.html             # User Style Profile
├── contact.html            # Contact & Support
├── faq.html                # Frequently Asked Questions
├── data.json               # Local Data Storage
├── vercel.json             # Vercel Deployment Config
├── assets/                 # Static Media Assets
│   └── hero.png            # Main Banner Image
├── src/                    # Frontend Resources
│   ├── scripts/            # Page-specific JS logic
│   │   ├── analysis.js
│   │   ├── auth.js
│   │   ├── contact.js
│   │   ├── faq.js
│   │   ├── outfit.js
│   │   ├── script.js
│   │   ├── stylist.js
│   │   ├── trending.js
│   │   └── wardrobe.js
│   └── styles/             # Component-specific CSS
│       ├── analysis.css
│       ├── auth.css
│       ├── contact.css
│       ├── faq.css
│       ├── outfit.css
│       ├── styles.css
│       ├── stylist.css
│       ├── trending.css
│       └── wardrobe.css
└── server/                 # Backend Node.js API
    ├── index.js            # Express Server Entry
    ├── db.js               # Database Utility
    ├── package.json        # Server Dependencies
    ├── api/                # AI & External API Handlers
    │   ├── gemini.js       # Google Gemini 1.5 Flash
    │   ├── openai.js       # OpenAI GPT-4o Backup
    │   ├── pollination.js  # Image Generation
    │   └── huggingface.js  # Backup Image Generation
    └── config/             # Backend Configuration
        ├── supabase.js     # Supabase Client
        └── schema.sql      # Database Schema
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A Supabase Account
- API Keys for AI services (at least Gemini)

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

### 3. Database Configuration
1. Create a project at [Supabase](https://supabase.com).
2. **Execute SQL Schema**: Copy the content of `server/config/schema.sql` and run it in your Supabase **SQL Editor**. 
   > [!IMPORTANT]
   > This step is required to create the necessary tables (`users`, `outfit_prefs`) for the application to function.
3. Obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings.


### 4. Environment Variables
Create a `.env` file in the `server/` directory:
```env
# Server Config
PORT=3002
JWT_SECRET=your_secure_random_string

# Supabase Config
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API Keys
GEMINI_API_KEY=your_google_ai_key
GEMINI_MODEL=gemini-2.0-flash (Optional)
POLLINATION_API_KEY=your_pollinations_key

OPENAI_API_KEY=your_openai_key (Optional)
HUGGINGFACE_API_KEY=your_huggingface_key (Optional)
```

> Note: If you have row-level security enabled in Supabase, the backend requires `SUPABASE_SERVICE_ROLE_KEY` for server-side writes and authenticated queries.

### 5. Running the Application

#### Start the Server:
```bash
cd server
npm run dev
```

#### Start the Client:
In a new terminal (project root):
```bash
npx serve
```
The application will be available at `http://localhost:3000` (or the port provided by `serve`).

## 🤖 AI Capabilities

- **Style Analysis**: Advanced vision-based analysis of outfits using Gemini 1.5 Flash.
- **AI Stylist Chat**: Interactive fashion advice with context-aware responses.
- **Outfit Generation**: Text-to-image generation for visualizing new looks.
- **Moodboards**: Theme-based style inspirations generated in real-time.
- **Multi-Provider Fallback**: Intelligent routing between Gemini, OpenAI, and HuggingFace for maximum reliability.

## 📡 API Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Auth | POST | `/api/signup` | Register new user |
| Auth | POST | `/api/login` | Authenticate user |
| Auth | POST | `/api/google` | Google OAuth Login |
| AI | POST | `/api/analyze-outfit` | Vision analysis of images |
| AI | POST | `/api/chat-about-outfit` | Interactive AI chat |
| AI | POST | `/api/generate-outfit` | Text-to-image generation |
| Data | POST | `/api/outfit` | Save style preferences |
| System | GET | `/api/health` | Check server/DB/AI status |

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), FontAwesome
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **AI Models**: 
  - Vision: Google Gemini 1.5 Flash
  - Text: OpenAI GPT-4o (Backup)
  - Image: Pollinations.ai (Flux/Turbo), HuggingFace (Backup)
- **Security**: JWT Authentication, Bcrypt Password Hashing

## 📝 License
This project is for educational and portfolio purposes.