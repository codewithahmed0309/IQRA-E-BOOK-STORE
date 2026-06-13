/**
 * Hero experience — starfield, cinematic title, entry transition
 */
import { onFrame, createBurstParticles } from '../utils/animations.js';

let starfieldCtx = null;
let stars = [];
let cleanupFns = [];
let initialized = false;

export function initHero() {
  if (initialized) return;
  initialized = true;

  initStarfield();
  initLightParticles();
  bindExploreButton();
}

function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  starfieldCtx = ctx;

  function resize() {
    const dpr = devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (window.innerWidth === 0 || window.innerHeight === 0) return;
    initStars(window.innerWidth, window.innerHeight);
  }

  function initStars(w, h) {
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2
    }));
  }

  const stopFrame = onFrame(() => {
    if (!starfieldCtx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    stars.forEach(star => {
      star.y -= star.z * 0.15;
      if (star.y < 0) {
        star.y = h;
        star.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.z * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`;
      ctx.fill();
    });
  });

  resize();
  window.addEventListener('resize', resize);
  cleanupFns.push(() => {
    stopFrame();
    window.removeEventListener('resize', resize);
  });
}

/** Light ambient particles — not tied to any 3D book model */
function initLightParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = `${15 + Math.random() * 70}%`;
    p.style.top = `${20 + Math.random() * 60}%`;
    p.style.animationDelay = `${-i * 1.2}s`;
    p.style.animationDuration = `${4 + Math.random() * 4}s`;
    container.appendChild(p);
  }
}

function bindExploreButton() {
  const btn = document.getElementById('explore-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('iqra:navigate', { detail: { view: 'library', cinematic: true } }));
  });
}

export function playHeroExitTransition(onComplete) {
  const hero = document.getElementById('hero');
  const overlay = document.getElementById('transition-overlay');
  const particles = document.getElementById('transition-particles');

  overlay.classList.add('transition-overlay--active');
  hero.classList.add('hero--zoom-out');

  createBurstParticles(particles, 40);

  setTimeout(() => {
    overlay.classList.remove('transition-overlay--active');
    hero.classList.remove('hero--zoom-out');
    onComplete?.();
  }, 900);
}

export function destroyHero() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];
  initialized = false;
}
