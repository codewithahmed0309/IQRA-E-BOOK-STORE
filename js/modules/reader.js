/**
 * Immersive book reader
 */
import { getBookById } from '../data/catalog.js';
import { isBookPurchased } from '../security/engine.js';
import { showToast } from '../utils/animations.js';

let currentBook = null;
let currentPage = 0;
let fontSize = 0.9;
let theme = 'void';
let layout = 'single';
let isFlipping = false;

export function initReader() {
  document.getElementById('reader-close')?.addEventListener('click', closeReader);
  document.getElementById('reader-prev')?.addEventListener('click', () => navigate(-1));
  document.getElementById('reader-next')?.addEventListener('click', () => navigate(1));
  document.getElementById('reader-theme')?.addEventListener('change', (e) => {
    theme = e.target.value;
    applyTheme();
  });
  document.getElementById('reader-layout')?.addEventListener('change', (e) => {
    layout = e.target.value;
    renderReader();
  });
  document.getElementById('reader-font-up')?.addEventListener('click', () => {
    fontSize = Math.min(fontSize + 0.1, 1.4);
    applyFontSize();
  });
  document.getElementById('reader-font-down')?.addEventListener('click', () => {
    fontSize = Math.max(fontSize - 0.1, 0.7);
    applyFontSize();
  });

  document.addEventListener('keydown', handleKeyboard);

  // Touch swipe
  let touchStartX = 0;
  const stage = document.getElementById('reader-stage');
  stage?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage?.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 60) navigate(diff > 0 ? -1 : 1);
  }, { passive: true });
}

export function openReader(bookId) {
  currentBook = getBookById(bookId);
  if (!currentBook) return;

  if (currentBook.premium && !isBookPurchased(bookId)) {
    showToast('Purchase required to read this book', 'error');
    window.dispatchEvent(new CustomEvent('iqra:payment', { detail: { bookId } }));
    return;
  }

  currentPage = 0;
  renderReader();
  window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'reader' } }));
}

function renderReader() {
  const bookEl = document.getElementById('reader-book');
  if (!bookEl || !currentBook) return;

  bookEl.className = `reader-book reader-theme--${theme} reader-layout--${layout}`;
  bookEl.innerHTML = '';

  if (layout === 'double') {
    renderDoublePage(bookEl);
  } else {
    renderSinglePage(bookEl);
  }

  updateProgress();
  applyFontSize();
}

function renderSinglePage(container) {
  const wrap = document.createElement('div');
  wrap.className = 'reader-page-wrap';
  wrap.innerHTML = `
    <div class="reader-page-face">
      <div class="reader-page-text">${formatPageContent(currentPage)}</div>
    </div>
  `;
  container.appendChild(wrap);
  updatePageInfo();
}

function renderDoublePage(container) {
  const leftPage = currentPage;
  const rightPage = currentPage + 1;

  const wrap = document.createElement('div');
  wrap.className = 'reader-page-wrap';
  wrap.style.display = 'flex';
  wrap.style.gap = '4px';

  wrap.innerHTML = `
    <div class="reader-page-face reader-page-face--left" style="width:var(--page-width);position:relative">
      <div class="reader-page-text">${leftPage < currentBook.fullContent.length ? formatPageContent(leftPage) : ''}</div>
    </div>
    <div class="reader-page-face reader-page-face--right" style="width:var(--page-width);position:relative;border-radius:6px 2px 2px 6px">
      <div class="reader-page-text">${rightPage < currentBook.fullContent.length ? formatPageContent(rightPage) : ''}</div>
    </div>
  `;
  container.appendChild(wrap);
  updatePageInfo();
}

function formatPageContent(index) {
  const text = currentBook.fullContent[index] || '';
  const lines = text.split('\n');
  const title = lines[0];
  const body = lines.slice(1).join('\n');
  return `<h3>${title}</h3><p>${body || ''}</p>`;
}

function navigate(dir) {
  if (isFlipping || !currentBook) return;

  const step = layout === 'double' ? 2 : 1;
  const newPage = currentPage + dir * step;

  if (newPage < 0 || newPage >= currentBook.fullContent.length) return;

  isFlipping = true;
  const faces = document.querySelectorAll('.reader-page-face');
  faces.forEach(face => face.classList.add('reader-page-face--flipping'));

  setTimeout(() => {
    currentPage = newPage;
    renderReader();
    isFlipping = false;
  }, 500);
}

function updatePageInfo() {
  const total = currentBook.fullContent.length;
  document.getElementById('reader-page-info').textContent = `${currentPage + 1} / ${total}`;
}

function updateProgress() {
  const bar = document.getElementById('reader-progress-bar');
  const pct = ((currentPage + 1) / currentBook.fullContent.length) * 100;
  bar.style.width = pct + '%';
}

function applyTheme() {
  const bookEl = document.getElementById('reader-book');
  bookEl.className = `reader-book reader-theme--${theme} reader-layout--${layout}`;
}

function applyFontSize() {
  document.querySelectorAll('.reader-page-text').forEach(el => {
    el.style.fontSize = fontSize + 'rem';
  });
}

function handleKeyboard(e) {
  const readerView = document.getElementById('reader');
  if (!readerView?.classList.contains('view--active')) return;

  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
  if (e.key === 'Escape') closeReader();
}

function closeReader() {
  window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'library' } }));
}

export function destroyReader() {
  document.removeEventListener('keydown', handleKeyboard);
}
