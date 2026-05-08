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
   ANALYSIS ENGINE
   Uses Gemini AI for intelligent outfit analysis
   and real-time chat responses
══════════════════════════════ */

/* API Configuration */
const API_BASE_URL = 'http://localhost:3002/api';

/* ── GEMINI AI ANALYSIS ── */
async function analyzeOutfitWithAI(imageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-outfit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        analysisContext: 'Please analyze this outfit for style, fit, color harmony, and trend relevance.'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if fallback was used
    if (data.fallback) {
      showToast('Using backup AI service for analysis', 'info');
    } else if (data.provider) {
      showToast(`Analysis completed using ${data.provider}`, 'success');
    }
    
    return data.analysis;
  } catch (error) {
    console.error('AI Analysis error:', error);
    showToast('Failed to analyze outfit with AI. Please try again.', 'error');
    return null;
  }
}

/* ── FALLBACK ANALYSIS ── */
function selectProfile(file) {
  // Fallback deterministic analysis if AI fails
  const seed = (file.size + file.name.length * 137) % 5;
  const profiles = [
    {
      verdict: '🔥 Great Style!',
      overall: 85, color: 82, fit: 88, trend: 80,
      working: ['Clean cohesive look', 'Good proportions', 'Well-coordinated colors'],
      suggestions: ['Add accessories', 'Consider layering', 'Upgrade one piece'],
      tags: ['Casual', 'Everyday', 'Comfortable']
    },
    {
      verdict: '✨ Solid Look!',
      overall: 78, color: 75, fit: 82, trend: 76,
      working: ['Presentable outfit', 'Safe color choices', 'Comfortable fit'],
      suggestions: ['Add statement piece', 'Improve fit', 'Add accessories'],
      tags: ['Basic', 'Versatile', 'Simple']
    }
  ];
  return profiles[seed];
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

  try {
    // Convert image to base64 for API
    const imageData = previewImg.src;
    currentProfile = await analyzeOutfitWithAI(imageData);
    
    if (currentProfile) {
      showResult();
    } else {
      // Fallback to deterministic analysis if AI fails
      showToast('AI analysis failed, using fallback analysis', 'error');
      currentProfile = selectProfile(currentFile);
      showResult();
    }
  } catch (error) {
    console.error('Analysis error:', error);
    showToast('Analysis failed. Please try again.', 'error');
  }

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

  // Big overlay score
  document.getElementById('result-big-score').innerHTML = `${p.overall}<span>%</span>`;

  // Verdict
  const parts = p.verdict.split(' ');
  document.getElementById('verdict-icon').textContent = parts[0];
  document.getElementById('verdict-text').textContent = parts.slice(1).join(' ');

  // Animate SVG ring gauges after a tick
  setTimeout(() => {
    animateRingGauge('ring-overall', 'gauge-overall-num', p.overall);
    animateRingGauge('ring-color',   'gauge-color-num',   p.color);
    animateRingGauge('ring-fit',     'gauge-fit-num',     p.fit);
    animateRingGauge('ring-trend',   'gauge-trend-num',   p.trend);
  }, 150);

  // What's working
  document.getElementById('working-list').innerHTML = p.working
    .map((w, i) => `<li class="working-item" style="animation-delay:${i*0.08}s">${w}</li>`).join('');

  // Suggestions
  document.getElementById('suggestions-list').innerHTML = p.suggestions
    .map((s, i) => `<li class="suggest-item" style="animation-delay:${i*0.08}s">${s}</li>`).join('');

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
  }, 700);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Analysis complete ✨', 'success');
}

/* ── ANIMATE SVG RING GAUGE ── */
function animateRingGauge(ringId, numId, targetPercent) {
  const ring = document.getElementById(ringId);
  const num  = document.getElementById(numId);
  
  if (!ring || !num) return;

  // SVG circle: circumference = 2πr = 2π × 30 = 188.5
  const circumference = 188.5;
  const offset = circumference - (targetPercent / 100) * circumference;
  
  ring.style.strokeDashoffset = offset;

  // Count up the number
  let current = 0;
  const step  = targetPercent / 50;
  const timer = setInterval(() => {
    current = Math.min(current + step, targetPercent);
    num.textContent = Math.round(current) + '%';
    if (current >= targetPercent) clearInterval(timer);
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
   GEMINI AI CHAT ENGINE
   Real-time AI responses for outfit questions
══════════════════════════════ */

let chatHistory = [];

async function getAIResponse(question) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat-about-outfit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        analysisContext: analysisContext,
        previousMessages: []
      })
    });

    const data = await response.json();
    
    // Check if fallback was used
    if (data.fallback) {
      showToast('Using backup AI service for chat', 'info');
    } else if (data.provider) {
      showToast(`Chat completed using ${data.provider}`, 'success');
    }
    
    return data.response;
  } catch (error) {
    console.error('AI Chat error:', error);
    showToast('Failed to get AI response. Please try again.', 'error');
    return null;
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

  // Add user message to chat history
  chatHistory.push({
    role: 'user',
    content: question
  });

  addUserMessage(question);
  addTypingIndicator();

  try {
    const aiResponse = await getAIResponse(question);
    
    removeTypingIndicator();
    addAIMessage(aiResponse);

    // Add AI response to chat history
    chatHistory.push({
      role: 'assistant',
      content: aiResponse
    });
  } catch (error) {
    removeTypingIndicator();
    addAIMessage('I apologize, but I\'m having trouble processing your question right now. Please try again.');
  }

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
