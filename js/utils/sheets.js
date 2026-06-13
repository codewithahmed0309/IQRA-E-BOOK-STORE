/**
 * Google Sheets integration — auto-send purchase data (no manual API in usage flow)
 */
import { SHEET_ID, SHEETS_WEBAPP_URL } from '../config.js';

export async function sendPurchaseToSheet(payload) {
  if (!SHEET_ID || SHEET_ID === 'PASTE_HERE') return { ok: false, reason: 'SHEET_ID not configured' };
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL.includes('PASTE_')) return { ok: false, reason: 'SHEETS_WEBAPP_URL not configured' };

  const body = {
    sheetId: SHEET_ID,
    name: payload.name,
    email: payload.email,
    bookTitle: payload.bookTitle,
    paymentId: payload.paymentId,
    timestamp: payload.timestamp,
    sessionId: payload.sessionId
  };

  try {
    await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { ok: true };
  } catch (err) {
    console.warn('[Sheets] Send failed:', err);
    return { ok: false, reason: err.message };
  }
}
