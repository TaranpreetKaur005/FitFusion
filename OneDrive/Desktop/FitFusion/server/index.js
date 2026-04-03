const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const https   = require('https');
const db      = require('./db');

const app    = express();
const PORT   = 3001;
const SECRET = 'fitfusion_jwt_secret_change_in_production';

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
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    let isNew = false;

    if (!user) {
      const result = db.prepare(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)'
      ).run(given_name || 'Google', family_name || 'User', email, `google_${google_id}`);
      user = { id: result.lastInsertRowid, first_name: given_name || 'Google', last_name: family_name || 'User', email };
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
app.post('/api/signup', (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing)
    return res.status(409).json({ error: 'Email already registered.' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)'
  ).run(first_name, last_name, email, hashed);

  const token = jwt.sign({ id: result.lastInsertRowid, email }, SECRET, { expiresIn: '7d' });
  res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: { id: result.lastInsertRowid, first_name, last_name, email }
  });
});

/* ── POST /api/login ── */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({
    message: 'Signed in successfully.',
    token,
    user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }
  });
});

/* ── GET /api/users (admin) ── */
app.get('/api/users', (_req, res) => {
  const users = db.prepare(
    'SELECT id, first_name, last_name, email, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json({ count: users.length, users });
});

/* ── DELETE /api/users/:id ── */
app.delete('/api/users/:id', (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: 'User not found.' });
  res.json({ message: 'User deleted.' });
});

/* ── POST /api/outfit — save user outfit preferences ── */
app.post('/api/outfit', (req, res) => {
  const { user_id, occasion, style, colors, budget, gender, extras } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS outfit_prefs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      occasion   TEXT,
      style      TEXT,
      colors     TEXT,
      budget     TEXT,
      gender     TEXT,
      extras     TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const result = db.prepare(
    `INSERT INTO outfit_prefs (user_id, occasion, style, colors, budget, gender, extras)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(user_id, occasion, style, JSON.stringify(colors), budget, gender, extras);

  res.status(201).json({ message: 'Preferences saved.', id: result.lastInsertRowid });
});

/* ── GET /api/health ── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'fitfusion.db' }));

app.listen(PORT, () => {
  console.log(`\n🔥 FitFusion API  →  http://localhost:${PORT}`);
  console.log(`   POST   /api/signup`);
  console.log(`   POST   /api/login`);
  console.log(`   GET    /api/users   (admin viewer)`);
  console.log(`   DELETE /api/users/:id`);
  console.log(`   GET    /api/health\n`);
});
