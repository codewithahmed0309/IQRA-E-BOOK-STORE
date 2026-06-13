/**
 * Centralized application state store
 */
const STORAGE_KEY = 'iqra_estore_session';

const defaultState = {
  user: { name: '', email: '' },
  purchase: { book_id: '', book_title: '', payment_id: '', status: '' },
  timestamp: '',
  session_id: '',
  ui: {
    currentView: 'hero',
    transitionActive: false,
    searchQuery: '',
    activeCategory: 'all',
    readerOpen: false
  },
  analytics: {
    pageViews: 0,
    searches: 0,
    previews: 0
  }
};

let state = loadState();
const listeners = new Set();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed, ui: { ...defaultState.ui, ...parsed.ui } };
    }
  } catch { /* ignore corrupt data */ }
  return structuredClone(defaultState);
}

function persistState() {
  const toStore = {
    user: state.user,
    purchase: state.purchase,
    timestamp: state.timestamp,
    session_id: state.session_id
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(path) {
  listeners.forEach(fn => fn(state, path));
}

export function setState(updates, path = 'root') {
  state = deepMerge(state, updates);
  if (updates.user || updates.purchase || updates.timestamp || updates.session_id) {
    persistState();
  }
  notify(path);
}

export function resetPurchase() {
  setState({
    purchase: { book_id: '', book_title: '', payment_id: '', status: '' },
    timestamp: '',
    session_id: ''
  }, 'purchase.reset');
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function generateSessionId() {
  return 'iqra_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

export function generatePaymentId() {
  return 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
