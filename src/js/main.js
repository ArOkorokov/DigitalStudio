import * as THREE from 'three';



const bgLayers = document.querySelectorAll('.bg-gradient__layer');

function updateBackgroundParallax() {
  bgLayers.forEach((layer, i) => {
    const depth = (i + 1) * 14;
    layer.style.setProperty('--mx', `${mouse.x * depth}px`);
    layer.style.setProperty('--my', `${mouse.y * depth}px`);
  });
}
/* ───────── DOM ───────── */

const canvas = document.getElementById('bg');
const container = canvas.parentElement;
const glassEl = document.querySelector('.hero__title_glass');
const sphereWrapper = document.querySelector('.sphere-wrapper');

/* ───────── Utils ───────── */

function getSize() {
  const rect = container.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
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
renderer.toneMappingExposure = 1.2;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ───────── Scene / Camera ───────── */

const scene = new THREE.Scene();
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.z = 18;

/* ───────── Lights ───────── */

scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(6, 10, 8);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x88ccff, 5);
rimLight.position.set(-10, 0, -12);
scene.add(rimLight);

const purpleUp = new THREE.PointLight(0xa855ff, 20, 28);
purpleUp.position.set(0, -8, 2);
scene.add(purpleUp);

/* ───────── Sphere ───────── */

let radius = 5;

const geometry = new THREE.SphereGeometry(1, 180, 180);
const material = new THREE.MeshPhysicalMaterial({
  color: 0x1fd1c7,
  metalness: 0.26,
  roughness: 0.11,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  envMapIntensity: 3
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

/* ───────── State ───────── */

let time = 0;
let jitterPhase = Math.random() * 1000;
let morphPhase = 0;

const mouse = new THREE.Vector2();
const mouseTarget = new THREE.Vector2();
let sphereScrollTarget = 0;
let sphereScrollCurrent = 0;

/* ───────── Input ───────── */

window.addEventListener('mousemove', e => {
  mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseTarget.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('scroll', () => {
  sphereScrollTarget = window.scrollY * 0.0006;
});

/* ───────── Morph Vectors ───────── */

const morphA = new THREE.Vector3(1, 0.3, 0.2).normalize();
const morphB = new THREE.Vector3(-0.4, 1, -0.1).normalize();
const morphC = new THREE.Vector3(0.2, -0.3, 1).normalize();

/* ───────── Layout Sync ───────── */

function updateLayout() {
  const { width, height } = getSize();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  radius = THREE.MathUtils.clamp(width * 0.008, 3.2, 6.2);
}
updateLayout();

/* ───────── Parallax ───────── */

let parallaxY = 0;

function updateParallax() {
  parallaxY += (window.scrollY - parallaxY) * 0.08;

  const glassOffset = parallaxY * 0.22;
  const sphereOffset = parallaxY * 0.1;

  if (glassEl) {
    glassEl.style.transform =
      `translate(-50%, calc(-50% + ${glassOffset}px))`;
  }

  if (sphereWrapper) {
    sphereWrapper.style.transform =
      `translate(-50%, calc(-50% + ${sphereOffset}px))`;
  }
}

/* ───────── Animation ───────── */

function animate() {
  requestAnimationFrame(animate);

  time += 0.012;
  jitterPhase += 0.04;
  morphPhase += 0.0025;

  mouse.lerp(mouseTarget, 0.05);
  updateBackgroundParallax();

  sphereScrollCurrent +=
    (sphereScrollTarget - sphereScrollCurrent) * 0.08;

  camera.position.x = mouse.x * 2.5;
  camera.position.y = mouse.y * 2;
  camera.lookAt(0, 0, 0);

  const pos = geometry.attributes.position;

  const wA = (Math.sin(morphPhase) + 1) * 0.5;
  const wB = (Math.sin(morphPhase * 0.8 + 2) + 1) * 0.5;
  const wC = (Math.sin(morphPhase * 1.1 + 4) + 1) * 0.5;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const len = Math.sqrt(x*x + y*y + z*z);
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    const m =
      (nx*morphA.x + ny*morphA.y + nz*morphA.z) * wA +
      (nx*morphB.x + ny*morphB.y + nz*morphB.z) * wB +
      (nx*morphC.x + ny*morphC.y + nz*morphC.z) * wC;

    const morph = Math.sin(m*1.6 + time*0.6) * 0.45;
    const jitter =
      Math.sin(jitterPhase + nx*12) * 0.035 +
      Math.sin(jitterPhase*1.3 + ny*14) * 0.03;

    const pressure = sphereScrollCurrent * 0.3;
    const scale = radius + morph + jitter - pressure;

    pos.setXYZ(i, nx*scale, ny*scale, nz*scale);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  sphere.rotation.y = Math.sin(time*0.18) * 0.3;
  sphere.rotation.x = Math.cos(time*0.16) * 0.22;

  updateParallax();
  renderer.render(scene, camera);
}

animate();
window.addEventListener('resize', updateLayout);
