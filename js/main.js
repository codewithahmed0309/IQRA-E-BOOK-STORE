/**
 * IQRA E-STORE — Main Application Controller
 */
import { setState, getState } from './state/store.js';
import { initHero, playHeroExitTransition } from './modules/hero.js';
import { initLibrary, refreshLibrary, destroyLibrary } from './modules/library.js';
import { openPreview } from './modules/preview.js';
import { openPayment } from './modules/payment.js';
import { openUserForm } from './modules/userForm.js';
import { initUnlock, showUnlockScreen, destroyUnlock } from './modules/unlock.js';
import { initReader } from './modules/reader.js';

const views = ['hero', 'library', 'unlock', 'reader'];
let currentView = 'hero';

export function initApp() {
  initHero();
  initLibrary();
  initUnlock();
  initReader();

  setState({
    analytics: { ...getState().analytics, pageViews: getState().analytics.pageViews + 1 }
  }, 'app.init');

  bindGlobalEvents();
  showView('hero', false);
}

function bindGlobalEvents() {
  window.addEventListener('iqra:navigate', (e) => {
    const { view, cinematic, bookId } = e.detail;

    if (cinematic && view === 'library' && currentView === 'hero') {
      playHeroExitTransition(() => navigateTo(view, bookId));
    } else {
      navigateTo(view, bookId);
    }
  });

  window.addEventListener('iqra:preview', (e) => {
    openPreview(e.detail.bookId);
  });

  window.addEventListener('iqra:payment', (e) => {
    openPayment(e.detail.bookId);
  });

  window.addEventListener('iqra:user-form', (e) => {
    openUserForm(e.detail.bookId);
  });
}

function navigateTo(view, bookId) {
  if (!views.includes(view)) return;

  if (view === 'unlock' && bookId) {
    showUnlockScreen(bookId);
  }

  if (view === 'library') {
    refreshLibrary();
  }

  showView(view, true);
}

function showView(viewName, animate = true) {
  const prevView = currentView;
  currentView = viewName;

  setState({ ui: { ...getState().ui, currentView: viewName } }, 'ui.view');

  views.forEach(name => {
    const el = document.getElementById(name);
    if (!el) return;

    if (name === viewName) {
      el.classList.remove('view--exiting');
      el.classList.add('view--active');
      if (animate && name === 'library') {
        el.classList.add('library--zoom-in');
      }
    } else {
      el.classList.remove('view--active', 'library--zoom-in');
      if (animate && name === prevView) {
        el.classList.add('view--exiting');
        setTimeout(() => el.classList.remove('view--exiting'), 900);
      }
    }
  });

  window.scrollTo({ top: 0, behavior: animate ? 'smooth' : 'auto' });
}

document.addEventListener('DOMContentLoaded', initApp);
