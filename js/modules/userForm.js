/**
 * Post-payment user verification form
 */
import { getBookById } from '../data/catalog.js';
import { setState, getState } from '../state/store.js';
import { validateUserForm } from '../security/engine.js';
import { showToast } from '../utils/animations.js';
import { sendPurchaseToSheet } from '../utils/sheets.js';

let overlay = null;

export function openUserForm(bookId) {
  const book = getBookById(bookId);
  if (!book) return;

  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal glass form-modal">
      <button class="modal-close" type="button" aria-label="Close">✕</button>
      <h3 class="modal-title">🔐 SECURE VERIFICATION</h3>
      <div class="form-secure-badge">🛡️ Encrypted session active — verify your identity to unlock download</div>
      <form id="user-form">
        <div class="form-group">
          <label class="form-label" for="user-name">Full Name</label>
          <input class="form-input" id="user-name" type="text" placeholder="Enter your name" required>
          <span class="form-error" id="error-name" style="color:#fca5a5;font-size:0.75rem"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="user-email">Email Address</label>
          <input class="form-input" id="user-email" type="email" placeholder="you@example.com" required>
          <span class="form-error" id="error-email" style="color:#fca5a5;font-size:0.75rem"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="user-book">Book Name</label>
          <input class="form-input" id="user-book" type="text" value="${book.title}" disabled>
        </div>
        <button class="btn" type="submit" style="width:100%">
          <span class="btn-glow"></span>
          <span class="btn-text">VERIFY & UNLOCK</span>
        </button>
      </form>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('modal-overlay--active'));

  overlay.querySelector('.modal-close').addEventListener('click', closeForm);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeForm(); });
  overlay.querySelector('#user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(bookId);
  });
}

async function handleSubmit(bookId) {
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();

  const { valid, errors } = validateUserForm({ name, email });

  document.getElementById('error-name').textContent = errors.name || '';
  document.getElementById('error-email').textContent = errors.email || '';

  if (!valid) return;

  setState({ user: { name, email } }, 'user.verified');

  const book = getBookById(bookId);
  const session = getState();
  const timestamp = new Date().toISOString();

  await sendPurchaseToSheet({
    name,
    email,
    bookTitle: book?.title || session.purchase.book_title,
    paymentId: session.purchase.payment_id,
    timestamp,
    sessionId: session.session_id
  });

  storeSubmission({ name, email, bookId, timestamp });

  closeForm();
  showToast('Identity verified — unlocking your book...', 'success');
  window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'unlock', bookId } }));
}

function storeSubmission(data) {
  const book = getBookById(data.bookId);
  const submission = {
    user: { name: data.name, email: data.email },
    purchase: getState().purchase,
    timestamp: data.timestamp,
    session_id: getState().session_id
  };

  const log = JSON.parse(localStorage.getItem('iqra_submissions') || '[]');
  log.push(submission);
  localStorage.setItem('iqra_submissions', JSON.stringify(log));
}

function closeForm() {
  if (!overlay) return;
  overlay.classList.remove('modal-overlay--active');
  setTimeout(() => {
    overlay?.remove();
    overlay = null;
  }, 400);
}
