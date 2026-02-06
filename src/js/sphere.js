import * as THREE from 'three';

export function initSphereScene({ animatedNoise = true } = {}) {

  /* ───────── DOM ───────── */
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const container = canvas.parentElement;
  const glassEl = document.querySelector('.hero__title_glass');
  const sphereWrapper = document.querySelector('.sphere-wrapper');
  const bgLayers = document.querySelectorAll('.bg-gradient__layer');

  /* ───────── Utils ───────── */
  function getSize() {
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  /* ───────── Mouse / Background ───────── */
  const mouse = new THREE.Vector2();
  const mouseTarget = new THREE.Vector2();

  function updateBackgroundParallax() {
    bgLayers.forEach((layer, i) => {
      const depth = (i + 1) * 14;
      layer.style.setProperty('--mx', `${mouse.x * depth}px`);
      layer.style.setProperty('--my', `${mouse.y * depth}px`);
    });
  }

  /* ───────── Renderer ───────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* ───────── Scene / Camera ───────── */
  const scene = new THREE.Scene();
  let { width, height } = getSize();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 18;

  /* ───────── Lights ───────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(6, 10, 8);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xb4e1ff, 3.5);
  rimLight.position.set(-10, 0, -12);
  scene.add(rimLight);

  const tealUp = new THREE.PointLight(0x38dcd4, 18, 28); // чуть темнее
  tealUp.position.set(0, -8, 2);
  scene.add(tealUp);

  const tealDown = new THREE.PointLight(0x7b5cff, 12, 28);
  tealDown.position.set(0, 8, 2);
  scene.add(tealDown);

  /* ───────── Water Sphere ───────── */
  let radius = 5;

  const geometry = new THREE.SphereGeometry(1, 180, 180);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x3fe6d9,         // вернулись к 60% от светлого
    roughness: 0.05,
    metalness: 0.7,          // умеренно металлический
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 3,
    transmission: 0.35,
    thickness: 1.3
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  /* ───────── Noise Setup ───────── */
  const basePositions = geometry.attributes.position.array.slice();
  const noiseStrength = 0.04; // в 3 раза меньше

  function applyNoise(time = 0) {
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const nx = basePositions[i * 3 + 0];
      const ny = basePositions[i * 3 + 1];
      const nz = basePositions[i * 3 + 2];

      let noise = 0;
      if (animatedNoise) {
        noise =
          Math.sin(nx * 12 + ny * 9 + nz * 15 + time * 1.5) * noiseStrength +
          Math.sin(nx * 6 + nz * 11 + time * 1.2) * (noiseStrength * 0.8);
      } else {
        noise =
          Math.sin(nx * 12 + ny * 9 + nz * 15) * noiseStrength +
          Math.sin(nx * 6 + nz * 11) * (noiseStrength * 0.8);
      }

      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const scale = radius + noise;

      pos.setXYZ(i, (nx / len) * scale, (ny / len) * scale, (nz / len) * scale);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  /* ───────── Land Dots ───────── */
  const landDots = [];
  const LAND_DOT_COUNT = 5000;
  const dotGeo = new THREE.SphereGeometry(0.03, 6, 6);
  const dotMat = new THREE.MeshPhysicalMaterial({
    color: 0x5eead4,
    emissive: 0x2dd4bf,
    emissiveIntensity: 0.65,
    roughness: 0.28,
    metalness: 0,
    transmission: 0.25
  });
  dotMat.depthWrite = false;

  function isLand(lat, lon) {
    if (lat > -35 && lat < 60 && lon > -20 && lon < 60) return true;
    if (lat > 5 && lat < 70 && lon > 60 && lon < 150) return true;
    if (lat > 10 && lat < 75 && lon > -170 && lon < -50) return true;
    if (lat > -60 && lat < 15 && lon > -85 && lon < -30) return true;
    if (lat > -45 && lat < -10 && lon > 110 && lon < 155) return true;
    return false;
  }

  for (let i = 0; i < LAND_DOT_COUNT; i++) {
    let lat, lon;
    do {
      lat = THREE.MathUtils.randFloat(-90, 90);
      lon = THREE.MathUtils.randFloat(-180, 180);
    } while (!isLand(lat, lon));

    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);

    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );

    const flowDir = new THREE.Vector3(
      -Math.sin(theta),
      0,
      Math.cos(theta)
    ).normalize().multiplyScalar(0.008 + Math.random() * 0.006);

    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.userData = { dir, phase: Math.random()*Math.PI*2, offset: Math.random()*0.12, flowDir };
    scene.add(dot);
    landDots.push(dot);
  }

  /* ───────── State ───────── */
  let time = 0;
  let sphereScrollTarget = 0;
  let sphereScrollCurrent = 0;

  /* ───────── Input ───────── */
  window.addEventListener('mousemove', e => {
    mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseTarget.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    sphereScrollTarget = window.scrollY * 0.0008;
  });

  /* ───────── Layout Sync ───────── */
  function updateLayout() {
    const size = getSize();
    width = size.width;
    height = size.height;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    radius = THREE.MathUtils.clamp(width * 0.008, 3.2, 6.5);
  }

  updateLayout();
  window.addEventListener('resize', updateLayout);

  /* ───────── Parallax ───────── */
  let parallaxY = 0;

  function updateParallax() {
    parallaxY += (window.scrollY - parallaxY) * 0.08;

    if (glassEl) {
      glassEl.style.transform =
        `translate(-50%, calc(-50% + ${parallaxY * 0.22}px))`;
    }

    if (sphereWrapper) {
      sphereWrapper.style.transform =
        `translate(-50%, calc(-50% + ${parallaxY * 0.1}px))`;
    }
  }

  /* ───────── Animation ───────── */
  function animate() {
    requestAnimationFrame(animate);

    time += 0.018;
    mouse.lerp(mouseTarget, 0.05);
    updateBackgroundParallax();

    sphereScrollCurrent += (sphereScrollTarget - sphereScrollCurrent) * 0.08;

    camera.position.x = mouse.x * 2.5;
    camera.position.y = mouse.y * 2.2;
    camera.lookAt(0, 0, 0);

    applyNoise(time);

    // Animate Land Dots
    landDots.forEach(dot => {
      dot.userData.phase += 0.018;
      const breathe = Math.sin(time*0.9 + dot.userData.phase)*0.1;
      const r = radius - 0.25 + breathe + dot.userData.offset;
      const flowedDir = dot.userData.dir.clone()
        .add(dot.userData.flowDir.clone().multiplyScalar(time*0.5))
        .normalize();
      dot.position.copy(flowedDir).multiplyScalar(r);
      dot.scale.setScalar(0.9 + Math.sin(dot.userData.phase + time)*0.25);
    });

    updateParallax();
    renderer.render(scene, camera);
  }

  animate();
}
