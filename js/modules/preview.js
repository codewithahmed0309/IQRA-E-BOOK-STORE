/**
 * Preview modal — PDF sample viewer
 */
import { getBookById } from '../data/catalog.js';
import { setState, getState } from '../state/store.js';

let overlay = null;
let currentBook = null;

export function openPreview(bookId) {
  currentBook = getBookById(bookId);
  if (currentBook.confidential) {
  alert(
    '🔒 This document is confidential.\n\nPurchase the book to unlock access.'
  );
  return;
}
  if (!currentBook?.samplePdf) return;

  setState({
    analytics: { ...getState().analytics, previews: getState().analytics.previews + 1 }
  }, 'analytics.preview');

  overlay = createModal();
  document.getElementById('modal-root').appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('modal-overlay--active'));
}

function createModal() {
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal glass preview-modal">
      <button class="modal-close" type="button" aria-label="Close">✕</button>
      <h3 class="modal-title">📖 PREVIEW — ${currentBook.title}</h3>
      <div class="preview-pdf-wrap">
        <iframe
          class="preview-pdf-frame"
          src="${currentBook.samplePdf}"
          title="Sample preview: ${currentBook.title}"
          loading="lazy"
        ></iframe>
      </div>
      <p class="preview-pdf-note">Sample pages — purchase to unlock the full book</p>
    </div>
  `;

  el.querySelector('.modal-close').addEventListener('click', closePreview);
  el.addEventListener('click', (e) => { if (e.target === el) closePreview(); });

  return el;
}

function closePreview() {
  if (!overlay) return;
  overlay.classList.remove('modal-overlay--active');
  setTimeout(() => {
    overlay?.remove();
    overlay = null;
    currentBook = null;
  }, 400);
}
