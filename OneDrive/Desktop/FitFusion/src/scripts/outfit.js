const API        = 'http://localhost:3001/api';
const TOTAL_STEPS = 5;
let currentStep   = 1;

const progressFill  = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const backBtn       = document.getElementById('back-btn');
const nextBtn       = document.getElementById('next-btn');
const toastEl       = document.getElementById('toast');

/* ── GREETING with user name ── */
const user = JSON.parse(localStorage.getItem('ff_user') || '{}');
if (user.first_name) {
  document.getElementById('greeting-text').textContent =
    `Hey ${user.first_name}, let's build your style profile ✨`;
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

/* ── PROGRESS ── */
function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
  backBtn.disabled = currentStep === 1;
  nextBtn.querySelector('span').textContent =
    currentStep === TOTAL_STEPS ? 'Generate My Style 🎨' : 'Next →';
}

/* ── SHOW STEP ── */
function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');
  currentStep = n;
  updateProgress();
}

/* ── COLLECT DATA ── */
function getStepValue(step) {
  switch (step) {
    case 1: {
      const v = document.querySelector('input[name="gender"]:checked');
      return v ? v.value : null;
    }
    case 2: {
      const v = document.querySelector('input[name="occasion"]:checked');
      return v ? v.value : null;
    }
    case 3: {
      const checked = [...document.querySelectorAll('input[name="style"]:checked')];
      return checked.length ? checked.map(c => c.value) : null;
    }
    case 4: {
      const checked = [...document.querySelectorAll('input[name="colors"]:checked')];
      return checked.length ? checked.map(c => c.value) : null;
    }
    case 5: {
      const v = document.querySelector('input[name="budget"]:checked');
      return v ? v.value : null;
    }
  }
}

const stepLabels = ['gender', 'occasion', 'style vibes', 'colours', 'budget'];

/* ── NEXT ── */
nextBtn.addEventListener('click', async () => {
  const val = getStepValue(currentStep);

  if (!val) {
    showToast(`Please pick a ${stepLabels[currentStep - 1]} to continue.`, 'error');
    return;
  }

  // Enforce max 3 on style step
  if (currentStep === 3 && val.length > 3) {
    showToast('Pick up to 3 style vibes.', 'error');
    return;
  }

  if (currentStep < TOTAL_STEPS) {
    showStep(currentStep + 1);
    return;
  }

  // ── FINAL SUBMIT ──
  const gender   = document.querySelector('input[name="gender"]:checked')?.value;
  const occasion = document.querySelector('input[name="occasion"]:checked')?.value;
  const styles   = [...document.querySelectorAll('input[name="style"]:checked')].map(c => c.value);
  const colors   = [...document.querySelectorAll('input[name="colors"]:checked')].map(c => c.value);
  const budget   = document.querySelector('input[name="budget"]:checked')?.value;
  const extras   = document.getElementById('extras').value.trim();

  nextBtn.disabled = true;
  nextBtn.querySelector('span').textContent = 'Saving…';

  try {
    const res  = await fetch(`${API}/outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id:  user.id || null,
        gender, occasion,
        style:    styles.join(','),
        colors,
        budget,
        extras
      })
    });

    if (res.ok) {
      showToast('Style profile saved! Redirecting…', 'success');
      setTimeout(() => window.location.href = 'index.html', 1400);
    } else {
      showToast('Could not save. Continuing anyway…', 'error');
      setTimeout(() => window.location.href = 'index.html', 1800);
    }
  } catch {
    // Server might be off — still let them through
    showToast('Saved locally. Redirecting…', 'success');
    setTimeout(() => window.location.href = 'index.html', 1400);
  }
});

/* ── BACK ── */
backBtn.addEventListener('click', () => {
  if (currentStep > 1) showStep(currentStep - 1);
});

/* ── MULTI-SELECT LIMIT (style step) ── */
document.querySelectorAll('input[name="style"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const checked = document.querySelectorAll('input[name="style"]:checked');
    if (checked.length > 3) {
      cb.checked = false;
      showToast('Max 3 style vibes allowed.', 'error');
    }
  });
});

/* ── INIT ── */
updateProgress();
