import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ease = (t) => 1 - Math.pow(1 - t, 3);

// Eşyalara tıklayınca kamerayı uçuran, vurgulayan ve etrafında döndürmeyi açan odak sistemi.
export class Focus {
  constructor({ camera, dom, scene, items, tour, onEnter, onExit }) {
    this.camera = camera;
    this.scene = scene;
    this.items = items; // [{ name, desc, room, box: Box3, center, size }]
    this.tour = tour;
    this.onEnter = onEnter;
    this.onExit = onExit;
    this.active = null;
    this.anim = null;
    this.pickables = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.controls = new OrbitControls(camera, dom);
    this.controls.enabled = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;

    this.outline = makeOutline(0xe2b26f, 1);
    this.hoverOutline = makeOutline(0xffffff, 0.45);
    scene.add(this.outline, this.hoverOutline);

    let down = null;
    dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    dom.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const item = this.pick(e);
      if (item) this.enter(item);
    });

    let last = 0;
    dom.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - last < 90 || this.anim || e.pointerType === 'touch') return;
      last = now;
      const item = this.pick(e);
      dom.style.cursor = item ? 'pointer' : this.active ? 'grab' : 'default';
      this.showOutline(this.hoverOutline, item && item !== this.active ? item : null);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.exit();
    });
  }

  setPickables(meshes) {
    this.pickables = meshes;
  }

  pick(e) {
    const rect = e.target.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
    if (!hit) return null;
    return this.itemAt(hit.point);
  }

  // Tıklanan noktayı içeren en küçük eşya kutusunu bulur
  itemAt(point) {
    let best = null;
    let bestVol = Infinity;
    for (const item of this.items) {
      if (!item.hitBox.containsPoint(point)) continue;
      const vol = item.size.x * item.size.y * item.size.z;
      if (vol < bestVol) { best = item; bestVol = vol; }
    }
    return best;
  }

  showOutline(outline, item) {
    outline.visible = !!item;
    if (!item) return;
    outline.position.copy(item.center);
    outline.scale.copy(item.size).addScalar(0.04);
  }

  enter(item) {
    if (this.active === item) return;
    this.active = item;
    this.tour.enabled = false;
    this.controls.enabled = false;
    this.showOutline(this.outline, item);
    this.showOutline(this.hoverOutline, null);

    // Mevcut bakış yönünden eşyaya yaklaş, hafif yukarıdan bak
    const dir = this.camera.position.clone().sub(item.center);
    dir.y = 0;
    if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
    dir.normalize();
    dir.y = 0.55;
    dir.normalize();
    const radius = Math.max(item.size.x, item.size.y, item.size.z);
    const dist = THREE.MathUtils.clamp(radius * 1.5 + 0.5, 0.8, 3.2);
    const pos = item.center.clone().addScaledVector(dir, dist);

    this.flyTo(pos, item.center, 1.2, () => {
      this.controls.target.copy(item.center);
      this.controls.minDistance = Math.max(0.3, radius * 0.5);
      this.controls.maxDistance = dist * 2.2;
      this.controls.enabled = true;
      this.controls.update();
    });
    this.onEnter?.(item);
  }

  exit() {
    if (!this.active) return;
    this.active = null;
    this.controls.enabled = false;
    this.showOutline(this.outline, null);
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();
    this.tour.sample(this.tour.progress, pos, look);
    this.flyTo(pos, look, 1.0, () => { this.tour.enabled = true; });
    this.onExit?.();
  }

  flyTo(pos, look, duration, done) {
    const fromPos = this.camera.position.clone();
    const dirNow = new THREE.Vector3();
    this.camera.getWorldDirection(dirNow);
    const fromLook = this.anim?.look?.clone() ?? fromPos.clone().addScaledVector(dirNow, fromPos.distanceTo(look));
    this.anim = { t: 0, duration, fromPos, fromLook, pos, look, done, cur: new THREE.Vector3() };
  }

  get busy() {
    return !!this.anim || !!this.active;
  }

  update(dt) {
    if (this.anim) {
      const a = this.anim;
      a.t = Math.min(1, a.t + dt / a.duration);
      const k = ease(a.t);
      this.camera.position.lerpVectors(a.fromPos, a.pos, k);
      a.cur.lerpVectors(a.fromLook, a.look, k);
      this.camera.lookAt(a.cur);
      if (a.t >= 1) {
        this.anim = null;
        a.done?.();
      }
    } else if (this.controls.enabled) {
      this.controls.update();
    }
    if (this.outline.visible) {
      this.outline.material.opacity = 0.65 + Math.sin(performance.now() / 300) * 0.3;
    }
  }
}

function makeOutline(color, opacity) {
  const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = 999;
  lines.visible = false;
  return lines;
}
