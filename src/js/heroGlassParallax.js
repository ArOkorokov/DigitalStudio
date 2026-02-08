export function initHeroGlassParallax() {
  const glass = document.querySelector('.hero__title_glass');
  if (!glass) return;

  // Respect reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ───────── State ───────── */
  let scrollCurrent = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseTargetX = 0;
  let mouseTargetY = 0;

  /* ───────── Config ───────── */
  const SCROLL_STRENGTH = 0.17; // скролл-параллакс
  const MOUSE_MOVE_X = 10;      // смещение по X при мыши
  const MOUSE_MOVE_Y = 7;      // смещение по Y при мыши + скролле
  const TILT_X = 8;            // наклон по X (вверх/вниз)
  const TILT_Y = 12;            // наклон по Y (влево/вправо)
  const LERP_SCROLL = 0.18;     // плавность скролла
  const LERP_MOUSE = 0.16;      // плавность мыши

  /* ───────── Input ───────── */
  function onMouseMove(e) {
    mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  /* ───────── Animation Loop ───────── */
  function animate() {
    // плавный скролл-параллакс
    scrollCurrent += (window.scrollY - scrollCurrent) * LERP_SCROLL;

    // плавное следование за мышью
    mouseX += (mouseTargetX - mouseX) * LERP_MOUSE;
    mouseY += (mouseTargetY - mouseY) * LERP_MOUSE;

    // вычисляем смещение и наклон
    const translateX = mouseX * MOUSE_MOVE_X;
    const translateY = scrollCurrent * SCROLL_STRENGTH + mouseY * MOUSE_MOVE_Y;

    const rotateX = mouseY * TILT_X;
    const rotateY = -mouseX * TILT_Y;

    glass.style.transform = `
      translate(
        calc(-50% + ${translateX}px),
        calc(-50% + ${translateY}px)
      )
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
