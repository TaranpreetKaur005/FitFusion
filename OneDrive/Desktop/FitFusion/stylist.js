/* ══════════════════════════════
   AI STYLIST — no-reload flow
   Auth + sidebar handled by script.js
══════════════════════════════ */

/* ── TOAST ── */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

/* ── PERSONALISE GREETING ── */
const user = JSON.parse(localStorage.getItem('ff_user') || 'null');
if (user) {
  const el = document.getElementById('q-greeting');
  if (el) el.textContent = `Hey ${user.first_name}, let's build your style profile ✨`;
}

/* ══════════════════════════════
   OUTFIT DATA
══════════════════════════════ */
const DB = {
  casual: {
    label: 'Casual Chic',
    pieces: [
      { icon:'👕', type:'Top',       name:'Oversized Linen Tee',    detail:'Relaxed fit · Neutral tones' },
      { icon:'👖', type:'Bottom',    name:'Straight-leg Jeans',     detail:'Mid-rise · Light wash' },
      { icon:'👟', type:'Shoes',     name:'Clean White Sneakers',   detail:'Minimalist · Leather' },
      { icon:'🧢', type:'Accessory', name:'Washed Baseball Cap',    detail:'Unstructured · Cotton' },
      { icon:'🎒', type:'Bag',       name:'Canvas Tote Bag',        detail:'Everyday carry · Natural' },
      { icon:'🕶', type:'Eyewear',   name:'Tortoise Sunglasses',    detail:'Retro round frames' },
    ],
    tips: ['Tuck the front of your tee slightly for a more polished look.','Roll the jeans once or twice to show off your sneakers.','Keep accessories minimal — one bag, one hat is enough.'],
    palette: [{color:'#f5f0e8',name:'Cream'},{color:'#c8b89a',name:'Sand'},{color:'#6b7280',name:'Slate'},{color:'#1f2937',name:'Charcoal'}],
  },
  work: {
    label: 'Smart Professional',
    pieces: [
      { icon:'👔', type:'Top',    name:'Tailored Oxford Shirt',  detail:'Slim fit · White or light blue' },
      { icon:'🧥', type:'Outer',  name:'Structured Blazer',      detail:'Single-breasted · Navy' },
      { icon:'👖', type:'Bottom', name:'Slim Chinos',            detail:'Tapered · Stone or charcoal' },
      { icon:'👞', type:'Shoes',  name:'Derby Leather Shoes',    detail:'Polished · Dark brown' },
      { icon:'⌚', type:'Watch',  name:'Minimalist Watch',       detail:'Leather strap · Silver case' },
      { icon:'💼', type:'Bag',    name:'Slim Leather Briefcase', detail:'Professional · Dark tan' },
    ],
    tips: ['Ensure your blazer shoulders sit perfectly — it makes the whole outfit.','Match your belt to your shoe colour for a cohesive look.','A pocket square adds personality without being too bold.'],
    palette: [{color:'#1e3a5f',name:'Navy'},{color:'#d4c5a9',name:'Stone'},{color:'#f8f8f6',name:'White'},{color:'#5c4033',name:'Brown'}],
  },
  party: {
    label: 'Night Out Bold',
    pieces: [
      { icon:'✨', type:'Top',       name:'Satin Slip Top',           detail:'Bias cut · Champagne or black' },
      { icon:'👗', type:'Bottom',    name:'High-waist Leather Skirt', detail:'Mini · Faux leather' },
      { icon:'👠', type:'Shoes',     name:'Strappy Heeled Sandals',   detail:'Block heel · Gold or nude' },
      { icon:'👛', type:'Bag',       name:'Micro Chain Bag',          detail:'Evening · Metallic' },
      { icon:'💍', type:'Jewellery', name:'Statement Earrings',       detail:'Drop style · Gold' },
      { icon:'🧥', type:'Outer',     name:'Faux Fur Jacket',          detail:'Cropped · Ivory or black' },
    ],
    tips: ['Let one piece be the statement — either the top or the skirt, not both.','Metallic accessories tie the whole look together effortlessly.','A bold lip colour completes the night-out vibe.'],
    palette: [{color:'#1a1a2e',name:'Midnight'},{color:'#d4af37',name:'Gold'},{color:'#f5f5f0',name:'Ivory'},{color:'#8b0000',name:'Deep Red'}],
  },
  date: {
    label: 'Romantic Elegance',
    pieces: [
      { icon:'👗', type:'Dress',     name:'Wrap Midi Dress',        detail:'Flowy · Dusty rose or burgundy' },
      { icon:'👠', type:'Shoes',     name:'Block Heel Mules',       detail:'Comfortable · Nude or tan' },
      { icon:'👜', type:'Bag',       name:'Crescent Shoulder Bag',  detail:'Soft leather · Camel' },
      { icon:'💎', type:'Jewellery', name:'Delicate Gold Necklace', detail:'Layered · Dainty' },
      { icon:'🧥', type:'Outer',     name:'Trench Coat',            detail:'Classic · Camel or beige' },
      { icon:'🕶', type:'Eyewear',   name:'Cat-eye Sunglasses',     detail:'Retro · Tortoise shell' },
    ],
    tips: ['A wrap dress is universally flattering and effortlessly elegant.','Keep jewellery delicate — less is more for a romantic setting.','A trench coat adds sophistication and works in any weather.'],
    palette: [{color:'#c9a0a0',name:'Dusty Rose'},{color:'#c19a6b',name:'Camel'},{color:'#f9f3ee',name:'Cream'},{color:'#722f37',name:'Burgundy'}],
  },
  sport: {
    label: 'Active Performance',
    pieces: [
      { icon:'🏃', type:'Top',       name:'Moisture-wicking Tank', detail:'Breathable · Bold colour' },
      { icon:'🩳', type:'Bottom',    name:'Athletic Shorts',       detail:'5-inch inseam · Lightweight' },
      { icon:'👟', type:'Shoes',     name:'Running Trainers',      detail:'Cushioned · Responsive sole' },
      { icon:'🧢', type:'Accessory', name:'Sport Cap',             detail:'Sweat-wicking · Adjustable' },
      { icon:'⌚', type:'Watch',     name:'Sport Watch',           detail:'GPS · Heart rate monitor' },
      { icon:'🎒', type:'Bag',       name:'Drawstring Gym Bag',    detail:'Lightweight · Packable' },
    ],
    tips: ['Choose moisture-wicking fabrics to stay comfortable during activity.','Bright colours boost energy and visibility outdoors.','Invest in good trainers — they protect your joints.'],
    palette: [{color:'#111827',name:'Black'},{color:'#3b82f6',name:'Electric Blue'},{color:'#f9fafb',name:'White'},{color:'#10b981',name:'Mint'}],
  },
  formal: {
    label: 'Black Tie Refined',
    pieces: [
      { icon:'🤵', type:'Suit',      name:'Tuxedo Suit',         detail:'Slim fit · Midnight black' },
      { icon:'👔', type:'Shirt',     name:'Pleated Dress Shirt', detail:'White · French cuffs' },
      { icon:'🎀', type:'Tie',       name:'Silk Bow Tie',        detail:'Black · Self-tie' },
      { icon:'👞', type:'Shoes',     name:'Patent Oxford Shoes', detail:'Lacquered · Black' },
      { icon:'⌚', type:'Watch',     name:'Dress Watch',         detail:'Slim · Silver or gold' },
      { icon:'💼', type:'Accessory', name:'Cufflinks',           detail:'Silver · Understated' },
    ],
    tips: ['Ensure your tuxedo is properly tailored — fit is everything at formal events.','A self-tie bow tie always looks more authentic than a clip-on.','Patent leather shoes are the only acceptable choice for black tie.'],
    palette: [{color:'#0a0a0a',name:'Black'},{color:'#f8f8f8',name:'White'},{color:'#c0c0c0',name:'Silver'},{color:'#1a1a2e',name:'Midnight'}],
  },
  default: {
    label: 'Effortless Style',
    pieces: [
      { icon:'👕', type:'Top',    name:'Classic White Tee',   detail:'Relaxed fit · Premium cotton' },
      { icon:'👖', type:'Bottom', name:'Dark Slim Jeans',     detail:'Tapered · Indigo wash' },
      { icon:'👟', type:'Shoes',  name:'Leather Sneakers',    detail:'Clean · White sole' },
      { icon:'🧥', type:'Outer',  name:'Unstructured Blazer', detail:'Soft shoulder · Beige' },
      { icon:'⌚', type:'Watch',  name:'Simple Watch',        detail:'Minimalist · Leather strap' },
      { icon:'👜', type:'Bag',    name:'Leather Crossbody',   detail:'Compact · Tan' },
    ],
    tips: ['A white tee and dark jeans is the most versatile base in fashion.','An unstructured blazer instantly elevates any casual outfit.','Invest in quality basics — they outlast trends.'],
    palette: [{color:'#ffffff',name:'White'},{color:'#1a1a2e',name:'Indigo'},{color:'#d4c5a9',name:'Beige'},{color:'#8b7355',name:'Tan'}],
  },
};

function detectType(a) {
  const vibes = a.vibes || [];
  if (vibes.includes('sporty'))                              return 'sport';
  if (vibes.includes('luxe') || vibes.includes('classic'))  return 'formal';
  if (vibes.includes('streetwear') || vibes.includes('edgy')) return 'casual';
  if (vibes.includes('boho') || vibes.includes('vintage'))  return 'casual';
  return 'default';
}

/* ══════════════════════════════
   QUESTIONNAIRE
══════════════════════════════ */
const TOTAL = 6;
let step = 1;
let answers = {};

const fillEl  = document.getElementById('q-fill');
const labelEl = document.getElementById('q-label');
const backBtn = document.getElementById('q-back');
const nextBtn = document.getElementById('q-next');
const nextLbl = document.getElementById('q-next-lbl');
const spinner = document.getElementById('q-spin');

function goToStep(n) {
  document.querySelectorAll('.st-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.st-step[data-q="${n}"]`).classList.add('active');
  step = n;
  fillEl.style.width  = (n / TOTAL * 100) + '%';
  labelEl.textContent = `Step ${n} of ${TOTAL}`;
  backBtn.disabled    = n === 1;
  nextLbl.textContent = n === TOTAL ? 'Generate My Look ✨' : 'Next →';
}

function collect(n) {
  switch (n) {
    case 1: { const v = document.querySelector('input[name="q-gender"]:checked'); if (!v) { showToast('Please select a style identity.','error'); return false; } answers.gender = v.value; return true; }
    case 2: { const v = document.querySelector('input[name="q-fit"]:checked');    if (!v) { showToast('Please select a fit preference.','error'); return false; } answers.fit = v.value; return true; }
    case 3: { const c = [...document.querySelectorAll('input[name="q-vibe"]:checked')]; if (!c.length) { showToast('Pick at least one style vibe.','error'); return false; } answers.vibes = c.map(x=>x.value); return true; }
    case 4: { const c = [...document.querySelectorAll('input[name="q-color"]:checked')]; if (!c.length) { showToast('Pick at least one colour palette.','error'); return false; } answers.colors = c.map(x=>x.value); return true; }
    case 5: { const v = document.querySelector('input[name="q-budget"]:checked');  if (!v) { showToast('Please select a budget range.','error'); return false; } answers.budget = v.value; return true; }
    case 6: { const v = document.querySelector('input[name="q-season"]:checked');  if (!v) { showToast('Please select a season.','error'); return false; } answers.season = v.value; answers.extras = document.getElementById('q-extras').value.trim(); return true; }
  }
}

// max 3 vibes
document.querySelectorAll('input[name="q-vibe"]').forEach(cb => {
  cb.addEventListener('change', () => {
    if ([...document.querySelectorAll('input[name="q-vibe"]:checked')].length > 3) {
      cb.checked = false;
      showToast('Max 3 vibes allowed.', 'error');
    }
  });
});

nextBtn.addEventListener('click', async () => {
  // Gate: require login before starting the questionnaire
  if (!localStorage.getItem('ff_user')) {
    window.requireAuth && window.requireAuth();
    return;
  }

  if (!collect(step)) return;
  if (step < TOTAL) { goToStep(step + 1); return; }

  // ── generate ──
  nextBtn.disabled = true;
  nextLbl.hidden   = true;
  spinner.hidden   = false;

  await new Promise(r => setTimeout(r, 1500));

  showResult(answers);

  nextBtn.disabled = false;
  nextLbl.hidden   = false;
  spinner.hidden   = true;
});

backBtn.addEventListener('click', () => { if (step > 1) goToStep(step - 1); });

/* ══════════════════════════════
   SHOW RESULT (no reload)
══════════════════════════════ */
let lastAnswers = null;

function showResult(a) {
  lastAnswers = a;
  const type = detectType(a);
  const data = DB[type];

  let label = data.label;
  if (a.season) label = a.season.charAt(0).toUpperCase() + a.season.slice(1) + ' ' + label;
  if (a.budget === 'luxury') label = 'Luxury ' + label;

  document.getElementById('r-badge').textContent = label;

  document.getElementById('r-pieces').innerHTML = data.pieces.map((p, i) => `
    <div class="r-piece" style="animation-delay:${i*0.06}s">
      <div class="r-piece-icon">${p.icon}</div>
      <div>
        <div class="r-piece-type">${p.type}</div>
        <div class="r-piece-name">${p.name}</div>
        <div class="r-piece-detail">${p.detail}</div>
      </div>
    </div>`).join('');

  document.getElementById('r-tips-list').innerHTML = data.tips.map(t => `<li>${t}</li>`).join('');

  document.getElementById('r-swatches').innerHTML = data.palette.map(s => `
    <div class="r-swatch">
      <div class="r-swatch-circle" style="background:${s.color}"></div>
      <span>${s.name}</span>
    </div>`).join('');

  // switch views — animated, no reload
  const quizEl   = document.getElementById('view-quiz');
  const resultEl = document.getElementById('view-result');

  quizEl.style.opacity    = '0';
  quizEl.style.transform  = 'translateY(-12px)';
  quizEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    quizEl.hidden          = true;
    quizEl.style.opacity   = '';
    quizEl.style.transform = '';
    quizEl.style.transition= '';
    resultEl.hidden        = false;
    resultEl.style.opacity = '0';
    resultEl.style.transform = 'translateY(12px)';
    resultEl.style.transition= 'opacity 0.3s ease, transform 0.3s ease';
    requestAnimationFrame(() => {
      resultEl.style.opacity   = '1';
      resultEl.style.transform = 'translateY(0)';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 260);

  showToast(`${label} ready ✨`, 'success');
}

/* ── REDO (keep answers, regenerate) ── */
document.getElementById('r-redo').addEventListener('click', () => {
  if (lastAnswers) showResult(lastAnswers);
});

/* ── START OVER (back to Q1, no reload) ── */
document.getElementById('r-restart').addEventListener('click', () => {
  answers = {};
  document.querySelectorAll('#view-quiz input').forEach(i => i.checked = false);
  document.getElementById('q-extras').value = '';
  goToStep(1);

  const resultEl = document.getElementById('view-result');
  const quizEl   = document.getElementById('view-quiz');

  resultEl.style.opacity   = '0';
  resultEl.style.transform = 'translateY(-12px)';
  resultEl.style.transition= 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    resultEl.hidden          = true;
    resultEl.style.opacity   = '';
    resultEl.style.transform = '';
    resultEl.style.transition= '';
    quizEl.hidden            = false;
    quizEl.style.opacity     = '0';
    quizEl.style.transform   = 'translateY(12px)';
    quizEl.style.transition  = 'opacity 0.3s ease, transform 0.3s ease';
    requestAnimationFrame(() => {
      quizEl.style.opacity   = '1';
      quizEl.style.transform = 'translateY(0)';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 260);
});

/* ── SAVE LOOK ── */
let saved = JSON.parse(localStorage.getItem('ff_saved_looks') || '[]');

document.getElementById('r-save').addEventListener('click', () => {
  if (!lastAnswers) return;
  const data = DB[detectType(lastAnswers)];
  saved.unshift({ label: document.getElementById('r-badge').textContent, pieces: data.pieces, ts: new Date().toLocaleString() });
  if (saved.length > 10) saved.pop();
  localStorage.setItem('ff_saved_looks', JSON.stringify(saved));
  renderSaved();
  showToast('Look saved 🔖', 'success');
});

function renderSaved() {
  const sec  = document.getElementById('saved-section');
  const grid = document.getElementById('saved-grid');
  if (!saved.length) { sec.hidden = true; return; }
  sec.hidden = false;
  grid.innerHTML = saved.map((l, i) => `
    <div class="saved-card" style="animation-delay:${i*0.05}s">
      <div class="saved-card-title">${l.label}</div>
      <div class="saved-card-meta">${l.ts}</div>
      <div class="saved-card-tags">
        ${l.pieces.slice(0,4).map(p=>`<span class="saved-tag">${p.icon} ${p.type}</span>`).join('')}
      </div>
    </div>`).join('');
}

/* ── INIT ── */
goToStep(1);
renderSaved();

/* ── READ PRE-FILL FROM TRENDING PAGE ── */
(function applyPrefill() {
  const raw = sessionStorage.getItem('ff_prefill');
  if (!raw) return;
  sessionStorage.removeItem('ff_prefill');

  try {
    const p = JSON.parse(raw);

    // vibes (checkboxes)
    if (p.vibes) {
      document.querySelectorAll('input[name="q-vibe"]').forEach(cb => {
        cb.checked = p.vibes.includes(cb.value);
      });
    }
    // colors (checkboxes)
    if (p.colors) {
      document.querySelectorAll('input[name="q-color"]').forEach(cb => {
        cb.checked = p.colors.includes(cb.value);
      });
    }
    // budget (radio)
    if (p.budget) {
      const el = document.querySelector(`input[name="q-budget"][value="${p.budget}"]`);
      if (el) el.checked = true;
    }
    // season (radio)
    if (p.season) {
      const el = document.querySelector(`input[name="q-season"][value="${p.season}"]`);
      if (el) el.checked = true;
    }

    // Store in answers so generate works immediately
    answers.vibes  = p.vibes  || [];
    answers.colors = p.colors || [];
    answers.budget = p.budget || '';
    answers.season = p.season || '';

    // Show a toast so user knows it's pre-filled
    showToast('Style pre-filled from your selection ✨', 'success');
  } catch (e) { /* ignore */ }
})();
