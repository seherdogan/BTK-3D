import * as THREE from 'three';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Scroll ile duraklar arasında ilerleyen kamera turu.
// Duraklar arasında kamera bir "kuş bakışı" ara noktadan geçerek duvarların içinden geçmez.
export class Tour {
  constructor(stops, dom, { onStopChange } = {}) {
    this.stops = stops; // [{ eye: Vector3, target: Vector3 }]
    this.max = stops.length - 1;
    this.progress = 0;
    this.goal = 0;
    this.enabled = true;
    this.onStopChange = onStopChange;
    this.active = -1;
    this.idleTimer = 0;
    this.pos = new THREE.Vector3();
    this.look = new THREE.Vector3();

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (!this.enabled) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      this.nudge(THREE.MathUtils.clamp(dy, -120, 120) * 0.0035);
    }, { passive: false });

    let lastY = null;
    dom.addEventListener('touchstart', (e) => { lastY = e.touches[0].clientY; }, { passive: true });
    dom.addEventListener('touchmove', (e) => {
      if (!this.enabled || lastY === null) return;
      const y = e.touches[0].clientY;
      this.nudge((lastY - y) * 0.006);
      lastY = y;
    }, { passive: true });
    dom.addEventListener('touchend', () => { lastY = null; });

    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) this.goTo(Math.round(this.goal) + 1);
      if (['ArrowUp', 'PageUp'].includes(e.key)) this.goTo(Math.round(this.goal) - 1);
    });
  }

  nudge(amount) {
    this.goal = THREE.MathUtils.clamp(this.goal + amount, 0, this.max);
    this.idleTimer = 0.35;
  }

  goTo(index) {
    this.goal = THREE.MathUtils.clamp(index, 0, this.max);
    this.idleTimer = 0;
  }

  jump(index) {
    this.goTo(index);
    this.progress = this.goal;
  }

  // Verilen ilerleme değerindeki kamera pozunu hesaplar
  sample(p, outPos, outLook) {
    const i = Math.min(Math.floor(p), this.max - 1);
    const t = ease(THREE.MathUtils.clamp(p - i, 0, 1));
    const a = this.stops[i];
    const b = this.stops[i + 1] ?? a;

    // Kuş bakışı kontrol noktası: iki göz noktasının ortası, tavanın üstünde
    const ctrl = a.eye.clone().lerp(b.eye, 0.5);
    const dist = a.eye.distanceTo(b.eye);
    ctrl.y = Math.max(a.eye.y, b.eye.y, 2.6 + dist * 0.55);
    if (a.aerial || b.aerial) ctrl.y = Math.max(a.eye.y, b.eye.y);

    const u = 1 - t;
    outPos.set(0, 0, 0)
      .addScaledVector(a.eye, u * u)
      .addScaledVector(ctrl, 2 * u * t)
      .addScaledVector(b.eye, t * t);
    outLook.copy(a.target).lerp(b.target, t);
  }

  update(dt, camera) {
    if (this.idleTimer > 0) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) this.goal = Math.round(this.goal); // en yakın odaya yerleş
    }
    this.progress = THREE.MathUtils.damp(this.progress, this.goal, 4, dt);
    if (Math.abs(this.progress - this.goal) < 1e-4) this.progress = this.goal;

    this.sample(this.progress, this.pos, this.look);
    camera.position.copy(this.pos);
    camera.lookAt(this.look);

    const nearest = Math.round(this.progress);
    if (nearest !== this.active) {
      this.active = nearest;
      this.onStopChange?.(nearest);
    }
  }

  // Bir odada "durmuş" sayılır mı (hotspot'ları göstermek için)
  get settled() {
    return Math.abs(this.progress - Math.round(this.progress)) < 0.04;
  }
}
