/* ══════════════════════════════
   CONTACT PAGE — form handler
══════════════════════════════ */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

const form    = document.getElementById('contact-form');
const success = document.querySelector('.ct-success');

form?.addEventListener('submit', e => {
  e.preventDefault();

  const name    = document.getElementById('ct-name').value.trim();
  const email   = document.getElementById('ct-email').value.trim();
  const subject = document.getElementById('ct-subject').value.trim();
  const message = document.getElementById('ct-message').value.trim();

  if (!name || !email || !subject || !message) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Simulate sending
  const btn = form.querySelector('.ct-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    form.style.display = 'none';
    if (success) success.classList.add('show');
    showToast('Message sent successfully! ✉️', 'success');
  }, 1200);
});
