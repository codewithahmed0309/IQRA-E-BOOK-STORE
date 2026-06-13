/**
 * Security Engine — strict access gating logic
 */
import { getState } from '../state/store.js';
import { getBookById } from '../data/catalog.js';

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function isValidSession(session = getState()) {
  if (!session.session_id || !session.timestamp) return false;

  const sessionAge = Date.now() - new Date(session.timestamp).getTime();
  if (sessionAge > SESSION_MAX_AGE_MS) return false;

  if (!session.session_id.startsWith('iqra_')) return false;

  return true;
}

export function isPaymentSuccessful(session = getState()) {
  return session.purchase?.status === 'success' && !!session.purchase?.payment_id;
}

export function isBookPurchased(bookId, session = getState()) {
  return (
    isPaymentSuccessful(session) &&
    session.purchase.book_id === bookId
  );
}

/** Free books — direct download, no session required */
export function canDownloadFree(bookId) {
  const book = getBookById(bookId);
  if (!book) return { allowed: false, reason: 'Book not found.' };
  if (book.premium) return { allowed: false, reason: 'This book requires purchase.' };
  if (!book.downloadFile) return { allowed: false, reason: 'Download file not available.' };
  return { allowed: true, reason: 'Free download granted' };
}

/** Paid books — download only after payment + session + user verification */
export function canDownload(bookId) {
  const session = getState();
  const book = getBookById(bookId);

  if (!book) return { allowed: false, reason: 'Book not found.' };
  if (!book.downloadFile) return { allowed: false, reason: 'Download file not available.' };

  if (!isValidSession(session)) {
    return { allowed: false, reason: 'Invalid or expired session. Please complete purchase again.' };
  }

  if (!isPaymentSuccessful(session)) {
    return { allowed: false, reason: 'Payment not verified. Purchase required.' };
  }

  if (session.purchase.book_id !== bookId) {
    return { allowed: false, reason: 'Book ID mismatch. Unauthorized download attempt blocked.' };
  }

  if (!session.user?.name || !session.user?.email) {
    return { allowed: false, reason: 'User verification incomplete. Please submit your details.' };
  }

  return { allowed: true, reason: 'Access granted' };
}

export function validateUserForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Valid email required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
