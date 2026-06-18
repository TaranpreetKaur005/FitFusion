/* ── SIDEBAR ── */
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');
const hamburger = document.getElementById('hamburger');
const closeBtn  = document.getElementById('sidebarClose');

function openSidebar()  {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ══════════════════════════════
   AUTH STATE  (shared across all pages)
══════════════════════════════ */window.API_BASE_URL = window.API_BASE_URL || (
  location.protocol === 'file:'
    ? 'http://localhost:3002/api'
    : (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? `${location.protocol}//${location.hostname}:3002/api`
      : '/api'
);

window.currentUser = null;
window.authToken = sessionStorage.getItem('ff_token') || localStorage.getItem('ff_token') || null;
window.userReady = null;
window.WARDROBE_STORAGE_KEY = 'ff_saved_looks';

function parseJSON(value, fallback = []) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getAuthHeaders() {
  const headers = {};
  if (window.authToken) headers.Authorization = `Bearer ${window.authToken}`;
  return headers;
}

function getLocalLooks() {
  const items = localStorage.getItem(window.WARDROBE_STORAGE_KEY) || '[]';
  const looks = parseJSON(items, []);
  return Array.isArray(looks) ? looks : [];
}

function setLocalLooks(looks) {
  try {
    localStorage.setItem(window.WARDROBE_STORAGE_KEY, JSON.stringify(looks));
  } catch (err) {
    console.warn('Could not save local wardrobe:', err);
  }
}

function appendLocalLook(look) {
  const looks = getLocalLooks();
  if (!looks.some(item => item.id === look.id)) {
    looks.unshift(look);
    setLocalLooks(looks);
  }
}

function replaceLocalLook(oldId, look) {
  const looks = getLocalLooks();
  const updated = looks.map(item => item.id === oldId ? look : item);
  if (!updated.some(item => item.id === look.id)) updated.unshift(look);
  setLocalLooks(updated);
}

function removeLocalLook(id) {
  const looks = getLocalLooks().filter(item => item.id !== id);
  setLocalLooks(looks);
  return looks;
}

function generateLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function syncLocalWardrobeToServer() {
  const localLooks = getLocalLooks();
  const unsyncedLooks = localLooks.filter(look => look.id.startsWith('local-'));
  
  if (unsyncedLooks.length === 0) return;
  
  let syncedCount = 0;
  for (const look of unsyncedLooks) {
    try {
      const res = await fetch(`${window.API_BASE_URL}/saved-looks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ look }),
      });
      
      if (!res.ok) continue;
      const body = await res.json();
      const serverLook = body.look;
      if (serverLook) {
        replaceLocalLook(look.id, serverLook);
        syncedCount++;
      }
    } catch (err) {
      console.warn('Could not sync local look:', look.id, err);
    }
  }
  
  if (syncedCount > 0) {
    console.log(`Synced ${syncedCount} local looks to server`);
  }
}

async function fetchCurrentUser() {
  if (window.currentUser !== null) return window.currentUser;

  // Fast path: check localStorage first (written by auth.js on login)
  const stored = localStorage.getItem('ff_user');
  if (stored) {
    try {
      window.currentUser = JSON.parse(stored);
      // Also restore auth token
      const token = localStorage.getItem('ff_token');
      if (token) window.authToken = token;
      return window.currentUser;
    } catch { /* fall through to server */ }
  }

  // Fallback: verify with server
  try {
    const res = await fetch(`${window.API_BASE_URL}/me`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok) { window.currentUser = null; return null; }
    const data = await res.json();
    window.currentUser = data.user || null;
    // Cache in localStorage so future page loads are instant
    if (window.currentUser) {
      localStorage.setItem('ff_user', JSON.stringify(window.currentUser));
    }
  } catch {
    window.currentUser = null;
  }
  return window.currentUser;
}

window.getCurrentUser = fetchCurrentUser;
window.getAuthHeaders = getAuthHeaders;
window.syncLocalWardrobeToServer = syncLocalWardrobeToServer;
window.userReady = fetchCurrentUser();
function getInitials(first, last) {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
}

function applyAuthState() {
  const user = window.currentUser;

  const navAuth  = document.getElementById('nav-auth');
  const navUser  = document.getElementById('nav-user');

  if (!navAuth || !navUser) return; // guard — element may not exist on every page

  const navAvatar    = document.getElementById('nav-avatar');
  const navUserName  = document.getElementById('nav-user-name');
  const navUserEmail = document.getElementById('nav-user-email');
  const dropAvatar   = document.getElementById('drop-avatar');
  const dropName     = document.getElementById('drop-name');
  const dropEmail    = document.getElementById('drop-email');

  const sidebarAuth     = document.getElementById('sidebar-auth');
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  const sucAvatar       = document.getElementById('suc-avatar');
  const sucName         = document.getElementById('suc-name');
  const sucEmail        = document.getElementById('suc-email');

  if (user) {
    const initials = getInitials(user.first_name, user.last_name);
    const fullName = `${user.first_name} ${user.last_name}`;

    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');
    if (navAvatar)    navAvatar.textContent    = initials;
    if (navUserName)  navUserName.textContent  = fullName;
    if (navUserEmail) navUserEmail.textContent = user.email;
    if (dropAvatar)   dropAvatar.textContent   = initials;
    if (dropName)     dropName.textContent     = fullName;
    if (dropEmail)    dropEmail.textContent    = user.email;

    if (sidebarAuth)     sidebarAuth.style.display     = 'none';
    if (sidebarUserCard) sidebarUserCard.style.display = 'flex';
    if (sucAvatar) sucAvatar.textContent = initials;
    if (sucName)   sucName.textContent   = fullName;
    if (sucEmail)  sucEmail.textContent  = user.email;
  } else {
    navAuth.classList.remove('hidden');
    navUser.classList.add('hidden');
    if (sidebarAuth)     sidebarAuth.style.display     = '';
    if (sidebarUserCard) sidebarUserCard.style.display = 'none';
  }
}

/* ── PROFILE DROPDOWN TOGGLE ── */
const navUserEl    = document.getElementById('nav-user');
const userDropdown = document.getElementById('user-dropdown');

if (navUserEl && userDropdown) {
  navUserEl.addEventListener('click', e => {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => userDropdown.classList.remove('open'));
}

/* ── SIGN OUT ── */
async function signOut() {
  try {
    await fetch(`${window.API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Logout request failed:', err);
  }
  // Clear ALL auth state
  window.authToken = null;
  window.currentUser = null;
  sessionStorage.removeItem('ff_token');
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');      // ← also clear the cached user
  applyAuthState();
  userDropdown?.classList.remove('open');
}

document.getElementById('logout-btn')?.addEventListener('click', signOut);
document.getElementById('suc-logout')?.addEventListener('click', signOut);

/* ── INIT ── */
window.userReady.then(applyAuthState);

/* ══════════════════════════════
   AUTH GATE  — shared across all pages
   Call requireAuth(callback) anywhere.
   If logged in → runs callback immediately.
   If not → shows modal, then runs callback after sign-in.
══════════════════════════════ */
(function buildAuthGate() {
  // Inject modal once into the DOM
  const el = document.createElement('div');
  el.className = 'auth-gate-overlay';
  el.id = 'auth-gate';
  el.innerHTML = `
    <div class="auth-gate-box">
      <span class="auth-gate-icon">🔐</span>
      <h3>Sign in to continue</h3>
      <p>You need a FitFusion account to access the AI Stylist and save your looks.</p>
      <div class="auth-gate-btns">
        <button class="auth-gate-signin" id="ag-signin">Sign In</button>
        <button class="auth-gate-signup" id="ag-signup">Create Free Account</button>
        <button class="auth-gate-dismiss" id="ag-dismiss">Maybe later</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  let _pendingCallback = null;

  function openGate(cb) {
    _pendingCallback = cb || null;
    el.classList.add('open');
  }

  function closeGate() {
    el.classList.remove('open');
    _pendingCallback = null;
  }

  // Store return URL so auth page can redirect back
  function goAuth(tab) {
    sessionStorage.setItem('ff_return', location.href);
    window.location.href = `auth.html${tab ? '?tab=' + tab : ''}`;
  }

  document.getElementById('ag-signin').addEventListener('click',  () => goAuth(''));
  document.getElementById('ag-signup').addEventListener('click',  () => goAuth('signup'));
  document.getElementById('ag-dismiss').addEventListener('click', closeGate);
  el.addEventListener('click', e => { if (e.target === el) closeGate(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGate(); });

  // Expose globally
  window.requireAuth = async function(cb) {
    const user = await fetchCurrentUser();
    if (user) { cb && cb(); return; }
    openGate(cb);
  };

  // ── Intercept AI Stylist nav links (index.html + any page) ──
  document.querySelectorAll('a[href="stylist.html"]').forEach(link => {
    link.addEventListener('click', async e => {
      const user = await fetchCurrentUser();
      if (!user) {
        e.preventDefault();
        openGate(() => { window.location.href = 'stylist.html'; });
      }
    });
  });
})();
