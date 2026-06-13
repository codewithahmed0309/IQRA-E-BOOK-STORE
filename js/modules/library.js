/**
 * Library system — grid, filters, search, carousel, book cards
 */
import { BOOKS, CATEGORIES, CATEGORY_GRADIENTS, filterBooks } from '../data/catalog.js';
import { setState, getState } from '../state/store.js';
import { debounce, staggerReveal } from '../utils/animations.js';
import { isBookPurchased } from '../security/engine.js';
import { handleFreeDownload } from '../utils/download.js';

let carouselIndex = 0;
let carouselTimer = null;
let gridClickBound = false;

export function initLibrary() {
  renderCategoryFilters();
  renderFeaturedCarousel();
  bindGridActions();
  renderBookGrid();
  bindSearch();
  bindNavHome();
  startCarouselAuto();
}

function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-pill ${cat.id === 'all' ? 'filter-pill--active' : ''}"
            data-category="${cat.id}" type="button">${cat.label}</button>
  `).join('');

  container.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
    pill.classList.add('filter-pill--active');

    const category = pill.dataset.category;
    setState({ ui: { ...getState().ui, activeCategory: category } }, 'ui.category');
    renderBookGrid();
  });
}

function bindSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  const handleSearch = debounce((value) => {
    setState({
      ui: { ...getState().ui, searchQuery: value },
      analytics: { ...getState().analytics, searches: getState().analytics.searches + 1 }
    }, 'ui.search');
    renderBookGrid();
  }, 300);

  input.addEventListener('input', (e) => handleSearch(e.target.value));
}

function bindNavHome() {
  document.getElementById('nav-home')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'hero' } }));
  });
}

function renderFeaturedCarousel() {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!track || !dots) return;

  const featured = BOOKS.filter(b => b.featured);

  track.innerHTML = featured.map(book => `
    <div class="carousel-slide" data-book-id="${book.id}">
      <img class="carousel-cover" src="${book.cover}" alt="${book.title}" />
      <div class="carousel-info">
        <span class="carousel-badge">${book.premium ? 'Premium' : 'Free'}</span>
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <p>${book.premium ? '₹' + book.price : 'Free Access'}</p>
      </div>
    </div>
  `).join('');

  dots.innerHTML = featured.map((_, i) => `
    <button class="carousel-dot ${i === 0 ? 'carousel-dot--active' : ''}" data-index="${i}" type="button" aria-label="Slide ${i + 1}"></button>
  `).join('');

  track.addEventListener('click', (e) => {
    const slide = e.target.closest('.carousel-slide');
    if (slide) scrollToBook(slide.dataset.bookId);
  });

  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-dot');
    if (dot) goToSlide(parseInt(dot.dataset.index, 10));
  });
}

function goToSlide(index) {
  const featured = BOOKS.filter(b => b.featured);
  if (!featured.length) return;
  carouselIndex = ((index % featured.length) + featured.length) % featured.length;
  const track = document.getElementById('carousel-track');
  const slide = track?.querySelector('.carousel-slide');
  const slideWidth = slide ? slide.offsetWidth + 24 : 624;
  track.style.transform = `translateX(-${carouselIndex * slideWidth}px)`;

  document.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('carousel-dot--active', i === carouselIndex);
  });
}

function startCarouselAuto() {
  carouselTimer = setInterval(() => {
    const featured = BOOKS.filter(b => b.featured);
    goToSlide((carouselIndex + 1) % featured.length);
  }, 5000);
}

function scrollToBook(bookId) {
  const card = document.querySelector(`#book-grid [data-book-id="${bookId}"]`);
  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card?.classList.add('animate-scale-in');
}

function renderBookGrid() {
  const grid = document.getElementById('book-grid');
  if (!grid) return;

  const { searchQuery, activeCategory } = getState().ui;
  const books = filterBooks(searchQuery, activeCategory);

  grid.innerHTML = books.map(book => createBookCardHTML(book)).join('');

  const cards = grid.querySelectorAll('.book-card');
  staggerReveal(cards);

  cards.forEach(card => initCardTilt(card));
}

function bindGridActions() {
  if (gridClickBound) return;
  const grid = document.getElementById('book-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.stopPropagation();

    const { action, id } = btn.dataset;
    if (action === 'preview') {
      window.dispatchEvent(new CustomEvent('iqra:preview', { detail: { bookId: id } }));
    } else if (action === 'buy') {
      window.dispatchEvent(new CustomEvent('iqra:payment', { detail: { bookId: id } }));
    } else if (action === 'download') {
      handleFreeDownload(id);
    } else if (action === 'unlock') {
      window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'unlock', bookId: id } }));
    }
  });
  gridClickBound = true;
}

function createBookCardHTML(book) {
  const purchased = isBookPurchased(book.id);
  const gradient = CATEGORY_GRADIENTS[book.category] || '';

  let actionBtn = '';
  if (book.premium && !purchased) {
    actionBtn = `<button class="card-btn card-btn--buy" data-action="buy" data-id="${book.id}" type="button">💎 Buy ₹${book.price}</button>`;
  } else if (book.premium && purchased) {
    actionBtn = `<button class="card-btn card-btn--download" data-action="unlock" data-id="${book.id}" type="button">📥 Download</button>`;
  } else {
    actionBtn = `<button class="card-btn card-btn--download" data-action="download" data-id="${book.id}" type="button">📥 Download</button>`;
  }

return `
  <article class="book-card" data-book-id="${book.id}" style="--card-gradient: ${gradient}">

    ${book.confidential ? `
      <div class="book-card-confidential">
💎 PREMIUM BOOK
      </div>
    ` : ''}

    <div class="book-card-reflection"></div>

    <span class="book-card-badge badge--${book.premium ? 'premium' : 'free'}">
      ${book.premium ? 'Premium' : 'Free'}
    </span>

    <img
      class="book-card-cover"
      src="${book.cover}"
      alt="${book.title}"
      loading="lazy"
    />

    <h3 class="book-card-title">${book.title}</h3>
    <p class="book-card-author">${book.author}</p>

    <div class="book-card-meta">
      <span class="book-card-category">${book.category}</span>
      <span class="book-card-rating">★ ${book.rating}</span>
    </div>

    <div class="book-card-actions">

      <button
        class="card-btn card-btn--preview"
        data-action="preview"
        data-id="${book.id}">
        ${book.confidential ? '🔒 Purchase to Unlock' : '📖 Preview'}
      </button>

      ${actionBtn}

    </div>

  </article>

  `;
}

function initCardTilt(card) {
  let rafPending = false;

  card.addEventListener('mousemove', (e) => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      rafPending = false;
    });
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });

  card.addEventListener('mousedown', () => {
    card.style.transform += ' scale(0.98)';
  });

  card.addEventListener('mouseup', () => {
    card.style.transform = card.style.transform.replace(' scale(0.98)', '');
  });
}

export function destroyLibrary() {
  if (carouselTimer) clearInterval(carouselTimer);
}

export function refreshLibrary() {
  renderBookGrid();
}
