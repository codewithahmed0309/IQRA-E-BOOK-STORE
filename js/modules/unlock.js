/**
 * Unlock screen — secure download gate (simplified)
 */
import { getBookById } from '../data/catalog.js';
import { getState } from '../state/store.js';
import { handlePaidDownload } from '../utils/download.js';

export function initUnlock() {
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const bookId = getState().purchase.book_id;
    handlePaidDownload(bookId);
  });
}

export function showUnlockScreen(bookId) {
  const book = getBookById(bookId);
  const session = getState();

  document.getElementById('unlock-book-title').textContent = book?.title || session.purchase.book_title;
  document.getElementById('unlock-payment-id').textContent = session.purchase.payment_id || '—';
}

export function destroyUnlock() {
  /* no heavy animations to tear down */
}
