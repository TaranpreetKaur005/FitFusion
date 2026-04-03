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
══════════════════════════════ */
function getInitials(first, last) {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
}

function applyAuthState() {
  const raw  = localStorage.getItem('ff_user');
  const user = raw ? JSON.parse(raw) : null;

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
function signOut() {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
  applyAuthState();
  userDropdown?.classList.remove('open');
  closeSidebar();
}

document.getElementById('logout-btn')?.addEventListener('click', signOut);
document.getElementById('suc-logout')?.addEventListener('click', signOut);

/* ── INIT ── */
applyAuthState();

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
  window.requireAuth = function(cb) {
    const user = localStorage.getItem('ff_user');
    if (user) { cb && cb(); return; }
    openGate(cb);
  };

  // ── Intercept AI Stylist nav links (index.html + any page) ──
  document.querySelectorAll('a[href="stylist.html"]').forEach(link => {
    link.addEventListener('click', e => {
      const user = localStorage.getItem('ff_user');
      if (!user) {
        e.preventDefault();
        openGate(() => { window.location.href = 'stylist.html'; });
      }
    });
  });
})();
