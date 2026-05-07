/* ══════════════════════════════
   API CONFIG
   On Vercel (static deploy) there is no backend.
   We detect this and fall back to client-side
   localStorage auth so the site works fully.
══════════════════════════════ */
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const API = IS_LOCAL ? 'http://localhost:3001/api' : null;

/* ─────────────────────────────────────────
   GOOGLE SIGN-IN
   Google OAuth requires a real HTTP server
   (http://localhost or a deployed domain).
   Opening index.html as file:/// will always
   fail. Two options:
     1. Run: npx serve . (then open http://localhost:3000)
     2. Use the demo mock below for local testing
───────────────────────────────────────── */
function isFileProtocol() {
  return location.protocol === 'file:';
}

function triggerGoogleSignIn() {
  if (isFileProtocol()) {
    // Show a modal explaining the requirement
    showGoogleModal();
    return;
  }
  if (typeof google === 'undefined') {
    showToast('Google SDK not loaded.', 'error');
    return;
  }
  google.accounts.id.prompt();
}

/* ── GOOGLE REQUIREMENT MODAL ── */
function showGoogleModal() {
  const existing = document.getElementById('google-modal');
  if (existing) { existing.classList.add('open'); return; }

  const modal = document.createElement('div');
  modal.id = 'google-modal';
  modal.className = 'g-modal open';
  modal.innerHTML = `
    <div class="g-modal-box">
      <div class="g-modal-icon">🔒</div>
      <h3>Google Sign-In requires a server</h3>
      <p>Google OAuth doesn't work when opening HTML files directly (<code>file:///</code>). You need to serve the project over HTTP.</p>
      <div class="g-modal-steps">
        <div class="g-step"><span class="g-step-num">1</span><span>Open a terminal in your project folder</span></div>
        <div class="g-step"><span class="g-step-num">2</span><code>npx serve .</code></div>
        <div class="g-step"><span class="g-step-num">3</span><span>Open <strong>http://localhost:3000</strong> in your browser</span></div>
      </div>
      <p class="g-modal-alt">Or use the email sign-in below — it works perfectly right now.</p>
      <button class="g-modal-close">Got it</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.g-modal-close').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
}

/* ── GOOGLE SDK INIT (only when served over HTTP) ── */
window.addEventListener('load', () => {
  if (isFileProtocol() || typeof google === 'undefined') return;
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    callback: handleGoogleCredential,
    auto_select: false,
  });
});

async function handleGoogleCredential(response) {
  showToast('Signing in with Google…', 'success');
  try {
    const res  = await fetch(`${API}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Google sign-in failed.', 'error'); return; }
    localStorage.setItem('ff_token', data.token);
    localStorage.setItem('ff_user', JSON.stringify(data.user));
    showToast(`Welcome, ${data.user.first_name} ✨`, 'success');
    setTimeout(() => { window.location.href = data.isNew ? 'outfit.html' : 'index.html'; }, 1000);
  } catch {
    showToast('Cannot reach server. Is it running?', 'error');
  }
}

document.getElementById('google-login-btn').addEventListener('click', triggerGoogleSignIn);
document.getElementById('google-signup-btn').addEventListener('click', triggerGoogleSignIn);

/* ── TAB SWITCHING ── */
const tabs   = document.querySelectorAll('.tab-btn');
const forms  = document.querySelectorAll('.auth-form');
const slider = document.querySelector('.tab-slider');

function switchTab(name) {
  tabs.forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });
  forms.forEach(f => f.classList.toggle('active', f.id === name));
  slider.classList.toggle('right', name === 'signup');
}

tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

document.querySelectorAll('[data-switch]').forEach(link =>
  link.addEventListener('click', e => { e.preventDefault(); switchTab(link.dataset.switch); })
);

const urlTab = new URLSearchParams(location.search).get('tab');
if (urlTab) switchTab(urlTab);

/* ── PASSWORD TOGGLE ── */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.field').querySelector('input');
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    btn.querySelector('.eye-icon').style.opacity = hidden ? '0.4' : '1';
  });
});

/* ── PASSWORD STRENGTH ── */
const pwInput       = document.getElementById('signup-password');
const strengthFill  = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');

const levels = [
  { label: 'Too short', color: '#ef4444', pct: '15%' },
  { label: 'Weak',      color: '#f97316', pct: '35%' },
  { label: 'Fair',      color: '#eab308', pct: '60%' },
  { label: 'Good',      color: '#3b82f6', pct: '80%' },
  { label: 'Strong',    color: '#10b981', pct: '100%' },
];

function calcStrength(pw) {
  if (pw.length < 6) return 0;
  let s = 1;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

pwInput.addEventListener('input', () => {
  const v = pwInput.value;
  if (!v) { strengthFill.style.width = '0'; strengthLabel.textContent = 'Strength'; strengthLabel.style.color = '#aaa'; return; }
  const lvl = levels[calcStrength(v)];
  strengthFill.style.width = lvl.pct;
  strengthFill.style.background = lvl.color;
  strengthLabel.textContent = lvl.label;
  strengthLabel.style.color = lvl.color;
});

/* ── CONFIRM MATCH ── */
const confirmInput = document.getElementById('signup-confirm');
confirmInput.addEventListener('input', () => {
  if (!confirmInput.value) return;
  confirmInput.classList.toggle('success', confirmInput.value === pwInput.value);
  confirmInput.classList.toggle('error',   confirmInput.value !== pwInput.value);
});

/* ── TOAST ── */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

/* ── VALIDATION ── */
function setError(input, msg) {
  const wrap = input.closest('.field') || input.parentElement;
  input.classList.add('error');
  let err = wrap.querySelector('.error-msg');
  if (!err) { err = document.createElement('span'); err.className = 'error-msg'; wrap.appendChild(err); }
  err.textContent = '⚠ ' + msg;
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach(el => el.remove());
}

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* ── LOADING STATE ── */
function setLoading(btn, on) {
  btn.disabled = on;
  btn.querySelector('.btn-text').hidden = on;
  btn.querySelector('.btn-loader').hidden = !on;
}

/* ── LOGIN ── */
document.getElementById('login').addEventListener('submit', async e => {
  e.preventDefault();
  const form  = e.target;
  const email = form.querySelector('#login-email');
  const pw    = form.querySelector('#login-password');
  const btn   = form.querySelector('.submit-btn');
  clearErrors(form);

  let ok = true;
  if (!isEmail(email.value))  { setError(email, 'Enter a valid email.'); ok = false; }
  if (!pw.value)               { setError(pw, 'Password is required.'); ok = false; }
  if (!ok) return;

  setLoading(btn, true);

  /* ── CLIENT-SIDE AUTH (Vercel / no backend) ── */
  if (!API) {
    await new Promise(r => setTimeout(r, 800));
    // Check if user registered locally
    const stored = JSON.parse(localStorage.getItem('ff_accounts') || '[]');
    const found  = stored.find(u => u.email === email.value && u.password === btoa(pw.value));
    if (!found) {
      showToast('No account found. Please sign up first.', 'error');
      setLoading(btn, false);
      return;
    }
    const user = { id: found.id, first_name: found.first_name, last_name: found.last_name, email: found.email };
    localStorage.setItem('ff_token', 'local_' + Date.now());
    localStorage.setItem('ff_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.first_name} ✨`, 'success');
    const returnUrl = sessionStorage.getItem('ff_return') || 'index.html';
    sessionStorage.removeItem('ff_return');
    setTimeout(() => window.location.href = returnUrl, 1200);
    setLoading(btn, false);
    return;
  }

  /* ── SERVER AUTH (localhost) ── */
  try {
    const res  = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: pw.value })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Login failed.', 'error');
    } else {
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.first_name} ✨`, 'success');
      const returnUrl = sessionStorage.getItem('ff_return') || 'index.html';
      sessionStorage.removeItem('ff_return');
      setTimeout(() => window.location.href = returnUrl, 1200);
    }
  } catch {
    showToast('Cannot reach server. Is it running?', 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* ── SIGNUP ── */
document.getElementById('signup').addEventListener('submit', async e => {
  e.preventDefault();
  const form    = e.target;
  const fname   = form.querySelector('#signup-fname');
  const lname   = form.querySelector('#signup-lname');
  const email   = form.querySelector('#signup-email');
  const pw      = form.querySelector('#signup-password');
  const confirm = form.querySelector('#signup-confirm');
  const terms   = form.querySelector('#terms');
  const btn     = form.querySelector('.submit-btn');
  clearErrors(form);

  let ok = true;
  if (!fname.value.trim())           { setError(fname, 'Required.'); ok = false; }
  if (!lname.value.trim())           { setError(lname, 'Required.'); ok = false; }
  if (!isEmail(email.value))         { setError(email, 'Enter a valid email.'); ok = false; }
  if (pw.value.length < 8)           { setError(pw, 'Min 8 characters.'); ok = false; }
  if (confirm.value !== pw.value)    { setError(confirm, 'Passwords do not match.'); ok = false; }
  if (!terms.checked)                { showToast('Please accept the Terms of Service.', 'error'); ok = false; }
  if (!ok) return;

  setLoading(btn, true);

  /* ── CLIENT-SIDE AUTH (Vercel / no backend) ── */
  if (!API) {
    await new Promise(r => setTimeout(r, 800));
    const accounts = JSON.parse(localStorage.getItem('ff_accounts') || '[]');
    if (accounts.find(u => u.email === email.value)) {
      showToast('Email already registered. Please sign in.', 'error');
      setLoading(btn, false);
      return;
    }
    const newUser = {
      id:         Date.now(),
      first_name: fname.value.trim(),
      last_name:  lname.value.trim(),
      email:      email.value,
      password:   btoa(pw.value),   // base64 — not secure, demo only
    };
    accounts.push(newUser);
    localStorage.setItem('ff_accounts', JSON.stringify(accounts));
    const user = { id: newUser.id, first_name: newUser.first_name, last_name: newUser.last_name, email: newUser.email };
    localStorage.setItem('ff_token', 'local_' + Date.now());
    localStorage.setItem('ff_user', JSON.stringify(user));
    showToast(`Welcome to FitFusion, ${user.first_name} ✨`, 'success');
    const returnUrl = sessionStorage.getItem('ff_return') || 'index.html';
    sessionStorage.removeItem('ff_return');
    setTimeout(() => window.location.href = returnUrl, 1200);
    setLoading(btn, false);
    return;
  }

  /* ── SERVER AUTH (localhost) ── */
  try {
    const res  = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: fname.value.trim(),
        last_name:  lname.value.trim(),
        email:      email.value,
        password:   pw.value
      })
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Signup failed.', 'error');
    } else {
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      showToast(`Welcome to FitFusion, ${data.user.first_name} ✨`, 'success');
      const returnUrl = sessionStorage.getItem('ff_return') || 'index.html';
      sessionStorage.removeItem('ff_return');
      setTimeout(() => window.location.href = returnUrl, 1200);
    }
  } catch {
    showToast('Cannot reach server. Is it running?', 'error');
  } finally {
    setLoading(btn, false);
  }
});
