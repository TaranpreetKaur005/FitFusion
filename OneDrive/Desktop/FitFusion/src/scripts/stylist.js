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

/* ── OUTFIT TYPE THEMES (fallback CSS visual) ── */
const THEMES = {
  casual:  { bg: 'linear-gradient(145deg,#e0f2fe,#f0fdf4)', top: '#3b82f6', bottom: '#1d4ed8', shoe: '#93c5fd' },
  work:    { bg: 'linear-gradient(145deg,#f0f9ff,#e0e7ff)', top: '#1e3a5f', bottom: '#374151', shoe: '#6b7280' },
  party:   { bg: 'linear-gradient(145deg,#1a1a2e,#2d1b69)',  top: '#d4af37', bottom: '#1a1a2e', shoe: '#f5f5f0' },
  date:    { bg: 'linear-gradient(145deg,#fdf2f8,#fce7f3)',  top: '#c9a0a0', bottom: '#722f37', shoe: '#c19a6b' },
  sport:   { bg: 'linear-gradient(145deg,#f0fdf4,#ecfdf5)',  top: '#3b82f6', bottom: '#111827', shoe: '#10b981' },
  formal:  { bg: 'linear-gradient(145deg,#111827,#1f2937)',  top: '#0a0a0a', bottom: '#0a0a0a', shoe: '#c0c0c0' },
  default: { bg: 'linear-gradient(145deg,#f5f3ff,#fdf2f8)',  top: '#7c3aed', bottom: '#4c1d95', shoe: '#a78bfa' },
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
   AI IMAGE GENERATION
   Uses Pollinations.ai — free, no API key
   Model: flux (best quality)
══════════════════════════════ */

let currentImageUrl = null;

/* ── GENDER → model descriptor ── */
const GENDER_MAP = {
  women:  'beautiful young woman',
  men:    'handsome young man',
  unisex: 'androgynous fashion model',
};

/* ── FIT → silhouette descriptor ── */
const FIT_MAP = {
  oversized:    'oversized relaxed silhouette',
  fitted:       'slim fitted tailored silhouette',
  balanced:     'balanced proportional silhouette',
  flowy:        'flowy draped silhouette',
};

/* ── VIBE → style keywords ── */
const VIBE_MAP = {
  minimal:    'minimalist clean aesthetic',
  streetwear: 'urban streetwear aesthetic',
  classic:    'timeless classic elegance',
  boho:       'bohemian free-spirited style',
  edgy:       'edgy dark fashion aesthetic',
  luxe:       'high-end luxury fashion',
  sporty:     'athletic sporty activewear',
  vintage:    'vintage retro fashion',
  preppy:     'preppy collegiate style',
};

/* ── COLOR → palette descriptor ── */
const COLOR_MAP = {
  neutrals: 'neutral beige cream ivory tones',
  earth:    'earthy terracotta rust brown tones',
  pastels:  'soft pastel pink lavender blue tones',
  bold:     'bold vibrant red orange yellow tones',
  mono:     'monochrome black white grey tones',
  jewel:    'jewel tone sapphire emerald amethyst',
  warm:     'warm coral peach rose gold tones',
  neon:     'neon electric bright fluorescent tones',
};

/* ── SEASON → environment ── */
const SEASON_MAP = {
  spring: 'spring garden background, soft natural light',
  summer: 'bright summer outdoor background, golden sunlight',
  autumn: 'autumn park background, warm golden hour light',
  winter: 'winter indoor studio, cool crisp lighting',
};

/* ── TIME → lighting ── */
const TIME_MAP = {
  morning:   'soft morning golden hour lighting',
  afternoon: 'bright natural daylight',
  evening:   'warm evening ambient lighting',
  night:     'dramatic night club neon lighting',
};

/* ── BODY → pose guidance ── */
const BODY_MAP = {
  hourglass:  'hourglass figure, confident pose',
  pear:       'pear shaped figure, elegant pose',
  apple:      'apple shaped figure, stylish pose',
  rectangle:  'athletic rectangular figure, dynamic pose',
  inverted:   'inverted triangle figure, powerful pose',
};

/* ── CULTURE → modesty ── */
const CULTURE_MAP = {
  modest:       'modest covered clothing, full coverage',
  conservative: 'conservative professional attire',
  traditional:  'traditional cultural fashion elements',
};

/* Build the highest-quality fashion prompt — uses full piece descriptions */
function buildImagePrompt(answers, outfitLabel, pieces) {
  const genderDesc  = GENDER_MAP[answers.gender]  || 'fashion model';
  const fitDesc     = FIT_MAP[answers.fit]         || '';
  const vibeDescs   = (answers.vibes  || []).map(v => VIBE_MAP[v]).filter(Boolean).join(', ');
  const colorDescs  = (answers.colors || []).map(c => COLOR_MAP[c]).filter(Boolean).join(', ');
  const seasonDesc  = SEASON_MAP[answers.season]   || 'neutral studio background';
  const timeDesc    = TIME_MAP[answers.time]        || 'professional studio lighting';
  const bodyDesc    = answers.body && answers.body !== 'any' ? (BODY_MAP[answers.body] || '') : '';
  const cultureDesc = answers.culture && answers.culture !== 'none' ? (CULTURE_MAP[answers.culture] || '') : '';

  /* ── Build per-piece descriptions using BOTH name + detail ──
     e.g. "Oversized Linen Tee (relaxed fit, neutral tones)"
          "Straight-leg Jeans (mid-rise, light wash)"
          "Satin Slip Top (bias cut, champagne)"
  */
  const pieceDescriptions = pieces.map(p => {
    // Clean the detail: remove "·" separators, lowercase
    const cleanDetail = p.detail
      .replace(/·/g, ',')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    return `${p.name} (${cleanDetail})`;
  }).join(', ');

  /* ── Extract dominant colors from palette details ──
     e.g. "Champagne or black", "Dusty rose or burgundy"
  */
  const pieceColors = pieces
    .map(p => {
      // Pull color words from detail field
      const colorWords = p.detail.match(/(?:black|white|navy|beige|cream|ivory|gold|silver|nude|tan|camel|rose|burgundy|champagne|charcoal|brown|blue|green|red|grey|gray|stone|indigo|mint|coral|lavender|pink|orange|yellow|purple|teal|olive)/gi);
      return colorWords ? colorWords.join(', ') : null;
    })
    .filter(Boolean)
    .join(', ');

  /* ── Build the final structured prompt ── */
  const positive = [
    // 1. Subject
    `professional fashion editorial photograph of a ${genderDesc}`,
    bodyDesc,

    // 2. Exact outfit — name + detail for every piece
    `wearing: ${pieceDescriptions}`,

    // 3. Fit & silhouette
    fitDesc,

    // 4. Style aesthetic
    vibeDescs || '',

    // 5. Color story — from both user palette AND piece details
    [colorDescs, pieceColors].filter(Boolean).join(', '),

    // 6. Cultural/modesty
    cultureDesc,

    // 7. Environment & lighting
    seasonDesc,
    timeDesc,

    // 8. Shot composition
    'full body shot from head to toe showing complete outfit',
    'model standing, confident pose, looking at camera',

    // 9. Photography quality
    'Vogue magazine editorial style',
    'shot on Phase One IQ4 150MP medium format camera',
    'f/2.8 aperture, 85mm lens, shallow depth of field',
    'sharp focus on clothing texture and fabric details',
    'perfect lighting, no shadows on face',
    'high fashion lookbook photography',
    'ultra-high resolution, 8K, hyperrealistic, photorealistic',
    'award-winning fashion photography',
    'clean minimal background',
  ].filter(Boolean).join(', ');

  /* ── Negative prompt — everything we don't want ── */
  const negative = [
    'ugly', 'deformed', 'disfigured', 'blurry', 'low quality', 'low resolution',
    'bad anatomy', 'bad proportions', 'extra limbs', 'missing limbs', 'missing fingers',
    'extra fingers', 'fused fingers', 'mutated hands', 'poorly drawn hands',
    'watermark', 'text', 'logo', 'signature', 'username',
    'cartoon', 'anime', 'illustration', 'painting', 'drawing', 'sketch', 'render', 'CGI',
    'nsfw', 'nude', 'explicit', 'revealing',
    'cropped', 'cut off', 'out of frame', 'partial body',
    'duplicate', 'clone', 'multiple people',
    'overexposed', 'underexposed', 'grainy', 'noise',
  ].join(', ');

  return { positive, negative };
}

/* Show loading skeleton */
function showImageLoading(container) {
  container.innerHTML = `
    <div class="r-img-loading">
      <div class="r-img-shimmer"></div>
      <div class="r-img-loading-text">
        <div class="r-img-spinner"></div>
        <span>Generating your look with AI…</span>
      </div>
      <div class="r-img-loading-sub">This takes 10–20 seconds</div>
    </div>`;
}

/* Show error fallback (CSS mannequin) */
function showImageFallback(container, type, vibes) {
  const theme = THEMES[type] || THEMES.default;
  const tags  = (vibes || []).slice(0, 2);
  container.innerHTML = `
    <div style="width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:16px">
      <div style="position:absolute;inset:0;background:${theme.bg};opacity:0.95"></div>
      ${tags.length ? `<div style="position:absolute;top:10px;left:10px;display:flex;flex-direction:column;gap:4px;z-index:3">
        ${tags.map(t => `<span style="background:rgba(255,255,255,0.85);backdrop-filter:blur(8px);border-radius:50px;padding:3px 10px;font-size:10px;font-weight:600;color:#4c1d95">${t}</span>`).join('')}
      </div>` : ''}
      <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.9);box-shadow:0 4px 12px rgba(0,0,0,0.2)"></div>
        <div style="width:72px;height:80px;border-radius:10px 10px 6px 6px;background:${theme.top};box-shadow:0 6px 18px rgba(0,0,0,0.25);position:relative">
          <div style="position:absolute;top:10px;left:-18px;width:20px;height:48px;border-radius:6px;background:${theme.top};opacity:0.85;transform:rotate(-8deg)"></div>
          <div style="position:absolute;top:10px;right:-18px;width:20px;height:48px;border-radius:6px;background:${theme.top};opacity:0.85;transform:rotate(8deg)"></div>
        </div>
        <div style="width:76px;height:90px;border-radius:4px 4px 14px 14px;background:${theme.bottom};box-shadow:0 6px 18px rgba(0,0,0,0.2);position:relative">
          <div style="position:absolute;bottom:0;left:2px;width:34px;height:58px;border-radius:0 0 10px 10px;background:${theme.bottom};filter:brightness(0.82)"></div>
          <div style="position:absolute;bottom:0;right:2px;width:34px;height:58px;border-radius:0 0 10px 10px;background:${theme.bottom};filter:brightness(0.82)"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:2px">
          <div style="width:30px;height:11px;border-radius:0 0 6px 6px;background:${theme.shoe};box-shadow:0 3px 8px rgba(0,0,0,0.2)"></div>
          <div style="width:30px;height:11px;border-radius:0 0 6px 6px;background:${theme.shoe};box-shadow:0 3px 8px rgba(0,0,0,0.2)"></div>
        </div>
      </div>
      <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;white-space:nowrap">Style Preview ✨</div>
    </div>`;
  document.getElementById('r-img-caption').textContent = 'AI image unavailable — showing style preview';
}

/* Load image with timeout — returns Promise<HTMLImageElement> */
function loadImageWithTimeout(url, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const img     = new Image();
    const timer   = setTimeout(() => {
      img.src = ''; // cancel
      reject(new Error('timeout'));
    }, timeoutMs);

    img.onload  = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('load error')); };
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/* Render loaded image into container */
function renderImage(container, img, outfitLabel) {
  container.innerHTML = '';
  container.style.background = 'none';
  container.style.position   = 'relative';

  const imgEl = document.createElement('img');
  imgEl.src   = img.src;
  imgEl.alt   = outfitLabel;
  imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:16px;display:block';
  container.appendChild(imgEl);

  const badge = document.createElement('div');
  badge.style.cssText = [
    'position:absolute',
    'bottom:12px',
    'right:12px',
    'background:rgba(0,0,0,0.6)',
    'backdrop-filter:blur(10px)',
    '-webkit-backdrop-filter:blur(10px)',
    'color:white',
    'font-size:10px',
    'font-weight:700',
    'padding:5px 12px',
    'border-radius:50px',
    'letter-spacing:0.5px',
    'border:1px solid rgba(255,255,255,0.15)',
  ].join(';');
  badge.textContent = '✨ AI Generated';
  container.appendChild(badge);
}

/* Main generation function — tries up to 2 attempts */
async function generateOutfitImage(answers, outfitLabel, pieces, type) {
  const container = document.getElementById('r-outfit-visual');
  const caption   = document.getElementById('r-img-caption');
  const dlBtn     = document.getElementById('r-img-download');
  const regenBtn  = document.getElementById('r-img-regen');

  currentImageUrl   = null;
  dlBtn.disabled    = true;
  regenBtn.disabled = true;
  showImageLoading(container);
  caption.textContent = '';

  const { positive, negative } = buildImagePrompt(answers, outfitLabel, pieces);
  const seed = Math.floor(Math.random() * 9999999);

  // Pollinations.ai — flux model, 768×1024 portrait, enhanced
  const buildUrl = (s) =>
    `https://image.pollinations.ai/prompt/${encodeURIComponent(positive)}` +
    `?width=768&height=1024&seed=${s}&model=flux&enhance=true&nologo=true` +
    `&negative=${encodeURIComponent(negative)}`;

  let succeeded = false;

  // Attempt 1
  try {
    const img = await loadImageWithTimeout(buildUrl(seed), 45000);
    renderImage(container, img, outfitLabel);
    currentImageUrl = img.src;
    dlBtn.disabled  = false;
    caption.textContent = `"${outfitLabel}" · AI-generated fashion photo`;
    succeeded = true;
  } catch (e1) {
    // Attempt 2 — different seed, shorter timeout
    try {
      showImageLoading(container);
      caption.textContent = 'Retrying…';
      const img2 = await loadImageWithTimeout(buildUrl(seed + 1), 35000);
      renderImage(container, img2, outfitLabel);
      currentImageUrl = img2.src;
      dlBtn.disabled  = false;
      caption.textContent = `"${outfitLabel}" · AI-generated fashion photo`;
      succeeded = true;
    } catch (e2) {
      showImageFallback(container, type, answers.vibes);
      showToast('AI image unavailable — showing style preview', 'error');
    }
  }

  regenBtn.disabled = false;
  if (succeeded) showToast('AI image generated ✨', 'success');
}

/* ── DOWNLOAD IMAGE ── */
document.getElementById('r-img-download')?.addEventListener('click', async () => {
  if (!currentImageUrl) return;
  const dlBtn = document.getElementById('r-img-download');
  dlBtn.textContent = '⏳ Downloading…';
  dlBtn.disabled = true;
  try {
    const res  = await fetch(currentImageUrl);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fitfusion-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Image downloaded ✓', 'success');
  } catch {
    window.open(currentImageUrl, '_blank');
    showToast('Opened in new tab ✓', 'success');
  } finally {
    dlBtn.textContent = '⬇ Download';
    dlBtn.disabled = false;
  }
});

/* ── REGENERATE IMAGE ── */
document.getElementById('r-img-regen')?.addEventListener('click', () => {
  if (!lastAnswers) return;
  const type  = lastType || detectType(lastAnswers);
  const data  = DB[type];
  const label = document.getElementById('r-badge').textContent;
  generateOutfitImage(lastAnswers, label, data.pieces, type);
});

/* ══════════════════════════════
   QUESTIONNAIRE
══════════════════════════════ */
const TOTAL = 9;
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
    case 6: { const v = document.querySelector('input[name="q-season"]:checked');  if (!v) { showToast('Please select a season.','error'); return false; } answers.season = v.value; return true; }
    case 7: { const v = document.querySelector('input[name="q-time"]:checked'); if (!v) { showToast('Please select a time of day.','error'); return false; } answers.time = v.value; return true; }
    case 8: { const v = document.querySelector('input[name="q-body"]:checked'); if (!v) { showToast('Please select a body type.','error'); return false; } answers.body = v.value; return true; }
    case 9: { const v = document.querySelector('input[name="q-culture"]:checked'); if (!v) { showToast('Please select a dress code preference.','error'); return false; } answers.culture = v.value; answers.extras = document.getElementById('q-extras').value.trim(); return true; }
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
   CONFIDENCE SCORE
══════════════════════════════ */
function calcConfidence(a) {
  let score = 70;
  if (a.vibes?.length >= 2) score += 8;
  if (a.colors?.length >= 2) score += 6;
  if (a.budget) score += 4;
  if (a.body && a.body !== 'any') score += 5;
  if (a.culture) score += 4;
  if (a.time) score += 3;
  if (a.extras?.length > 10) score += 5;
  return Math.min(score, 99);
}

function getConfidenceDesc(score) {
  if (score >= 95) return 'Perfect match for your unique style';
  if (score >= 88) return 'Excellent match for your profile';
  if (score >= 80) return 'Great fit for your preferences';
  if (score >= 70) return 'Good match — try adding more details';
  return 'Decent match — more answers = better results';
}

/* ══════════════════════════════
   SHOW RESULT (no reload)
══════════════════════════════ */
let lastAnswers = null;
let lastType    = null;

function showResult(a) {
  lastAnswers = a;
  const type  = detectType(a);
  lastType    = type;
  const data  = DB[type];

  let label = data.label;
  if (a.season) label = a.season.charAt(0).toUpperCase() + a.season.slice(1) + ' ' + label;
  if (a.budget === 'luxury') label = 'Luxury ' + label;

  document.getElementById('r-badge').textContent = label;

  // ── TRIGGER AI IMAGE GENERATION ──
  generateOutfitImage(a, label, data.pieces, type);

  // Confidence score
  const score = calcConfidence(a);
  const scoreEl = document.getElementById('r-conf-score');
  const fillEl2 = document.getElementById('r-conf-fill');
  const descEl  = document.getElementById('r-conf-desc');
  if (scoreEl) scoreEl.textContent = score + '%';
  if (fillEl2) fillEl2.style.width = score + '%';
  if (descEl)  descEl.textContent  = getConfidenceDesc(score);

  // Profile summary
  const summaryEl = document.getElementById('r-profile-summary');
  if (summaryEl) {
    const chips = [
      a.gender   && `${a.gender === 'women' ? '👩' : a.gender === 'men' ? '👨' : '🧑'} ${a.gender}`,
      a.fit      && `✂️ ${a.fit}`,
      a.time     && `🕐 ${a.time}`,
      a.body     && a.body !== 'any' && `🧍 ${a.body}`,
      a.season   && `🌤 ${a.season}`,
      a.budget   && `💳 ${a.budget}`,
      a.culture  && a.culture !== 'none' && `🌍 ${a.culture}`,
    ].filter(Boolean);
    summaryEl.innerHTML = chips.map(c => `<span class="r-profile-chip">${c}</span>`).join('');
  }

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

/* ── REDO ── */
document.getElementById('r-redo').addEventListener('click', () => {
  if (lastAnswers) showResult(lastAnswers);
});

/* ── START OVER ── */
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

/* ══════════════════════════════
   SAVE LOOK → WARDROBE
══════════════════════════════ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

document.getElementById('r-save').addEventListener('click', () => {
  if (!lastAnswers) return;
  const type  = lastType || detectType(lastAnswers);
  const data  = DB[type];
  const label = document.getElementById('r-badge').textContent;

  const look = {
    id:      generateId(),
    label,
    type,
    pieces:  data.pieces,
    tips:    data.tips,
    palette: data.palette,
    answers: lastAnswers,
    imgUrl:  currentImageUrl || null,
    ts:      new Date().toLocaleString(),
    fav:     false,
  };

  const saved = JSON.parse(localStorage.getItem('ff_saved_looks') || '[]');
  saved.unshift(look);
  if (saved.length > 50) saved.pop();
  localStorage.setItem('ff_saved_looks', JSON.stringify(saved));

  showToast('Look saved to Wardrobe 👗', 'success');

  // Update save button
  const saveBtn = document.getElementById('r-save');
  saveBtn.textContent = '✓ Saved to Wardrobe';
  saveBtn.style.background = 'rgba(16,185,129,0.08)';
  saveBtn.style.borderColor = '#10b981';
  saveBtn.style.color = '#10b981';
  setTimeout(() => {
    saveBtn.textContent = '🔖 Save This Look';
    saveBtn.style.background = '';
    saveBtn.style.borderColor = '';
    saveBtn.style.color = '';
  }, 3000);
});

/* ── WARDROBE LINK ── */
const wdLink = document.getElementById('r-wardrobe-link');
if (wdLink) {
  wdLink.addEventListener('click', () => {
    window.location.href = 'wardrobe.html';
  });
}

/* ── EXPORT REPORT ── */
document.getElementById('r-export-btn')?.addEventListener('click', () => {
  if (!lastAnswers) return;
  const type  = lastType || detectType(lastAnswers);
  const data  = DB[type];
  const label = document.getElementById('r-badge').textContent;
  const score = calcConfidence(lastAnswers);

  const lines = [
    '═══════════════════════════════════',
    '        🔥 FITFUSION OUTFIT REPORT',
    '═══════════════════════════════════',
    '',
    `Look: ${label}`,
    `Style Match Score: ${score}%`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '── YOUR PROFILE ──',
    `Gender: ${lastAnswers.gender || '—'}`,
    `Fit: ${lastAnswers.fit || '—'}`,
    `Vibes: ${(lastAnswers.vibes || []).join(', ') || '—'}`,
    `Colours: ${(lastAnswers.colors || []).join(', ') || '—'}`,
    `Budget: ${lastAnswers.budget || '—'}`,
    `Season: ${lastAnswers.season || '—'}`,
    `Time: ${lastAnswers.time || '—'}`,
    `Body Type: ${lastAnswers.body || '—'}`,
    `Dress Code: ${lastAnswers.culture || '—'}`,
    lastAnswers.extras ? `Notes: ${lastAnswers.extras}` : '',
    '',
    '── OUTFIT PIECES ──',
    ...data.pieces.map(p => `${p.icon} ${p.type}: ${p.name} — ${p.detail}`),
    '',
    '── STYLING TIPS ──',
    ...data.tips.map((t, i) => `${i + 1}. ${t}`),
    '',
    '── COLOUR PALETTE ──',
    ...data.palette.map(s => `● ${s.name} (${s.color})`),
    '',
    '═══════════════════════════════════',
    '  Generated by FitFusion AI Stylist',
    '═══════════════════════════════════',
  ].filter(l => l !== undefined).join('\n');

  const blob = new Blob([lines], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `fitfusion-${label.replace(/\s+/g, '-').toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report downloaded ✓', 'success');
});

/* ── INIT ── */
goToStep(1);

/* ── READ PRE-FILL FROM TRENDING PAGE ── */
(function applyPrefill() {
  const raw = sessionStorage.getItem('ff_prefill');
  if (!raw) return;
  sessionStorage.removeItem('ff_prefill');

  try {
    const p = JSON.parse(raw);

    if (p.vibes) {
      document.querySelectorAll('input[name="q-vibe"]').forEach(cb => {
        cb.checked = p.vibes.includes(cb.value);
      });
    }
    if (p.colors) {
      document.querySelectorAll('input[name="q-color"]').forEach(cb => {
        cb.checked = p.colors.includes(cb.value);
      });
    }
    if (p.budget) {
      const el = document.querySelector(`input[name="q-budget"][value="${p.budget}"]`);
      if (el) el.checked = true;
    }
    if (p.season) {
      const el = document.querySelector(`input[name="q-season"][value="${p.season}"]`);
      if (el) el.checked = true;
    }

    answers.vibes  = p.vibes  || [];
    answers.colors = p.colors || [];
    answers.budget = p.budget || '';
    answers.season = p.season || '';

    showToast('Style pre-filled from your selection ✨', 'success');
  } catch (e) { /* ignore */ }
})();
