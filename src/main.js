import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OVERVIEW, ROOMS } from './rooms.js';
import { setupLighting, fixMaterials } from './lighting.js';
import { Tour } from './tour.js';
import { Focus } from './focus.js';

const canvas = document.getElementById('scene');
const $ = (id) => document.getElementById(id);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// Kuş bakışında tavanı kesip "maket" görünümü vermek için yatay kesme düzlemi
const ceilingClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);
renderer.clippingPlanes = [ceilingClip];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1714);
scene.fog = new THREE.Fog(0x1a1714, 25, 60);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 200);
camera.position.set(0, 14, 10);

// Zemin gölgesi / platform
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(16, 64),
  new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.3;
scene.add(ground);

// --- Yükleme ---
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);

loader.load(
  '/models/apartment.glb',
  (gltf) => init(gltf.scene),
  (e) => {
    if (!e.total) return;
    const pct = Math.round((e.loaded / e.total) * 100);
    $('loader-bar').style.width = pct + '%';
    $('loader-text').textContent = `Model yükleniyor… ${pct}%`;
  },
  (err) => {
    console.error(err);
    $('loader-text').textContent = 'Model yüklenemedi: ' + err.message;
  },
);

function init(modelRoot) {
  // Model santimetre cinsinden: metreye ölçekle ve ortala
  const model = new THREE.Group();
  model.add(modelRoot);
  model.scale.setScalar(0.01);
  scene.add(model);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.set(-center.x, 0, -center.z);
  model.updateMatrixWorld(true);
  const offset = model.position.clone();

  // 3ds (Z-yukarı, cm) noktasını dünya koordinatına çevir
  const toWorld = ([x, y, z]) => new THREE.Vector3(x * 0.01 + offset.x, z * 0.01, -y * 0.01 + offset.z);
  const boxToWorld = (b) => new THREE.Box3().setFromPoints([toWorld(b.slice(0, 3)), toWorld(b.slice(3, 6))]);

  fixMaterials(model, renderer);

  const meshes = [];
  model.traverse((o) => { if (o.isMesh) meshes.push(o); });

  // Durakları ve eşyaları dünya koordinatına çevir
  const size = bounds.getSize(new THREE.Vector3());
  const overviewStop = {
    ...OVERVIEW,
    eye: new THREE.Vector3(0, Math.max(size.x, size.z) * 1.05, size.z * 0.75),
    target: new THREE.Vector3(0, 0, 0.3),
  };
  const roomStops = ROOMS.map((r) => ({ ...r, eye: toWorld(r.eye), target: toWorld(r.target) }));
  const stops = [overviewStop, ...roomStops];

  const items = [];
  for (const room of roomStops) {
    room.items = room.furniture.map((f) => {
      const box = boxToWorld(f.box);
      const item = {
        ...f,
        room,
        box,
        hitBox: box.clone().expandByScalar(0.05),
        center: box.getCenter(new THREE.Vector3()),
        size: box.getSize(new THREE.Vector3()),
      };
      items.push(item);
      return item;
    });
  }

  setupLighting(renderer, scene, roomStops.map((r) => r.eye));

  // --- Arayüz ---
  const list = $('room-list');
  const buttons = stops.map((stop, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = stop.name;
    btn.addEventListener('click', () => {
      focus.exit();
      tour.goTo(i);
    });
    list.appendChild(btn);
    return btn;
  });

  const hotspotLayer = $('hotspots');
  for (const item of items) {
    const el = document.createElement('button');
    el.className = 'hotspot hidden';
    el.type = 'button';
    el.innerHTML = `<span class="dot"></span><span class="label"></span>`;
    el.querySelector('.label').textContent = item.name;
    el.addEventListener('click', () => focus.enter(item));
    hotspotLayer.appendChild(el);
    item.el = el;
  }

  const tour = new Tour(stops, canvas, {
    onStopChange(i) {
      buttons.forEach((b, j) => b.classList.toggle('active', i === j));
      $('room-subtitle').textContent = stops[i].subtitle;
      $('progress-bar').style.width = `${(i / (stops.length - 1)) * 100}%`;
      if (i > 0) $('scroll-hint').classList.add('hide');
    },
  });

  const focus = new Focus({
    camera,
    dom: canvas,
    scene,
    items,
    tour,
    onEnter(item) {
      $('info-room').textContent = item.room.name;
      $('info-title').textContent = item.name;
      $('info-desc').textContent = item.desc;
      $('info-card').hidden = false;
      $('scroll-hint').classList.add('hide');
    },
    onExit() {
      $('info-card').hidden = true;
    },
  });
  focus.setPickables(meshes);
  $('info-back').addEventListener('click', () => focus.exit());

  // URL ile doğrudan durak / eşya açma: ?stop=3  veya  ?focus=mutfak:0
  const params = new URLSearchParams(location.search);
  if (params.has('stop')) tour.jump(Number(params.get('stop')));
  tour.update(0, camera);
  if (params.has('focus')) {
    const [roomId, idx] = params.get('focus').split(':');
    const room = roomStops.find((r) => r.id === roomId);
    const item = room?.items[Number(idx) || 0];
    if (item) {
      tour.jump(stops.indexOf(room));
      tour.update(0, camera);
      focus.enter(item);
      focus.anim.t = 1;
    }
  }

  // --- Hotspot görünürlüğü (oklüzyon kontrolü seyrek yapılır) ---
  const occluder = new THREE.Raycaster();
  const tmp = new THREE.Vector3();
  let occlusionTimer = 0;

  function updateHotspots(dt) {
    const showRoom = !focus.busy && tour.settled ? stops[tour.active] : null;
    occlusionTimer -= dt;
    const checkOcclusion = occlusionTimer <= 0;
    if (checkOcclusion) occlusionTimer = 0.25;

    for (const item of items) {
      let visible = item.room === showRoom;
      if (visible) {
        tmp.copy(item.center).project(camera);
        visible = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
        if (visible) {
          const x = (tmp.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-tmp.y * 0.5 + 0.5) * window.innerHeight;
          item.el.style.transform = `translate(${x - 9}px, ${y - 9}px)`;
        }
        if (visible && checkOcclusion) {
          const dir = item.center.clone().sub(camera.position);
          const dist = dir.length();
          occluder.set(camera.position, dir.normalize());
          occluder.far = dist;
          const hit = occluder.intersectObjects(meshes, false)[0];
          item.occluded = !!hit && !item.hitBox.containsPoint(hit.point) && hit.distance < dist - 0.15;
        }
        visible = visible && !item.occluded;
      }
      item.el.classList.toggle('hidden', !visible);
    }
  }

  // Geliştirme: ?top ile kat planını tam üstten (ortografik) göster
  if (params.has('top')) {
    const ortho = new THREE.OrthographicCamera(bounds.min.x + offset.x, bounds.max.x + offset.x, -bounds.min.z - offset.z, -bounds.max.z - offset.z, 0.1, 100);
    ortho.position.set(0, 30, 0);
    ortho.up.set(0, 0, -1);
    ortho.lookAt(0, 0, 0);
    renderer.setSize(Math.round(size.x * 100), Math.round(size.z * 100));
    ceilingClip.constant = 2.0;
    for (const item of items) {
      const h = makeOutlineBox(item);
      scene.add(h);
    }
    renderer.setAnimationLoop(() => renderer.render(scene, ortho));
    $('loader').classList.add('done');
    return;
  }

  // --- Döngü ---
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (tour.enabled && !focus.busy) tour.update(dt, camera);
    focus.update(dt);
    ceilingClip.constant = camera.position.y > 2.3 ? 2.25 : 1000;
    updateHotspots(dt);
    renderer.render(scene, camera);
  });

  $('loader').classList.add('done');
}

function makeOutlineBox(item) {
  const helper = new THREE.Box3Helper(item.box, 0xff00ff);
  helper.material.depthTest = false;
  return helper;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
