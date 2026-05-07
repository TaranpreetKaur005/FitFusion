# FitFusion - AI-Powered Fashion Styling Platform

## Project Structure

```
FitFusion/
├── src/
│   ├── pages/           # HTML files
│   │   ├── index.html
│   │   ├── analysis.html
│   │   ├── stylist.html
│   │   ├── wardrobe.html
│   │   ├── trending.html
│   │   ├── auth.html
│   │   ├── contact.html
│   │   ├── faq.html
│   │   └── outfit.html
│   ├── styles/          # CSS files
│   │   ├── styles.css
│   │   ├── analysis.css
│   │   ├── auth.css
│   │   ├── contact.css
│   │   ├── faq.css
│   │   ├── outfit.css
│   │   ├── stylist.css
│   │   ├── trending.css
│   │   └── wardrobe.css
│   ├── scripts/         # JavaScript files
│   │   ├── script.js
│   │   ├── analysis.js
│   │   ├── auth.js
│   │   ├── contact.js
│   │   ├── faq.js
│   │   ├── outfit.js
│   │   ├── stylist.js
│   │   ├── trending.js
│   │   └── wardrobe.js
│   ├── components/      # Reusable components
│   └── utils/          # Utility functions
├── server/
│   ├── api/            # API handlers
│   │   ├── gemini.js     # Google Gemini AI integration
│   │   └── pollination.js # Image generation API
│   ├── config/          # Configuration files
│   ├── db.js           # Database setup
│   ├── index.js        # Main server file
│   ├── package.json     # Dependencies
│   └── .env           # Environment variables
├── assets/             # Static assets
└── vercel.json         # Deployment config
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Supabase Database
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Supabase settings
3. Run the SQL schema from `server/config/schema.sql` in your Supabase SQL Editor

### 3. Configure Environment Variables
Update `server/.env` with your actual API keys:
```env
# Google Generative AI (Gemini) API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Pollination.ai API Key (for image generation)
POLLINATION_API_KEY=your_pollination_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3001
JWT_SECRET=fitfusion_jwt_secret_change_in_production
```

### 4. Start Development Server
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Open Application
Open any HTML file from `src/pages/` directory in your browser, or use a live server extension.

## 🤖 AI Features

### Google Gemini AI Integration
- **Outfit Analysis**: Real-time AI-powered style analysis
- **Chat Functionality**: Interactive Q&A about outfit recommendations
- **Natural Language Processing**: Understands user queries about fashion

### Pollination.ai Integration
- **Image Generation**: Create outfit visualizations
- **Style Moodboards**: Generate fashion inspiration
- **Accessory Suggestions**: AI-powered accessory recommendations

## 📡 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/google` - Google OAuth

### AI Services
- `POST /api/analyze-outfit` - Analyze outfit with Gemini AI
- `POST /api/chat-about-outfit` - Chat about outfit analysis
- `POST /api/generate-outfit` - Generate outfit images
- `POST /api/generate-moodboard` - Generate style moodboards

### User Data
- `POST /api/outfit` - Save outfit preferences

### Health Check
- `GET /api/health` - Server health status

## 🎨 Key Features

### Style Analysis Page (`src/pages/analysis.html`)
- Upload outfit photos for AI analysis
- Get detailed style scores (overall, color, fit, trend)
- Interactive chat with AI stylist
- Real-time recommendations

### AI Stylist Page (`src/pages/stylist.html`)
- Generate outfit ideas with AI
- Create custom style recommendations
- Visual outfit generation

### Wardrobe Management (`src/pages/wardrobe.html`)
- Track personal wardrobe items
- Organize by category and style
- AI-powered outfit suggestions

## � Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design
- Modern UI/UX patterns

### Backend
- Node.js with Express.js
- Supabase database (PostgreSQL)
- JWT authentication
- RESTful API design

### AI/ML Integration
- Google Generative AI (Gemini 1.5 Flash)
- Pollination.ai for image generation
- Real-time AI chat functionality

## 📝 Development Notes

### File Organization
- All HTML files are in `src/pages/`
- All CSS files are in `src/styles/`
- All JavaScript files are in `src/scripts/`
- API handlers are in `server/api/`

### Database Migration
- Migrated from SQLite to Supabase (PostgreSQL)
- All database queries now use Supabase client
- Row Level Security (RLS) policies implemented
- SQL schema available in `server/config/schema.sql`

### API Integration
- The analysis page now uses Gemini API instead of deterministic responses
- Image generation uses Pollination.ai for outfit visualizations
- Fallback mechanisms ensure functionality even when APIs are unavailable

### Environment Configuration
- All sensitive data is stored in environment variables
- API keys are never committed to version control
- Development and production configurations are separate