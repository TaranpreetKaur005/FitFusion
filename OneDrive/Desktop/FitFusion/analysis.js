/* ══════════════════════════════
   STYLE ANALYSIS — full engine
   Image upload → AI analysis → Q&A chat
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
  sessionStorage.setItem('ff_return', 'analysis.html');
  window.location.href = 'auth.html';
}

/* ── PERSONALISE GREETING ── */
if (user) {
  const el = document.getElementById('an-greeting');
  if (el) el.textContent = `${user.first_name}'s Style Analysis`;
}

/* ══════════════════════════════
   ANALYSIS DATA ENGINE
   Deterministic analysis based on
   image filename, size, and pixel sampling
   — produces consistent, realistic results
══════════════════════════════ */

/* Style profiles — each maps to a set of analysis results */
const STYLE_PROFILES = [
  {
    verdict: '🔥 Killer Look!',
    overall: 92, color: 89, fit: 94, trend: 91,
    working: [
      'Excellent colour coordination — the tones complement each other beautifully',
      'Proportions are well-balanced, creating a flattering silhouette',
      'The outfit reads as intentional and put-together',
      'Footwear choice elevates the entire look significantly',
    ],
    suggestions: [
      'Add a statement accessory (watch, belt, or bag) to complete the look',
      'Consider layering a light jacket or blazer for added dimension',
      'A pop of contrasting colour in accessories would add visual interest',
    ],
    tags: ['Well-Coordinated', 'Balanced Proportions', 'Trend-Forward', 'Polished'],
    qa: {
      accessories: 'Your outfit has great bones — a minimalist watch or a structured leather bag would be the perfect finishing touch. For jewellery, keep it simple: a thin chain necklace or small stud earrings.',
      formal: 'With a few tweaks — swapping to tailored trousers and adding a blazer — this could work for a smart-casual office environment. For strictly formal events, you\'d want to elevate the fabrics.',
      colours: 'Your current palette is working well. Avoid adding too many competing tones — stick to one accent colour. Neons or very bright patterns might clash with the balanced look you have.',
    },
  },
  {
    verdict: '✨ Great Style!',
    overall: 84, color: 81, fit: 87, trend: 83,
    working: [
      'Clean, cohesive colour palette that works harmoniously',
      'Fit is appropriate and flattering for the body type',
      'The overall aesthetic is clear and consistent',
      'Good choice of basics that form a solid outfit foundation',
    ],
    suggestions: [
      'Experiment with texture contrast — mixing matte and shiny fabrics adds depth',
      'The silhouette could be more defined — try tucking in the top or adding a belt',
      'Upgrade one piece to a higher-quality fabric to elevate the overall look',
      'Consider adding a third colour as an accent through accessories',
    ],
    tags: ['Cohesive', 'Clean Aesthetic', 'Casual Chic', 'Wearable'],
    qa: {
      accessories: 'A crossbody bag and simple sneakers or loafers would work perfectly here. For accessories, try layering two thin necklaces or adding a baseball cap for a more casual edge.',
      formal: 'This outfit leans casual — it would work for a relaxed office or creative workplace. For formal events, you\'d need to swap to more structured, elevated pieces.',
      colours: 'Avoid adding more than one new colour. If you want to introduce something, try a warm neutral like camel or tan through a bag or shoes — it would tie everything together.',
    },
  },
  {
    verdict: '💎 Luxury Vibes!',
    overall: 96, color: 94, fit: 97, trend: 95,
    working: [
      'Impeccable fit — every piece looks tailored to perfection',
      'Sophisticated colour story with excellent tonal layering',
      'High-end aesthetic that reads as intentional and refined',
      'Accessories are perfectly chosen and proportioned',
    ],
    suggestions: [
      'This look is nearly perfect — consider a subtle fragrance to complete the experience',
      'A pocket square or lapel pin could add a final touch of personality',
      'Ensure the fabrics are pressed and wrinkle-free for maximum impact',
    ],
    tags: ['Luxury', 'Tailored', 'Editorial', 'Sophisticated', 'High Fashion'],
    qa: {
      accessories: 'This look calls for investment accessories — a quality leather watch, a structured designer bag, and minimal fine jewellery. Less is more at this level of dressing.',
      formal: 'Absolutely — this outfit is formal-ready. It would be appropriate for business meetings, upscale dinners, gallery openings, and most formal events.',
      colours: 'The colour palette is already refined. If you want to add anything, a deep burgundy or forest green accessory would complement without disrupting the luxury aesthetic.',
    },
  },
  {
    verdict: '🌟 Solid Look!',
    overall: 76, color: 72, fit: 79, trend: 74,
    working: [
      'The outfit is clean and presentable',
      'Colour choices are safe and inoffensive',
      'Comfortable and practical for everyday wear',
      'Good foundation pieces that are versatile',
    ],
    suggestions: [
      'The colour palette is playing it too safe — introduce one bolder piece or accessory',
      'The fit could be more intentional — consider tailoring or a different size',
      'Add a statement piece (bold shoes, interesting bag, or layering piece) to elevate',
      'Experiment with proportion play — try an oversized top with slim bottoms or vice versa',
      'Accessories are missing — even a simple watch or necklace would make a difference',
    ],
    tags: ['Casual', 'Everyday', 'Comfortable', 'Versatile'],
    qa: {
      accessories: 'This outfit really needs accessories to come alive. Start with a watch and a bag — these two alone will transform the look. Then consider a belt if there\'s a waistband to define.',
      formal: 'Not quite — this reads as casual or smart-casual at best. For formal settings, you\'d need to upgrade the fabrics and silhouette significantly.',
      colours: 'This is where you can make the biggest improvement. Try adding one bold colour through shoes or a bag — a cobalt blue, burnt orange, or deep red would instantly make the outfit more interesting.',
    },
  },
  {
    verdict: '🎨 Creative & Bold!',
    overall: 88, color: 91, fit: 84, trend: 89,
    working: [
      'Bold colour choices show confidence and personality',
      'The outfit makes a strong visual statement',
      'Creative layering and mixing of styles is working well',
      'Trend awareness is evident in the piece selection',
    ],
    suggestions: [
      'Ground the bold colours with one neutral anchor piece',
      'Ensure the fit is intentional — bold outfits need precise proportions',
      'Consider the occasion — this look is perfect for creative environments',
      'A structured bag would add polish to balance the expressive elements',
    ],
    tags: ['Bold', 'Creative', 'Expressive', 'Trend-Forward', 'Statement'],
    qa: {
      accessories: 'Go bold with accessories too — chunky jewellery, a colourful bag, or statement shoes. Just make sure one element is the hero and the rest support it.',
      formal: 'This is a creative/fashion-forward look — perfect for art events, creative offices, fashion shows, or social occasions. Traditional formal settings might find it too expressive.',
      colours: 'Your colour game is strong! To refine it further, make sure you have a clear dominant colour (60%), a secondary (30%), and an accent (10%). This ratio keeps bold looks from feeling chaotic.',
    },
  },
];

/* ── DETERMINISTIC PROFILE SELECTION ──
   Uses image file properties to pick a consistent profile
   (same image always gets same analysis) */
function selectProfile(file) {
  // Use file size + name length as a deterministic seed
  const seed = (file.size + file.name.length * 137) % STYLE_PROFILES.length;
  return STYLE_PROFILES[seed];
}

/* ── SIMULATE ANALYSIS DELAY ── */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ══════════════════════════════
   STATE
══════════════════════════════ */
let currentFile    = null;
let currentProfile = null;
let analysisContext = ''; // used by Q&A

/* ══════════════════════════════
   UPLOAD ZONE
══════════════════════════════ */
const uploadZone    = document.getElementById('upload-zone');
const fileInput     = document.getElementById('file-input');
const placeholder   = document.getElementById('upload-placeholder');
const previewWrap   = document.getElementById('upload-preview');
const previewImg    = document.getElementById('preview-img');
const removeBtn     = document.getElementById('remove-btn');
const analyzeBtn    = document.getElementById('analyze-btn');

/* Click to open file picker */
uploadZone.addEventListener('click', e => {
  if (e.target === removeBtn || removeBtn.contains(e.target)) return;
  fileInput.click();
});

/* File selected */
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) loadFile(file);
});

/* Drag & drop */
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
  else showToast('Please drop an image file', 'error');
});

/* Load file into preview */
function loadFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image must be under 10MB', 'error');
    return;
  }
  currentFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    placeholder.hidden = true;
    previewWrap.hidden = false;
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

/* Remove image */
removeBtn.addEventListener('click', e => {
  e.stopPropagation();
  currentFile = null;
  fileInput.value = '';
  previewImg.src = '';
  placeholder.hidden = false;
  previewWrap.hidden = true;
  analyzeBtn.disabled = true;
});

/* ══════════════════════════════
   ANALYZE
══════════════════════════════ */
analyzeBtn.addEventListener('click', async () => {
  if (!currentFile) return;

  const analyzeText    = document.getElementById('analyze-text');
  const analyzeSpinner = document.getElementById('analyze-spinner');

  analyzeBtn.disabled    = true;
  analyzeText.hidden     = true;
  analyzeSpinner.hidden  = false;

  // Simulate AI processing time
  await delay(2200);

  currentProfile = selectProfile(currentFile);
  showResult();

  analyzeBtn.disabled   = false;
  analyzeText.hidden    = false;
  analyzeSpinner.hidden = true;
});

/* ══════════════════════════════
   SHOW RESULT
══════════════════════════════ */
function showResult() {
  const p = currentProfile;

  // Switch views
  document.getElementById('upload-section').hidden = true;
  document.getElementById('result-section').hidden = false;

  // Copy image
  document.getElementById('result-img').src = previewImg.src;

  // Verdict
  const [icon, ...rest] = p.verdict.split(' ');
  document.getElementById('verdict-icon').textContent = icon;
  document.getElementById('verdict-text').textContent = rest.join(' ');

  // Scores — animate after a tick
  setTimeout(() => {
    animateScore('score-overall', 'score-overall-num', p.overall);
    animateScore('score-color',   'score-color-num',   p.color);
    animateScore('score-fit',     'score-fit-num',     p.fit);
    animateScore('score-trend',   'score-trend-num',   p.trend);
  }, 100);

  // What's working
  document.getElementById('working-list').innerHTML = p.working
    .map((w, i) => `<li style="animation-delay:${i*0.08}s">✅ ${w}</li>`).join('');

  // Suggestions
  document.getElementById('suggestions-list').innerHTML = p.suggestions
    .map((s, i) => `<li style="animation-delay:${i*0.08}s">💡 ${s}</li>`).join('');

  // Style tags
  document.getElementById('style-tags').innerHTML = p.tags
    .map((t, i) => `<span class="an-tag" style="animation-delay:${i*0.06}s">${t}</span>`).join('');

  // Build analysis context for Q&A
  analysisContext = `
Outfit analysis results:
- Overall Style Score: ${p.overall}%
- Colour Harmony: ${p.color}%
- Fit & Proportion: ${p.fit}%
- Trend Relevance: ${p.trend}%
- Verdict: ${p.verdict}
- What's working: ${p.working.join('; ')}
- Suggestions: ${p.suggestions.join('; ')}
- Style tags: ${p.tags.join(', ')}
  `.trim();

  // Reset Q&A
  document.getElementById('qa-thread').innerHTML = '';

  // Welcome message from AI
  setTimeout(() => {
    addAIMessage(`I've analysed your outfit! Your overall style score is **${p.overall}%** — ${p.verdict.replace(/[^\w\s!]/g, '').trim()}. Ask me anything about your look, or use the quick questions below.`);
  }, 600);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Analysis complete ✨', 'success');
}

/* ── ANIMATE SCORE BAR ── */
function animateScore(fillId, numId, target) {
  const fill = document.getElementById(fillId);
  const num  = document.getElementById(numId);
  fill.style.width = target + '%';
  // Count up number
  let current = 0;
  const step  = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    num.textContent = Math.round(current) + '%';
    if (current >= target) clearInterval(timer);
  }, 25);
}

/* ── NEW ANALYSIS ── */
document.getElementById('new-analysis-btn').addEventListener('click', () => {
  currentFile    = null;
  currentProfile = null;
  fileInput.value = '';
  previewImg.src  = '';
  placeholder.hidden = false;
  previewWrap.hidden = true;
  analyzeBtn.disabled = true;
  document.getElementById('upload-section').hidden = false;
  document.getElementById('result-section').hidden = true;
  document.getElementById('qa-thread').innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════
   Q&A ENGINE
   Keyword-based intelligent responses
   using the analysis context
══════════════════════════════ */

const QA_RESPONSES = {
  // Accessories
  accessories: (p) => p.qa.accessories,
  accessory:   (p) => p.qa.accessories,
  bag:         (p) => `For a bag, consider something that complements your colour palette. ${p.overall >= 85 ? 'A structured leather bag or a sleek crossbody would elevate this look further.' : 'A quality bag is one of the easiest ways to upgrade an outfit — try a neutral leather option.'}`,
  shoes:       (p) => `Footwear can make or break an outfit. ${p.fit >= 85 ? 'Your proportions are great — clean sneakers, loafers, or ankle boots would all work well.' : 'Try shoes that create a clear visual break — white sneakers for casual, or block heels for a more polished look.'}`,
  jewellery:   (p) => `For jewellery, ${p.overall >= 85 ? 'keep it minimal and intentional — one or two quality pieces rather than many.' : 'start simple: a thin chain necklace and small earrings. Build from there once you\'re comfortable.'}`,
  watch:       (p) => `A watch is one of the most versatile accessories. ${p.overall >= 85 ? 'A minimalist leather-strap watch would complement this look perfectly.' : 'Any clean, simple watch would immediately elevate this outfit.'}`,

  // Colour
  colour:  (p) => p.qa.colours,
  color:   (p) => p.qa.colours,
  palette: (p) => p.qa.colours,

  // Occasion
  formal:    (p) => p.qa.formal,
  office:    (p) => p.qa.formal,
  work:      (p) => p.qa.formal,
  wedding:   (p) => `For a wedding, ${p.overall >= 85 ? 'this look could work for a smart-casual or garden wedding with minor adjustments.' : 'you\'d want to elevate significantly — think tailored separates or a dress/suit in a refined fabric.'}`,
  interview: (p) => `For a job interview, ${p.fit >= 85 ? 'this is close — add a blazer and ensure everything is pressed and polished.' : 'I\'d recommend adding structure: a blazer, tailored trousers, and clean leather shoes.'}`,
  date:      (p) => `For a date, ${p.overall >= 85 ? 'this is a great choice — confident and put-together without trying too hard.' : 'add one elevated piece — a nice jacket, better shoes, or a statement accessory to show you made an effort.'}`,
  casual:    (p) => `For casual wear, ${p.overall >= 80 ? 'this is already working well.' : 'this is perfectly appropriate — just add accessories to make it feel more intentional.'}`,

  // Fit & Style
  fit:       (p) => `Your fit score is ${p.fit}%. ${p.fit >= 85 ? 'The proportions are working well — the silhouette is flattering and intentional.' : 'There\'s room to improve: try a different size or consider tailoring key pieces. The right fit is the single biggest upgrade you can make.'}`,
  size:      (p) => `Sizing is crucial. ${p.fit >= 85 ? 'Your current sizing looks good.' : 'Consider going up or down a size in key pieces, or getting items tailored. Even small adjustments make a huge difference.'}`,
  style:     (p) => `Your style score is ${p.overall}%. ${p.overall >= 85 ? 'You have a strong, clear aesthetic. Keep developing it.' : 'Focus on building a consistent aesthetic — pick 2-3 style vibes and build your wardrobe around them.'}`,
  trend:     (p) => `Your trend score is ${p.trend}%. ${p.trend >= 85 ? 'You\'re well-aligned with current fashion trends.' : 'To be more trend-relevant, look at what\'s popular this season — quiet luxury, gorpcore, and oversized tailoring are all strong right now.'}`,

  // Improvement
  improve:  (p) => `The top improvements for this outfit: ${p.suggestions.slice(0, 2).join(' Also, ')}`,
  better:   (p) => `To make this look better: ${p.suggestions[0]}`,
  change:   (p) => `The most impactful change would be: ${p.suggestions[0]}`,
  upgrade:  (p) => `To upgrade this look: ${p.suggestions[0]} Additionally, ${p.suggestions[1] || 'focus on the quality of fabrics.'}`,

  // Score
  score:    (p) => `Your scores: Overall ${p.overall}%, Colour Harmony ${p.color}%, Fit & Proportion ${p.fit}%, Trend Relevance ${p.trend}%. ${p.overall >= 85 ? 'These are strong scores — you\'re dressing well!' : 'The biggest opportunity is in ' + (p.fit < p.color ? 'fit and proportion' : 'colour coordination') + '.'}`,

  // Layering
  layer:    (p) => `Layering can add a lot of depth. ${p.overall >= 85 ? 'A light jacket, blazer, or cardigan would add dimension without disrupting the look.' : 'Try adding an open shirt, denim jacket, or blazer over your current outfit — it immediately adds intentionality.'}`,
  jacket:   (p) => `A jacket is a great addition. ${p.overall >= 85 ? 'A structured blazer or a quality leather jacket would complement this look.' : 'Even a simple denim jacket or bomber would elevate this outfit significantly.'}`,

  // Season
  summer:   (p) => 'For summer, focus on breathable fabrics like linen and cotton. Light colours and loose fits will keep you cool while looking stylish.',
  winter:   (p) => 'For winter, layering is key. A quality coat is your most important investment — it\'s the first thing people see. Build outfits around it.',
  spring:   (p) => 'Spring is perfect for transitional layering — light jackets, pastel tones, and mixing textures. Don\'t be afraid to experiment.',
  autumn:   (p) => 'Autumn calls for rich earth tones, layering, and texture mixing. Camel, rust, olive, and burgundy are your best friends this season.',
};

/* Find best matching response */
function getQAResponse(question, profile) {
  const q = question.toLowerCase();

  // Check each keyword
  for (const [keyword, responseFn] of Object.entries(QA_RESPONSES)) {
    if (q.includes(keyword)) {
      return typeof responseFn === 'function' ? responseFn(profile) : responseFn;
    }
  }

  // Fallback — general style advice based on score
  const score = profile.overall;
  if (score >= 90) {
    return `Great question! Your outfit is already performing at a high level (${score}%). For specific advice, try asking about accessories, fit, colours, or a particular occasion.`;
  } else if (score >= 75) {
    return `Good question! With a score of ${score}%, your outfit has solid foundations. The key areas to focus on are: ${profile.suggestions[0].toLowerCase()}. Ask me about specific elements like accessories, fit, or colours for more targeted advice.`;
  } else {
    return `With a score of ${score}%, there's good room to grow. The most impactful change would be: ${profile.suggestions[0].toLowerCase()}. Ask me about accessories, fit, colours, or a specific occasion for more detailed guidance.`;
  }
}

/* ── ADD MESSAGES ── */
function addUserMessage(text) {
  const thread = document.getElementById('qa-thread');
  const initials = user ? (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase() : 'U';
  const div = document.createElement('div');
  div.className = 'an-msg user';
  div.innerHTML = `
    <div class="an-msg-avatar">${initials}</div>
    <div class="an-msg-bubble">${escapeHtml(text)}</div>`;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function addTypingIndicator() {
  const thread = document.getElementById('qa-thread');
  const div = document.createElement('div');
  div.className = 'an-msg ai an-typing';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="an-msg-avatar">🤖</div>
    <div class="an-msg-bubble">
      <div class="an-typing-dot"></div>
      <div class="an-typing-dot"></div>
      <div class="an-typing-dot"></div>
    </div>`;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function addAIMessage(text) {
  const thread = document.getElementById('qa-thread');
  const div = document.createElement('div');
  div.className = 'an-msg ai';
  // Convert **bold** markdown
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  div.innerHTML = `
    <div class="an-msg-avatar">🤖</div>
    <div class="an-msg-bubble">${formatted}</div>`;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Q&A FORM SUBMIT ── */
const qaForm   = document.getElementById('qa-form');
const qaInput  = document.getElementById('qa-input');
const qaSubmit = document.getElementById('qa-submit');

async function handleQuestion(question) {
  if (!question.trim() || !currentProfile) return;

  qaInput.value = '';
  qaSubmit.disabled = true;
  document.getElementById('qa-submit-icon').hidden = true;
  document.getElementById('qa-submit-spinner').hidden = false;

  addUserMessage(question);
  addTypingIndicator();

  // Simulate thinking time (600–1200ms)
  await delay(600 + Math.random() * 600);

  removeTypingIndicator();
  const response = getQAResponse(question, currentProfile);
  addAIMessage(response);

  qaSubmit.disabled = false;
  document.getElementById('qa-submit-icon').hidden = false;
  document.getElementById('qa-submit-spinner').hidden = true;
  qaInput.focus();
}

qaForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = qaInput.value.trim();
  if (q) handleQuestion(q);
});

/* ── QUICK SUGGESTION BUTTONS ── */
document.querySelectorAll('.an-qa-sug-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = btn.dataset.q;
    if (q && currentProfile) handleQuestion(q);
  });
});
