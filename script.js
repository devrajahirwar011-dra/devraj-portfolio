const typingTexts = [
  'AI & Data Science Student | Coding Enthusiast | Future Developer',
  'Building responsive websites, game prototypes, and intelligent apps',
  'Passionate about coding, technology, AI, and immersive design',
];
const typingElement = document.getElementById('typing-text');
let typeIndex = 0;
let charIndex = 0;
let typingForward = true;

let scene;
let camera;
let renderer;
let composer;
let backgroundGroup;
let particleField;
let starField;
let waveRibbons = [];
let mouse = { x: 0, y: 0 };
const clock = new THREE.Clock();

function typeLoop() {
  const currentText = typingTexts[typeIndex];
  if (typingForward) {
    typingElement.textContent = currentText.slice(0, charIndex + 1);
    charIndex += 1;
    if (charIndex === currentText.length) {
      typingForward = false;
      setTimeout(typeLoop, 1500);
      return;
    }
  } else {
    typingElement.textContent = currentText.slice(0, charIndex - 1);
    charIndex -= 1;
    if (charIndex === 0) {
      typingForward = true;
      typeIndex = (typeIndex + 1) % typingTexts.length;
    }
  }
  const delay = typingForward ? 80 : 40;
  setTimeout(typeLoop, delay);
}

document.addEventListener('DOMContentLoaded', () => {
  typeLoop();
  initReveal();
  initWaveBackground();
  setupContactForm();
  initCursor();
  initPageAnimations();
  setupSectionObserver();
});

window.addEventListener('load', () => {
  hideLoader();
  initPageScrollEffects();
});

function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach(section => observer.observe(section));
}

function initWaveBackground() {
  const canvas = document.getElementById('three-bg');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090215);
  scene.fog = new THREE.FogExp2(0x090215, 0.0018);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 26);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x090215, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const ambientLight = new THREE.AmbientLight(0x7a9cff, 0.25);
  scene.add(ambientLight);

  const rimLight = new THREE.PointLight(0x77b8ff, 1.2, 120, 2);
  rimLight.position.set(14, 10, 16);
  scene.add(rimLight);

  const rimLight2 = new THREE.PointLight(0xff66d1, 0.9, 120, 2);
  rimLight2.position.set(-12, -8, 22);
  scene.add(rimLight2);

  const rimLight3 = new THREE.PointLight(0x6fffe8, 0.8, 120, 2);
  rimLight3.position.set(10, -12, 18);
  scene.add(rimLight3);

  backgroundGroup = new THREE.Group();
  scene.add(backgroundGroup);

  createStarField();
  createWaveRibbons();
  createParticleField();
  createWaveGrid();
  createGlowCores();
  setupPostProcessing();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  animateScene();
}

function createWaveGrid() {
  const gridSize = 32;
  const gridSegments = 48;
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x3de8fb,
    transparent: true,
    opacity: 0.18,
  });

  const gridGeometry = new THREE.BufferGeometry();
  const gridVertices = [];

  for (let i = -gridSize; i <= gridSize; i += gridSize / gridSegments) {
    gridVertices.push(-gridSize, -5.6, i, gridSize, -5.6, i);
    gridVertices.push(i, -5.6, -gridSize, i, -5.6, gridSize);
  }

  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3));
  const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
  backgroundGroup.add(gridLines);
}

function createStarField() {
  const stars = 1400;
  const positions = new Float32Array(stars * 3);
  const colors = new Float32Array(stars * 3);

  for (let i = 0; i < stars; i++) {
    const radius = 18 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1) * 0.35;

    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.sin(phi) * radius * 0.25 + 3;
    positions[i * 3 + 2] = Math.sin(theta) * radius;

    const brightness = 0.7 + Math.random() * 0.3;
    colors[i * 3] = brightness;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = brightness;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}

function createWaveRibbons() {
  const ribbonConfigs = [
    { color: 0x7c5bff, amplitude: 1.2, wavelength: 0.18, speed: 0.7, z: -6, rotateSpeed: 0.0008 },
    { color: 0x3de8fb, amplitude: 1.0, wavelength: 0.22, speed: 0.9, z: -8, rotateSpeed: -0.0006 },
    { color: 0xe35cff, amplitude: 1.4, wavelength: 0.14, speed: 0.65, z: -10, rotateSpeed: 0.0005 },
    { color: 0x8aff98, amplitude: 0.85, wavelength: 0.26, speed: 1.0, z: -12, rotateSpeed: -0.0007 },
  ];

  ribbonConfigs.forEach((config, index) => {
    const points = [];
    const segments = 140;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 36 - 18;
      const y = Math.sin(x * config.wavelength) * config.amplitude + Math.cos(i * 0.14) * 0.18;
      const z = config.z + Math.cos(i * 0.09) * 0.35;
      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const colors = new Float32Array(points.length * 3);

    points.forEach((point, i) => {
      const t = i / points.length;
      const color = new THREE.Color(config.color).lerp(new THREE.Color(0x86efff), t * 0.8);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });

    const ribbon = new THREE.Line(geometry, material);
    ribbon.rotation.x = Math.PI * 0.08 + index * 0.02;
    ribbon.rotation.y = index * 0.12;
    ribbon.userData = {
      amplitude: config.amplitude,
      wavelength: config.wavelength,
      speed: config.speed,
      hue: index * 0.12,
      rotateSpeed: config.rotateSpeed,
      count: points.length,
    };
    waveRibbons.push(ribbon);
    backgroundGroup.add(ribbon);
  });
}

function createParticleField() {
  const particleCount = 1600;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 22 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.4;

    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.sin(phi) * 10;
    positions[i * 3 + 2] = Math.sin(theta) * radius;

    const hue = 0.55 + Math.random() * 0.25;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.65);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particleField = new THREE.Points(geometry, material);
  scene.add(particleField);
}

function createGlowCores() {
  const coreGeometry = new THREE.SphereGeometry(2.4, 48, 48);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x947cff,
    emissive: 0x947cff,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  backgroundGroup.add(coreMesh);

  const glowGeometry = new THREE.SphereGeometry(5.6, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8d5fff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  backgroundGroup.add(glowMesh);

  const pulseGeometry = new THREE.SphereGeometry(7.8, 32, 32);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x3bdfff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });
  const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
  backgroundGroup.add(pulseMesh);
}

function setupPostProcessing() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    0.7,
    0.85
  );
  bloomPass.threshold = 0.06;
  bloomPass.strength = 1.1;
  bloomPass.radius = 0.7;
  composer.addPass(bloomPass);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animateScene() {
  const elapsed = clock.getElapsedTime();
  const targetX = mouse.x * 2.2;
  const targetY = mouse.y * 1.15;
  camera.position.x += (targetX - camera.position.x) * 0.04;
  camera.position.y += (targetY - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

  backgroundGroup.rotation.y += 0.0007;
  backgroundGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.02;

  waveRibbons.forEach((ribbon, index) => {
    const positions = ribbon.geometry.attributes.position.array;
    const config = ribbon.userData;
    for (let i = 0; i < config.count; i++) {
      const x = positions[i * 3];
      positions[i * 3 + 1] = Math.sin(x * config.wavelength + elapsed * config.speed + i * 0.08) * config.amplitude +
        Math.cos(elapsed * 0.55 + i * 0.09) * 0.25;
    }
    ribbon.geometry.attributes.position.needsUpdate = true;
    const hue = (elapsed * 0.08 + config.hue) % 1;
    ribbon.material.color.setHSL(hue, 0.82, 0.68);
    ribbon.rotation.z += config.rotateSpeed;
  });

  if (particleField) {
    particleField.rotation.y += 0.0004;
    particleField.rotation.x += 0.00015;
  }

  if (starField) {
    starField.rotation.y += 0.00025;
    starField.rotation.x += 0.00008;
  }

  composer.render();
  requestAnimationFrame(animateScene);
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');

  form.addEventListener('submit', event => {
    event.preventDefault();
    note.textContent = 'Message received! I will reply soon.';
    form.reset();
    setTimeout(() => {
      note.textContent = '';
    }, 5000);
  });
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  gsap.to(loader, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      loader.style.display = 'none';
    },
  });
}

function initCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (!cursorDot || !cursorRing) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotScale = 1;
  let ringScale = 1;

  const updateCursor = () => {
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${dotScale})`;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${ringScale})`;
    requestAnimationFrame(updateCursor);
  };

  document.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });

  const interactiveTargets = document.querySelectorAll('a, button, .btn, .project-card, .skill-card');
  interactiveTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      dotScale = 1.35;
      ringScale = 1.2;
    });
    target.addEventListener('mouseleave', () => {
      dotScale = 1;
      ringScale = 1;
    });
  });

  requestAnimationFrame(updateCursor);
}

function initPageAnimations() {
  gsap.from('.hero-title', {
    y: 42,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  gsap.from('.hero-subtitle, .hero-description, .hero-actions .btn', {
    y: 28,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.16,
    delay: 0.3,
  });

  gsap.from('.profile-card', {
    y: 30,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.4,
  });

  gsap.from('.skill-card', {
    y: 18,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.7,
  });

  gsap.from('.project-card', {
    y: 22,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.9,
  });
}

function setupSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav-links a[href='#${id}']`);
        if (entry.isIntersecting && link) {
          navLinks.forEach(nav => nav.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(section => observer.observe(section));
}

function initPageScrollEffects() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll);
}
