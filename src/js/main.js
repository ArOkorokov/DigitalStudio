import { initSphereScene } from './sphere.js';
import { burger } from './burger.js';

window.addEventListener('DOMContentLoaded', () => {
  burger();
  initSphereScene({ animatedNoise: true });
});