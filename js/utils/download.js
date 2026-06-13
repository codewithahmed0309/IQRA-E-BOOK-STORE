/**
 * Secure book download helper
 */
import { getBookById } from '../data/catalog.js';
import { canDownload, canDownloadFree } from '../security/engine.js';
import { showToast } from './animations.js';

export function triggerBookDownload(bookId) {
  const book = getBookById(bookId);
  if (!book) {
    showToast('Book not found', 'error');
    return false;
  }

  const file = book.downloadFile;
  if (!file) {
    showToast('Download file not available', 'error');
    return false;
  }

  const a = document.createElement('a');
  a.href = file;
  a.download = `${book.title.replace(/\s+/g, '_')}_IQRA.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return true;
}

export function handleFreeDownload(bookId) {
  const result = canDownloadFree(bookId);
  if (!result.allowed) {
    showToast(result.reason, 'error', 4000);
    return;
  }
  if (triggerBookDownload(bookId)) {
    showToast('Download started — enjoy your book!', 'success');
  }
}

export function handlePaidDownload(bookId) {
  const result = canDownload(bookId);
  if (!result.allowed) {
    showToast(result.reason, 'error', 4000);
    return;
  }
  if (triggerBookDownload(bookId)) {
    showToast('Download initiated — enjoy your knowledge!', 'success');
  }
}
