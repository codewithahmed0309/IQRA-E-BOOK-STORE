/**
 * Animation utilities — rAF-based, GPU-optimized
 */
let rafId = null;
const rafCallbacks = new Set();

export function onFrame(callback) {
  rafCallbacks.add(callback);
  if (!rafId) {
    rafId = requestAnimationFrame(tick);
  }
  return () => rafCallbacks.delete(callback);
}

function tick(timestamp) {
  rafCallbacks.forEach(cb => cb(timestamp));
  rafId = rafCallbacks.size ? requestAnimationFrame(tick) : null;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function staggerReveal(elements, className = 'book-card--visible', staggerMs = 80) {
  elements.forEach((el, i) => {
    setTimeout(() => el.classList.add(className), i * staggerMs);
  });
}

export function createBurstParticles(container, count = 30) {
  const rect = container.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    const angle = (Math.PI * 2 * i) / count;
    const dist = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    p.style.transition = `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease`;
    container.appendChild(p);

    requestAnimationFrame(() => {
      p.style.transform = `translate(${tx}px, ${ty}px)`;
      p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 900);
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => toast.classList.remove('toast--visible'), duration);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
