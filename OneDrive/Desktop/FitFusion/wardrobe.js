/* ══════════════════════════════
   WARDROBE — full functionality
   Reads from localStorage: ff_saved_looks
   Each look: { id, label, type, pieces, tips, palette, answers, ts, fav, img }
══════════════════════════════ */

/* ── TOAST ── */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

/* ── AUTH GATE ── */
const user = JSON.parse(localStorage.getItem('ff_user') || 'null');
if (!user) {
  // Redirect to auth, return here after login
  sessionStorage.setItem('ff_return', 'wardrobe.html');
  window.location.href = 'auth.html';
}

/* ── PERSONALISE GREETING ── */
if (user) {
  const el = document.getElementById('wd-greeting');
  if (el) el.textContent = `${user.first_name}'s Wardrobe`;
}

/* ── LOAD LOOKS ── */
function loadLooks() {
  return JSON.parse(localStorage.getItem('ff_saved_looks') || '[]');
}

function saveLooks(looks) {
  localStorage.setItem('ff_saved_looks', JSON.stringify(looks));
}

/* ── COLOUR THEMES per outfit type ── */
const THEMES = {
  casual:  { bg: 'linear-gradient(145deg,#e0f2fe,#f0fdf4)', top: '#3b82f6', bottom: '#1d4ed8', shoe: '#93c5fd' },
  work:    { bg: 'linear-gradient(145deg,#f0f9ff,#e0e7ff)', top: '#1e3a5f', bottom: '#374151', shoe: '#6b7280' },
  party:   { bg: 'linear-gradient(145deg,#1a1a2e,#2d1b69)',  top: '#d4af37', bottom: '#1a1a2e', shoe: '#f5f5f0' },
  date:    { bg: 'linear-gradient(145deg,#fdf2f8,#fce7f3)',  top: '#c9a0a0', bottom: '#722f37', shoe: '#c19a6b' },
  sport:   { bg: 'linear-gradient(145deg,#f0fdf4,#ecfdf5)',  top: '#3b82f6', bottom: '#111827', shoe: '#10b981' },
  formal:  { bg: 'linear-gradient(145deg,#111827,#1f2937)',  top: '#0a0a0a', bottom: '#0a0a0a', shoe: '#c0c0c0' },
  default: { bg: 'linear-gradient(145deg,#f5f3ff,#fdf2f8)',  top: '#7c3aed', bottom: '#4c1d95', shoe: '#a78bfa' },
};

/* ── BUILD OUTFIT CANVAS HTML ── */
function buildOutfitCanvas(look, size = 'card') {
  const type   = look.type || 'default';
  const theme  = THEMES[type] || THEMES.default;
  const tags   = (look.answers?.vibes || []).slice(0, 2);
  const isLarge = size === 'modal';
  const scale  = isLarge ? 1.5 : 1;

  const headSize   = Math.round(32 * scale);
  const topW       = Math.round(64 * scale);
  const topH       = Math.round(72 * scale);
  const bottomW    = Math.round(68 * scale);
  const bottomH    = Math.round(80 * scale);
  const shoeW      = Math.round(28 * scale);
  const shoeH      = Math.round(10 * scale);
  const armW       = Math.round(18 * scale);
  const armH       = Math.round(44 * scale);
  const legW       = Math.round(30 * scale);
  const legH       = Math.round(52 * scale);

  return `
    <div class="outfit-canvas" style="width:100%;height:100%">
      <div class="oc-bg" style="background:${theme.bg}"></div>
      ${tags.length ? `<div class="oc-tags">${tags.map(t => `<span class="oc-tag">${t}</span>`).join('')}</div>` : ''}
      <div class="oc-figure">
        <div class="oc-head" style="width:${headSize}px;height:${headSize}px"></div>
        <div class="oc-top" style="width:${topW}px;height:${topH}px;background:${theme.top};
          --arm-w:${armW}px;--arm-h:${armH}px"></div>
        <div class="oc-bottom" style="width:${bottomW}px;height:${bottomH}px;background:${theme.bottom};
          --leg-w:${legW}px;--leg-h:${legH}px"></div>
        <div class="oc-shoes">
          <div class="oc-shoe" style="width:${shoeW}px;height:${shoeH}px;background:${theme.shoe}"></div>
          <div class="oc-shoe" style="width:${shoeW}px;height:${shoeH}px;background:${theme.shoe}"></div>
        </div>
      </div>
    </div>`;
}

/* ── RENDER STATS ── */
function renderStats(looks) {
  document.getElementById('stat-total').textContent = looks.length;
  document.getElementById('stat-fav').textContent   = looks.filter(l => l.fav).length;
  const types = new Set(looks.map(l => l.type || 'default'));
  document.getElementById('stat-styles').textContent = types.size;
}

/* ── RENDER GRID ── */
let currentFilter = 'all';
let currentSearch = '';
let isListView    = false;

function renderGrid() {
  const looks = loadLooks();
  renderStats(looks);

  let filtered = looks;

  if (currentFilter === 'favourites') {
    filtered = filtered.filter(l => l.fav);
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(l => (l.type || 'default') === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(l =>
      l.label.toLowerCase().includes(q) ||
      (l.type || '').toLowerCase().includes(q) ||
      (l.answers?.vibes || []).some(v => v.includes(q))
    );
  }

  const grid  = document.getElementById('wd-grid');
  const empty = document.getElementById('wd-empty');

  if (!filtered.length) {
    grid.innerHTML = '';
    empty.hidden   = false;
    return;
  }

  empty.hidden   = true;
  grid.className = `wd-grid${isListView ? ' list-view' : ''}`;

  grid.innerHTML = filtered.map((look, i) => {
    const tags = [look.type, ...(look.answers?.vibes || [])].filter(Boolean).slice(0, 3);
    return `
      <div class="wd-card" data-id="${look.id}" style="animation-delay:${i * 0.05}s">
        <div class="wd-card-visual">
          ${buildOutfitCanvas(look, 'card')}
          <div class="wd-fav-badge ${look.fav ? 'active' : ''}" data-fav="${look.id}" title="Favourite">
            ${look.fav ? '❤️' : '🤍'}
          </div>
        </div>
        <div class="wd-card-body">
          <div class="wd-card-label">${look.type || 'Style'}</div>
          <div class="wd-card-title">${look.label}</div>
          <div class="wd-card-tags">
            ${tags.map(t => `<span class="wd-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="wd-card-footer">
          <span class="wd-card-date">${look.ts || ''}</span>
          <button class="wd-card-open" data-open="${look.id}">View Look →</button>
        </div>
      </div>`;
  }).join('');

  // Attach events
  grid.querySelectorAll('.wd-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.wd-fav-badge') || e.target.closest('.wd-card-open')) return;
      openModal(card.dataset.id);
    });
  });

  grid.querySelectorAll('.wd-card-open').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.open));
  });

  grid.querySelectorAll('.wd-fav-badge').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFav(btn.dataset.fav);
    });
  });
}

/* ── TOGGLE FAVOURITE ── */
function toggleFav(id) {
  const looks = loadLooks();
  const look  = looks.find(l => l.id === id);
  if (!look) return;
  look.fav = !look.fav;
  saveLooks(looks);
  renderGrid();
  showToast(look.fav ? '❤️ Added to favourites' : 'Removed from favourites', 'success');
}

/* ── OPEN MODAL ── */
let activeId = null;

function openModal(id) {
  const looks = loadLooks();
  const look  = looks.find(l => l.id === id);
  if (!look) return;
  activeId = id;

  // Visual
  document.getElementById('modal-visual').innerHTML = buildOutfitCanvas(look, 'modal');

  // Meta
  document.getElementById('modal-badge').textContent  = look.type || 'Style';
  document.getElementById('modal-title').textContent  = look.label;
  document.getElementById('modal-meta').textContent   = `Saved on ${look.ts || 'unknown date'}`;

  // Pieces
  document.getElementById('modal-pieces').innerHTML = (look.pieces || []).map(p => `
    <div class="wd-modal-piece">
      <div class="wd-modal-piece-icon">${p.icon}</div>
      <div>
        <div class="wd-modal-piece-type">${p.type}</div>
        <div class="wd-modal-piece-name">${p.name}</div>
        <div class="wd-modal-piece-detail">${p.detail}</div>
      </div>
    </div>`).join('');

  // Tips
  document.getElementById('modal-tips').innerHTML = (look.tips || []).map(t => `<li>${t}</li>`).join('');

  // Palette
  document.getElementById('modal-palette').innerHTML = (look.palette || []).map(s => `
    <div class="wd-modal-swatch">
      <div class="wd-modal-swatch-circle" style="background:${s.color}"></div>
      <span>${s.name}</span>
    </div>`).join('');

  // Fav button
  const favBtn = document.getElementById('modal-fav-btn');
  favBtn.textContent = look.fav ? '❤️ Unfavourite' : '🤍 Favourite';
  favBtn.className   = `wd-action-btn fav-btn${look.fav ? ' active' : ''}`;

  // Show modal
  const overlay = document.getElementById('wd-modal');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('wd-modal').hidden = true;
  document.body.style.overflow = '';
  activeId = null;
}

/* ── MODAL EVENTS ── */
document.getElementById('wd-modal-close').addEventListener('click', closeModal);
document.getElementById('wd-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('wd-modal')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('modal-fav-btn').addEventListener('click', () => {
  if (!activeId) return;
  toggleFav(activeId);
  // Update button in modal
  const looks = loadLooks();
  const look  = looks.find(l => l.id === activeId);
  if (look) {
    const btn = document.getElementById('modal-fav-btn');
    btn.textContent = look.fav ? '❤️ Unfavourite' : '🤍 Favourite';
    btn.className   = `wd-action-btn fav-btn${look.fav ? ' active' : ''}`;
  }
});

document.getElementById('modal-share-btn').addEventListener('click', () => {
  const looks = loadLooks();
  const look  = looks.find(l => l.id === activeId);
  if (!look) return;
  const text = `Check out my ${look.label} look from FitFusion! 🔥`;
  if (navigator.share) {
    navigator.share({ title: 'FitFusion Look', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard ✓', 'success'));
  }
});

document.getElementById('modal-delete-btn').addEventListener('click', () => {
  if (!activeId) return;
  const looks   = loadLooks();
  const updated = looks.filter(l => l.id !== activeId);
  saveLooks(updated);
  closeModal();
  renderGrid();
  showToast('Look deleted', 'error');
});

document.getElementById('modal-restyle').addEventListener('click', () => {
  const looks = loadLooks();
  const look  = looks.find(l => l.id === activeId);
  if (look?.answers) {
    sessionStorage.setItem('ff_prefill', JSON.stringify(look.answers));
  }
  window.location.href = 'stylist.html';
});

/* ── FILTER TABS ── */
document.querySelectorAll('.wd-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wd-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderGrid();
  });
});

/* ── SEARCH ── */
document.getElementById('wd-search').addEventListener('input', e => {
  currentSearch = e.target.value.trim();
  renderGrid();
});

/* ── VIEW TOGGLE ── */
document.getElementById('view-grid').addEventListener('click', () => {
  isListView = false;
  document.getElementById('view-grid').classList.add('active');
  document.getElementById('view-list').classList.remove('active');
  renderGrid();
});

document.getElementById('view-list').addEventListener('click', () => {
  isListView = true;
  document.getElementById('view-list').classList.add('active');
  document.getElementById('view-grid').classList.remove('active');
  renderGrid();
});

/* ── INIT ── */
renderGrid();
