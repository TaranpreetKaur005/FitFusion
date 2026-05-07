require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const https   = require('https');
const supabase = require('./config/supabase');
const GeminiAPI = require('./api/gemini');
const PollinationAPI = require('./api/pollination');
const OpenAIAPI = require('./api/openai');
const HuggingFaceAPI = require('./api/huggingface');

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'fitfusion_jwt_secret_change_in_production';

// Initialize AI APIs
let geminiAPI, pollinationAPI, openaiAPI, huggingfaceAPI;

// Initialize each API separately to handle individual failures
try {
  geminiAPI = new GeminiAPI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini API initialized');
} catch (error) {
  console.error('❌ Failed to initialize Gemini API:', error.message);
  geminiAPI = null;
}

try {
  pollinationAPI = new PollinationAPI(process.env.POLLINATION_API_KEY);
  console.log('✅ Pollination API initialized');
} catch (error) {
  console.error('❌ Failed to initialize Pollination API:', error.message);
  pollinationAPI = null;
}

try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiAPI = new OpenAIAPI(process.env.OPENAI_API_KEY);
    console.log('✅ OpenAI API initialized');
  } else {
    console.log('⚠️ OpenAI API key not provided');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI API:', error.message);
  openaiAPI = null;
}

try {
  if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here') {
    huggingfaceAPI = new HuggingFaceAPI(process.env.HUGGINGFACE_API_KEY);
    console.log('✅ Hugging Face API initialized');
  } else {
    console.log('⚠️ Hugging Face API key not provided');
  }
} catch (error) {
  console.error('❌ Failed to initialize Hugging Face API:', error.message);
  huggingfaceAPI = null;
}

console.log('✅ AI APIs initialization complete');
console.log(`   - Gemini: ${geminiAPI ? '✅' : '❌'}`);
console.log(`   - OpenAI: ${openaiAPI ? '✅' : '❌'}`);
console.log(`   - Pollination: ${pollinationAPI ? '✅' : '❌'}`);
console.log(`   - Hugging Face: ${huggingfaceAPI ? '✅' : '❌'}`);

app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── GOOGLE OAUTH ── */
// Verifies the Google ID token by calling Google's tokeninfo endpoint
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const payload = JSON.parse(data);
          if (payload.error) return reject(new Error(payload.error));
          resolve(payload);
        } catch { reject(new Error('Invalid token response')); }
      });
    }).on('error', reject);
  });
}

app.post('/api/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided.' });

  try {
    const payload = await verifyGoogleToken(credential);
    const { email, given_name, family_name, sub: google_id } = payload;

    // Upsert: find existing user or create new one
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    let user = data;
    let isNew = false;

    if (!user || error) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          first_name: given_name || 'Google',
          last_name: family_name || 'User',
          email: email,
          password: `google_${google_id}`
        })
        .select()
        .single();
      
      user = newUser;
      isNew = true;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({
      message: isNew ? 'Account created.' : 'Signed in.',
      token,
      isNew,
      user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }
    });
  } catch (err) {
    res.status(401).json({ error: 'Google sign-in failed. ' + err.message });
  }
});

/* ── POST /api/signup ── */
app.post('/api/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
    
  if (existing)
    return res.status(409).json({ error: 'Email already registered.' });

  const hashed = bcrypt.hashSync(password, 10);
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      first_name,
      last_name,
      email,
      password: hashed
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to create user.' });
  }

  const token = jwt.sign({ id: newUser.id, email }, SECRET, { expiresIn: '7d' });
  res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: { id: newUser.id, first_name, last_name, email }
  });
});

/* ── POST /api/login ── */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
    
  if (!user || error || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({
    message: 'Signed in successfully.',
    token,
    user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }
  });
});


/* ── POST /api/outfit — save user outfit preferences ── */
app.post('/api/outfit', async (req, res) => {
  const { user_id, occasion, style, colors, budget, gender, extras } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });

  const { data, error } = await supabase
    .from('outfit_prefs')
    .insert({
      user_id,
      occasion,
      style,
      colors: JSON.stringify(colors),
      budget,
      gender,
      extras
    })
    .select()
    .single();
    
  if (error) {
    return res.status(500).json({ error: 'Failed to save preferences.' });
  }
    
  res.status(201).json({ message: 'Preferences saved.', id: data.id });
});

/* ── POST /api/analyze-outfit ── */
app.post('/api/analyze-outfit', async (req, res) => {
  const { image, analysisContext } = req.body;
  
  if (!image || !analysisContext) {
    return res.status(400).json({ error: 'Image and analysis context are required.' });
  }

  try {
    // Try Gemini API first
    if (geminiAPI) {
      try {
        const analysis = await geminiAPI.analyzeOutfit(image, analysisContext);
        res.json({ success: true, analysis, provider: 'gemini' });
        return;
      } catch (geminiError) {
        console.log('Gemini API failed, trying OpenAI backup...');
        // Fall back to OpenAI if available
        if (openaiAPI) {
          try {
            const analysis = await openaiAPI.analyzeOutfit(image, analysisContext);
            res.json({ success: true, analysis, provider: 'openai', fallback: true });
            return;
          } catch (openaiError) {
            console.log('OpenAI API also failed, using deterministic fallback...');
            // Both APIs failed, use deterministic fallback
            const fallbackAnalysis = getDeterministicAnalysis(image, analysisContext);
            res.json({ 
              success: true, 
              analysis: fallbackAnalysis, 
              provider: 'deterministic', 
              fallback: true,
              message: 'AI services temporarily unavailable. Showing basic style analysis.'
            });
            return;
          }
        }
      }
    }
    
    // If no APIs available, use deterministic fallback
    const fallbackAnalysis = getDeterministicAnalysis(image, analysisContext);
    res.json({ 
      success: true, 
      analysis: fallbackAnalysis, 
      provider: 'deterministic', 
      fallback: true,
      message: 'AI services temporarily unavailable. Showing basic style analysis.'
    });
  } catch (error) {
    console.error('Analysis error:', error);
    // Even on system error, try to provide deterministic analysis
    const fallbackAnalysis = getDeterministicAnalysis(image, analysisContext);
    res.json({ 
      success: true, 
      analysis: fallbackAnalysis, 
      provider: 'deterministic', 
      fallback: true,
      message: 'AI services temporarily unavailable. Showing basic style analysis.'
    });
  }
});

/* ── DETERMINISTIC FALLBACK ANALYSIS ── */
function getDeterministicAnalysis(imageData, analysisContext) {
  // Create a basic style analysis without AI
  const timestamp = new Date().toISOString();
  const imageHash = imageData.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '');
  
  // Generate pseudo-random but consistent scores based on image hash
  const seed = imageHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const overall = 65 + (seed % 25); // 65-90
  const color = 60 + ((seed * 2) % 30); // 60-90
  const fit = 70 + ((seed * 3) % 20); // 70-90
  const trend = 55 + ((seed * 4) % 35); // 55-90
  
  const workingPoints = [
    "Outfit shows good coordination between pieces",
    "Color combination works well together",
    "Overall appearance is put-together",
    "Style choice is appropriate for the context"
  ];
  
  const improvementPoints = [
    "Consider adding accessories to complete the look",
    "Try experimenting with different layering techniques",
    "Small adjustments could enhance the overall fit",
    "Consider the occasion when selecting pieces"
  ];
  
  const styleTags = ["casual", "modern", "versatile", "clean", "coordinated"];
  
  return {
    overall: overall,
    color: color,
    fit: fit,
    trend: trend,
    working: workingPoints.slice(0, 3),
    suggestions: improvementPoints.slice(0, 3),
    tags: styleTags.slice(0, 4),
    verdict: overall >= 80 ? '🔥 Great Style!' : '✨ Solid Look!',
    timestamp: timestamp,
    analysisType: "deterministic",
    disclaimer: "This is a basic style analysis provided as a fallback when AI services are unavailable."
  };
}

/* ── POST /api/chat-about-outfit ── */
app.post('/api/chat-about-outfit', async (req, res) => {
  const { question, analysisContext, previousMessages = [] } = req.body;
  
  if (!question || !analysisContext) {
    return res.status(400).json({ error: 'Question and analysis context are required.' });
  }

  try {
    // Try Gemini API first
    if (geminiAPI) {
      try {
        const response = await geminiAPI.chatAboutOutfit(question, analysisContext, previousMessages);
        res.json({ success: true, response, provider: 'gemini' });
        return;
      } catch (geminiError) {
        console.log('Gemini API failed, trying OpenAI backup...');
        // Fall back to OpenAI if available
        if (openaiAPI) {
          const response = await openaiAPI.chatAboutOutfit(question, analysisContext, previousMessages);
          res.json({ success: true, response, provider: 'openai', fallback: true });
          return;
        }
      }
    }
    
    // If no APIs available, return error
    res.status(503).json({ error: 'No AI APIs available. Please check API key configuration.' });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI response.' });
  }
});

/* ── POST /api/generate-outfit ── */
app.post('/api/generate-outfit', async (req, res) => {
  const { prompt, style = 'photorealistic', width = 512, height = 768 } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // Try Pollination API first
    if (pollinationAPI) {
      try {
        const result = await pollinationAPI.generateOutfitImage(prompt, style, width, height);
        res.json({ success: true, ...result, provider: 'pollination' });
        return;
      } catch (pollinationError) {
        console.log('Pollination API failed, trying Hugging Face backup...');
        // Fall back to Hugging Face if available
        if (huggingfaceAPI) {
          const result = await huggingfaceAPI.generateOutfitImage(prompt, style, width, height);
          res.json({ success: true, ...result, provider: 'huggingface', fallback: true });
          return;
        }
      }
    }
    
    // If no APIs available, return error
    res.status(503).json({ error: 'No image generation APIs available. Please check API key configuration.' });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate outfit image.' });
  }
});

/* ── POST /api/generate-moodboard ── */
app.post('/api/generate-moodboard', async (req, res) => {
  const { theme, style, items = [] } = req.body;
  
  if (!theme || !style) {
    return res.status(400).json({ error: 'Theme and style are required.' });
  }

  try {
    // Try Pollination API first
    if (pollinationAPI) {
      try {
        const result = await pollinationAPI.generateStyleMoodboard(theme, style, items);
        res.json({ success: true, ...result, provider: 'pollination' });
        return;
      } catch (pollinationError) {
        console.log('Pollination API failed, trying Hugging Face backup...');
        // Fall back to Hugging Face if available
        if (huggingfaceAPI) {
          const result = await huggingfaceAPI.generateMoodboard(theme, style, items);
          res.json({ success: true, ...result, provider: 'huggingface', fallback: true });
          return;
        }
      }
    }
    
    // If no APIs available, return error
    res.status(503).json({ error: 'No image generation APIs available. Please check API key configuration.' });
  } catch (error) {
    console.error('Moodboard generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate moodboard.' });
  }
});

/* ── GET /api/health ── */
app.get('/api/health', (_req, res) => res.json({ 
  status: 'ok', 
  db: 'Supabase',
  ai: {
    gemini: !!geminiAPI,
    pollination: !!pollinationAPI
  }
}));

app.listen(PORT, () => {
  console.log(`\n🔥 FitFusion API  →  http://localhost:${PORT}`);
  console.log(`   POST   /api/signup`);
  console.log(`   POST   /api/login`);
  console.log(`   POST   /api/outfit`);
  console.log(`   POST   /api/analyze-outfit`);
  console.log(`   POST   /api/chat-about-outfit`);
  console.log(`   POST   /api/generate-outfit`);
  console.log(`   POST   /api/generate-moodboard`);
  console.log(`   GET    /api/health`);
});
