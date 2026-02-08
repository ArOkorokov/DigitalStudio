import { initSphereScene } from './sphere.js';
import { burger } from './burger.js';
import { initHeroGlassParallax } from './heroGlassParallax.js';



function initLogoIntro() {
  const logo = document.querySelector('.header__logo');
  if (!logo) return;

  setTimeout(() => {
    logo.classList.add('logo-intro');
  }, 300);

  setTimeout(() => {
    logo.classList.add('is-alive');
  }, 1100);
}

window.addEventListener('DOMContentLoaded', () => {
  burger();
  initSphereScene({ animatedNoise: true });
});


window.addEventListener('DOMContentLoaded', () => {
  initHeroGlassParallax();
});

