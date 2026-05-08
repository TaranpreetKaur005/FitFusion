/* ══════════════════════════════
   TRENDY SUGGESTIONS — data + render
══════════════════════════════ */

// Each trend maps to a stylist.js DB key + pre-filled questionnaire answers
const TRENDS = [
  {
    cat: 'minimal',
    title: 'Quiet Luxury Essentials',
    desc: 'Cashmere knits, tailored trousers and leather loafers — the uniform of understated wealth.',
    img: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Cashmere', 'Neutral', 'Tailored'],
    heat: '🔥🔥🔥 Blazing',
    prefill: { vibes: ['minimal','luxe'], colors: ['neutrals','earth'], budget: 'premium', season: 'autumn' },
  },
  {
    cat: 'streetwear',
    title: 'Oversized Varsity Jackets',
    desc: 'Collegiate energy meets street culture. Layer over a graphic tee and wide-leg cargos.',
    img: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Varsity', 'Oversized', 'Streetwear'],
    heat: '🔥🔥🔥 Blazing',
    prefill: { vibes: ['streetwear','edgy'], colors: ['bold','mono'], budget: 'mid', season: 'autumn' },
  },
  {
    cat: 'luxe',
    title: 'Satin & Silk Everything',
    desc: 'Liquid fabrics are having a major moment — from slip dresses to wide-leg trousers.',
    img: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Satin', 'Silk', 'Evening'],
    heat: '🔥🔥 Hot',
    prefill: { vibes: ['luxe','classic'], colors: ['jewel','neutrals'], budget: 'luxury', season: 'winter' },
  },
  {
    cat: 'boho',
    title: 'Earthy Boho Revival',
    desc: 'Terracotta, rust and sage tones in flowy silhouettes. Fringe, crochet and natural textures.',
    img: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Boho', 'Earth Tones', 'Flowy'],
    heat: '🔥🔥 Hot',
    prefill: { vibes: ['boho','vintage'], colors: ['earth','warm'], budget: 'mid', season: 'spring' },
  },
  {
    cat: 'sport',
    title: 'Gorpcore Goes Mainstream',
    desc: 'Technical outdoor gear styled as everyday fashion. Fleece vests, trail shoes and utility pockets.',
    img: 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Gorpcore', 'Outdoor', 'Technical'],
    heat: '🔥🔥🔥 Blazing',
    prefill: { vibes: ['sporty','streetwear'], colors: ['bold','mono'], budget: 'mid', season: 'winter' },
  },
  {
    cat: 'formal',
    title: 'Power Suiting Reimagined',
    desc: 'Oversized blazers with wide-leg trousers in bold checks and pinstripes. Worn with sneakers.',
    img: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Blazer', 'Power Suit', 'Bold'],
    heat: '🔥🔥 Hot',
    prefill: { vibes: ['classic','luxe'], colors: ['mono','neutrals'], budget: 'premium', season: 'autumn' },
  },
  {
    cat: 'minimal',
    title: 'Monochrome Dressing',
    desc: 'Head-to-toe single colour dressing creates an effortlessly chic, elongated silhouette.',
    img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Monochrome', 'Minimal', 'Sleek'],
    heat: '🔥🔥 Hot',
    prefill: { vibes: ['minimal','classic'], colors: ['mono','neutrals'], budget: 'mid', season: 'winter' },
  },
  {
    cat: 'streetwear',
    title: 'Cargo Pants Comeback',
    desc: 'Utility pockets are back and bigger than ever. Style with a fitted crop and chunky boots.',
    img: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Cargo', 'Utility', 'Y2K'],
    heat: '🔥🔥🔥 Blazing',
    prefill: { vibes: ['streetwear','edgy'], colors: ['earth','mono'], budget: 'budget', season: 'spring' },
  },
  {
    cat: 'luxe',
    title: 'Statement Coats',
    desc: 'The coat is the outfit. Sculptural, oversized and in unexpected colours — let it do the talking.',
    img: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Coat', 'Statement', 'Outerwear'],
    heat: '🔥🔥 Hot',
    prefill: { vibes: ['luxe','classic'], colors: ['jewel','warm'], budget: 'luxury', season: 'winter' },
  },
];

const COLOR_STORIES = [
  {
    name: 'Digital Lavender',
    desc: 'The colour of calm. Pairs beautifully with white, silver and soft grey.',
    swatches: ['#e8d5f5', '#c9a8e8', '#a87fd4', '#7c52b8'],
  },
  {
    name: 'Terracotta Warmth',
    desc: 'Earthy and grounding. Works with cream, rust and olive green.',
    swatches: ['#f5c5a3', '#e8956d', '#c96a3a', '#8b3a1a'],
  },
  {
    name: 'Midnight Blues',
    desc: 'Deep and sophisticated. Pair with gold, ivory or burgundy accents.',
    swatches: ['#b8c8e8', '#6b8fc4', '#2d5a9e', '#0d2b5e'],
  },
  {
    name: 'Sage & Moss',
    desc: 'Nature-inspired and versatile. Pairs with tan, cream and warm browns.',
    swatches: ['#d4e8c8', '#a8c896', '#6b9e5a', '#3a6b2a'],
  },
];

const FORMULAS = [
  {
    title: 'The Effortless Classic',
    pieces: [
      { icon: '👕', name: 'White fitted tee' },
      { icon: '👖', name: 'Dark straight jeans' },
      { icon: '🧥', name: 'Unstructured blazer' },
      { icon: '👟', name: 'Clean leather sneakers' },
    ],
    tip: 'Tuck the tee halfway for a relaxed-polished balance.',
    prefill: { vibes: ['minimal','classic'], colors: ['neutrals'], budget: 'mid', season: 'spring' },
  },
  {
    title: 'The Power Move',
    pieces: [
      { icon: '🧥', name: 'Oversized blazer' },
      { icon: '👗', name: 'Fitted midi skirt' },
      { icon: '👠', name: 'Block heel mules' },
      { icon: '👜', name: 'Mini structured bag' },
    ],
    tip: 'Clash the blazer and skirt in complementary tones.',
    prefill: { vibes: ['classic','luxe'], colors: ['neutrals','jewel'], budget: 'premium', season: 'autumn' },
  },
  {
    title: 'The Street Edit',
    pieces: [
      { icon: '🧢', name: 'Graphic hoodie' },
      { icon: '👖', name: 'Wide-leg cargos' },
      { icon: '👟', name: 'Chunky sneakers' },
      { icon: '🎒', name: 'Mini backpack' },
    ],
    tip: 'Keep the colour palette tight — max 2 tones.',
    prefill: { vibes: ['streetwear','edgy'], colors: ['mono','bold'], budget: 'budget', season: 'spring' },
  },
  {
    title: 'The Luxe Casual',
    pieces: [
      { icon: '👕', name: 'Cashmere knit top' },
      { icon: '👖', name: 'Tailored wide-leg trousers' },
      { icon: '👞', name: 'Leather loafers' },
      { icon: '🕶', name: 'Oversized sunglasses' },
    ],
    tip: 'Invest in one quality piece — it elevates everything else.',
    prefill: { vibes: ['luxe','minimal'], colors: ['neutrals','earth'], budget: 'luxury', season: 'summer' },
  },
  {
    title: 'The Date Night Formula',
    pieces: [
      { icon: '👗', name: 'Wrap midi dress' },
      { icon: '👠', name: 'Strappy heels' },
      { icon: '👛', name: 'Clutch bag' },
      { icon: '💍', name: 'Delicate gold jewellery' },
    ],
    tip: 'One statement accessory is all you need.',
    prefill: { vibes: ['classic','luxe'], colors: ['pastels','warm'], budget: 'premium', season: 'summer' },
  },
  {
    title: 'The Weekend Warrior',
    pieces: [
      { icon: '🧥', name: 'Oversized denim jacket' },
      { icon: '👕', name: 'Vintage band tee' },
      { icon: '🩳', name: 'Linen shorts' },
      { icon: '🩴', name: 'Leather sandals' },
    ],
    tip: 'Roll the jacket sleeves for a more relaxed vibe.',
    prefill: { vibes: ['vintage','boho'], colors: ['earth','neutrals'], budget: 'budget', season: 'summer' },
  },
];

const TIPS = [
  { icon: '🪞', title: 'Fit Over Everything', text: 'A perfectly fitted basic beats an ill-fitting designer piece every single time.' },
  { icon: '🎨', title: 'The 60-30-10 Rule', text: '60% dominant colour, 30% secondary, 10% accent. Foolproof every time.' },
  { icon: '👟', title: 'Shoes Make the Outfit', text: 'Swap the shoes and you have a completely different look. Invest wisely.' },
  { icon: '🧴', title: 'Fabric Quality Matters', text: 'Natural fibres like cotton, linen and wool always look more expensive.' },
  { icon: '📐', title: 'Mix Proportions', text: 'Pair oversized tops with slim bottoms, or fitted tops with wide-leg trousers.' },
  { icon: '✨', title: 'One Statement Piece', text: 'Build your outfit around one hero piece and keep everything else simple.' },
  { icon: '🔄', title: 'Capsule Thinking', text: '10 versatile pieces can create 30+ outfits. Quality over quantity always.' },
  { icon: '🌈', title: 'Neutrals Are Your Base', text: 'Build a neutral wardrobe foundation, then add colour through accessories.' },
];

/* ── NAVIGATE TO STYLIST WITH PRE-FILLED ANSWERS ── */
function tryThisLook(prefill) {
  // Auth gate
  if (!localStorage.getItem('ff_user')) {
    sessionStorage.setItem('ff_return', 'stylist.html');
    sessionStorage.setItem('ff_prefill', JSON.stringify(prefill));
    window.location.href = 'auth.html';
    return;
  }
  sessionStorage.setItem('ff_prefill', JSON.stringify(prefill));
  window.location.href = 'stylist.html';
}

/* ── RENDER TREND CARDS ── */
function renderCards(cat) {
  const grid     = document.getElementById('tr-grid');
  const filtered = cat === 'all' ? TRENDS : TRENDS.filter(t => t.cat === cat);

  grid.innerHTML = filtered.map((t, i) => `
    <div class="tr-card" style="animation-delay:${i * 0.07}s">
      <div class="tr-card-img-wrap">
        <img
          class="tr-card-img"
          src="${t.img}"
          alt="${t.title}"
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.classList.add('img-error')"
        >
        <div class="tr-card-img-fallback">
          <span>${t.tags[0]}</span>
        </div>
      </div>
      <div class="tr-card-body">
        <div class="tr-card-cat">${t.cat.toUpperCase()}</div>
        <div class="tr-card-title">${t.title}</div>
        <div class="tr-card-desc">${t.desc}</div>
        <div class="tr-card-tags">${t.tags.map(tag => `<span class="tr-tag">${tag}</span>`).join('')}</div>
      </div>
      <div class="tr-card-footer">
        <span class="tr-heat">${t.heat}</span>
        <button class="tr-try-btn" data-idx="${TRENDS.indexOf(t)}">Try This Look</button>
      </div>
    </div>
  `).join('');

  // Attach click handlers
  grid.querySelectorAll('.tr-try-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trend = TRENDS[+btn.dataset.idx];
      tryThisLook(trend.prefill);
    });
  });
}

/* ── RENDER COLOUR STORIES ── */
function renderColorStories() {
  document.getElementById('tr-color-stories').innerHTML = COLOR_STORIES.map(cs => `
    <div class="tr-color-story">
      <div class="tr-cs-swatches">
        ${cs.swatches.map(c => `<div class="tr-cs-swatch" style="background:${c}"></div>`).join('')}
      </div>
      <div class="tr-cs-body">
        <div class="tr-cs-name">${cs.name}</div>
        <div class="tr-cs-desc">${cs.desc}</div>
      </div>
    </div>
  `).join('');
}

/* ── RENDER FORMULAS ── */
function renderFormulas() {
  document.getElementById('tr-formulas').innerHTML = FORMULAS.map((f, i) => `
    <div class="tr-formula">
      <div class="tr-formula-num">${i + 1}</div>
      <div class="tr-formula-title">${f.title}</div>
      <div class="tr-formula-pieces">
        ${f.pieces.map(p => `
          <div class="tr-formula-piece">
            <span>${p.icon}</span><span>${p.name}</span>
          </div>`).join('')}
      </div>
      <div class="tr-formula-tip">${f.tip}</div>
      <button class="tr-try-btn tr-formula-try" data-fidx="${i}">Try This Look →</button>
    </div>
  `).join('');

  document.querySelectorAll('.tr-formula-try').forEach(btn => {
    btn.addEventListener('click', () => tryThisLook(FORMULAS[+btn.dataset.fidx].prefill));
  });
}

/* ── RENDER TIPS ── */
function renderTips() {
  document.getElementById('tr-tips-grid').innerHTML = TIPS.map(t => `
    <div class="tr-tip-card">
      <div class="tr-tip-icon">${t.icon}</div>
      <div class="tr-tip-title">${t.title}</div>
      <div class="tr-tip-text">${t.text}</div>
    </div>
  `).join('');
}

/* ── FILTER TABS ── */
document.querySelectorAll('.tr-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tr-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.cat);
  });
});

/* ── INIT ── */
renderCards('all');
renderColorStories();
renderFormulas();
renderTips();
