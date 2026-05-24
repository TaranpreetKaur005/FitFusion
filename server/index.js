require('dotenv').config({ path: '../.env' });

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const https    = require('https');
const fetch    = require('node-fetch');
const path     = require('path');
const supabase = require('./config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app    = express();
const PORT   = process.env.PORT || 3002;
const SECRET = process.env.JWT_SECRET || 'fitfusion_jwt_secret_change_in_production';

/* ── GEMINI CLIENT ── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function getToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  const cookies = parseCookies(req);
  return cookies.ff_session;
}

async function getUserFromToken(req) {
  const token = getToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, SECRET);
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', payload.id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

function setSessionCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('ff_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('ff_session', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
  });
}

async function requireAuth(req, res, next) {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

/* ══════════════════════════════
   AUTH ROUTES
══════════════════════════════ */

/* POST /api/signup */
app.post('/api/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (lookupError) {
    console.error('Signup lookup error:', lookupError);
    return res.status(500).json({ error: 'Unable to validate user.', details: lookupError });
  }

  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({ first_name, last_name, email, password: hashed })
    .select('id, first_name, last_name, email')
    .single();

  if (insertError || !user) {
    console.error('Signup insert error:', insertError);
    return res.status(500).json({ error: 'Could not create account.', details: insertError });
  }

  const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);
  res.status(201).json({ message: 'Account created successfully.', user });
});

/* POST /api/login */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, password')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Login lookup error:', error);
    return res.status(500).json({ error: 'Unable to validate credentials.', details: error });
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);
  res.json({ message: 'Signed in successfully.', user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
});

/* POST /api/google */
app.post('/api/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided.' });

  try {
    const payload = await new Promise((resolve, reject) => {
      const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
      https.get(url, r => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
          try {
            const p = JSON.parse(data);
            if (p.error) return reject(new Error(p.error));
            resolve(p);
          } catch {
            reject(new Error('Invalid token'));
          }
        });
      }).on('error', reject);
    });

    const { email, given_name, family_name, sub } = payload;
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      return res.status(500).json({ error: 'Unable to validate Google account.' });
    }

    let user = existingUser;
    let isNew = false;

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          first_name: given_name || 'Google',
          last_name: family_name || 'User',
          email,
          password: `google_${sub}`,
        })
        .select('id, first_name, last_name, email')
        .single();

      if (insertError || !newUser) {
        return res.status(500).json({ error: 'Could not create Google account.' });
      }

      user = newUser;
      isNew = true;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    setSessionCookie(res, token);

    res.json({ message: isNew ? 'Account created.' : 'Signed in.', isNew, user });
  } catch (err) {
    res.status(401).json({ error: 'Google sign-in failed. ' + err.message });
  }
});

app.get('/api/me', async (req, res) => {
  const user = await getUserFromToken(req);
  res.json({ user });
});

app.post('/api/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Signed out.' });
});

app.post('/api/outfit', requireAuth, async (req, res) => {
  const { gender, occasion, style, colors, budget, extras } = req.body;
  const user = req.user;

  const { error } = await supabase
    .from('outfit_prefs')
    .insert({
      user_id: user.id,
      gender,
      occasion,
      style,
      colors: JSON.stringify(colors),
      budget,
      extras,
    });

  if (error) {
    return res.status(500).json({ error: 'Could not save profile.' });
  }

  res.json({ message: 'Profile saved.', saved: true });
});

app.get('/api/saved-looks', requireAuth, async (req, res) => {
  const user = req.user;
  const { data, error } = await supabase
    .from('saved_looks')
    .select('id, look_data, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Could not load saved looks.', details: error });
  }

  res.json({ looks: data.map(row => ({ ...row.look_data, id: row.id.toString(), created_at: row.created_at, updated_at: row.updated_at })) });
});

app.post('/api/saved-looks', requireAuth, async (req, res) => {
  const user = req.user;
  const { look } = req.body;
  if (!look) return res.status(400).json({ error: 'Look data required.' });

  const { data, error } = await supabase
    .from('saved_looks')
    .insert({ user_id: user.id, look_data: look })
    .select('id, look_data, created_at, updated_at')
    .single();

  if (error || !data) {
    return res.status(500).json({ error: 'Could not save look.', details: error });
  }

  res.status(201).json({ look: { ...data.look_data, id: data.id.toString(), created_at: data.created_at, updated_at: data.updated_at } });
});

app.patch('/api/saved-looks/:id', requireAuth, async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { look } = req.body;
  if (!look) return res.status(400).json({ error: 'Look data required.' });

  const { data, error } = await supabase
    .from('saved_looks')
    .update({ look_data: look })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, look_data, created_at, updated_at')
    .single();

  if (error || !data) {
    return res.status(500).json({ error: 'Could not update look.' });
  }

  res.json({ look: { ...data.look_data, id: data.id.toString(), created_at: data.created_at, updated_at: data.updated_at } });
});

app.delete('/api/saved-looks/:id', requireAuth, async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const { error } = await supabase
    .from('saved_looks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return res.status(500).json({ error: 'Could not delete look.' });
  }

  res.json({ message: 'Deleted' });
});

/* ═════════════════════════════=
   GEMINI — OUTFIT ANALYSIS
   Accepts base64 image + returns structured analysis
══════════════════════════════ */
app.post('/api/analyze-outfit', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'Image data required.' });

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Strip data URL prefix to get pure base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType   = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    const prompt = `You are an expert fashion stylist. Analyze this outfit photo and respond ONLY with valid JSON in this exact format:
{
  "verdict": "emoji + short verdict (e.g. '✨ Great Style!')",
  "overall": number between 60-99,
  "color": number between 60-99,
  "fit": number between 60-99,
  "trend": number between 60-99,
  "working": ["point 1", "point 2", "point 3", "point 4"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Analyze: overall style score, colour harmony, fit & proportion, trend relevance.
Be specific, honest, and constructive. Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ analysis, provider: 'Gemini ' + GEMINI_MODEL });

  } catch (err) {
    console.error('Gemini analysis error:', err.message);
    // Return a structured fallback so the frontend still works
    res.json({
      fallback: true,
      analysis: {
        verdict: '✨ Great Style!',
        overall: 82, color: 79, fit: 85, trend: 80,
        working: [
          'Clean and cohesive overall look',
          'Good colour coordination',
          'Appropriate fit for the style',
          'Well-chosen pieces that work together'
        ],
        suggestions: [
          'Consider adding a statement accessory to elevate the look',
          'Experiment with layering for added depth',
          'A belt could help define the silhouette'
        ],
        tags: ['Casual', 'Cohesive', 'Wearable', 'Everyday']
      }
    });
  }
});

/* ══════════════════════════════
   GEMINI — OUTFIT CHAT
   Answers questions about the analysed outfit
══════════════════════════════ */
app.post('/api/chat-about-outfit', async (req, res) => {
  const { question, analysisContext } = req.body;
  if (!question) return res.status(400).json({ error: 'Question required.' });

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are an expert fashion stylist assistant for FitFusion. 
    
Here is the outfit analysis context:
${analysisContext || 'No analysis context provided.'}

The user asks: "${question}"

Give a helpful, specific, and friendly fashion advice response. 
Keep it concise (2-4 sentences). Use fashion expertise.
Do not use markdown headers. You can use **bold** for emphasis.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    res.json({ response, provider: 'Gemini ' + GEMINI_MODEL });

  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.json({
      fallback: true,
      response: `Great question! Based on your outfit analysis, I'd recommend focusing on the suggestions provided. For more specific advice, try asking about accessories, fit, colours, or a particular occasion.`
    });
  }
});

/* ══════════════════════════════
   POLLINATIONS.AI — IMAGE GENERATION PROXY
   Proxies the request server-side to avoid
   browser 403 / CORS issues with Pollinations
══════════════════════════════ */
app.get('/api/generate-image', async (req, res) => {
  const { prompt, negative, seed = Math.floor(Math.random() * 9999999) } = req.query;

  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const pollinationsUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=1024&seed=${seed}&model=flux&enhance=true&nologo=true` +
    (negative ? `&negative=${encodeURIComponent(negative)}` : '');

  try {
    // Stream the image directly from Pollinations to the browser
    const response = await fetch(pollinationsUrl, {
      headers: {
        'User-Agent': 'FitFusion/2.0',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe the image stream to the response
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error('Image generation error:', err.message);
    res.status(502).json({ error: 'Image generation failed: ' + err.message });
  }
});

/* ══════════════════════════════
   HEALTH CHECK
══════════════════════════════ */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    model: GEMINI_MODEL,
    port: PORT
  });
});

/* ── STATIC FRONTEND ── */
app.use(express.static(path.join(__dirname, '..')));

/* ── START ── */
app.listen(PORT, () => {
  console.log(`\n🔥 FitFusion API + frontend  →  http://localhost:${PORT}`);
  console.log(`   Gemini model   :  ${GEMINI_MODEL}`);
  console.log(`   POST  /api/signup`);
  console.log(`   POST  /api/login`);
  console.log(`   POST  /api/google`);
  console.log(`   POST  /api/analyze-outfit   ← Gemini vision`);
  console.log(`   POST  /api/chat-about-outfit ← Gemini chat`);
  console.log(`   GET   /api/generate-image   ← Pollinations.ai proxy`);
  console.log(`   GET   /api/health\n`);
});
