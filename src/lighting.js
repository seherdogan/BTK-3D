import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Model ışık içermiyor: ortam ışığı, gün ışığı ve her odaya tavan lambaları ekler.
export function setupLighting(renderer, scene, roomPoints) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a3128, 0.9));

  const sun = new THREE.DirectionalLight(0xfff1dc, 1.2);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  // Tavan lambaları: sıcak, yumuşak sönümlü nokta ışıklar
  for (const p of roomPoints) {
    const lamp = new THREE.PointLight(0xffd9a8, 2.2, 6.5, 1.6);
    lamp.position.set(p.x, 2.2, p.z);
    scene.add(lamp);
  }
}

// Sketchfab dışa aktarımında cam/ayna malzemeleri opak gelir; onları düzeltir.
export function fixMaterials(root, renderer) {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      for (const key of ['map', 'normalMap', 'roughnessMap']) {
        if (m[key]) m[key].anisotropy = maxAniso;
      }
      const name = (m.name || '').toLowerCase();
      if (name.includes('glass')) {
        m.transparent = true;
        m.opacity = name.includes('gunmetal') ? 0.75 : 0.22;
        m.roughness = 0.05;
        m.metalness = 0.1;
        m.depthWrite = false;
      } else if (name === 'mirror') {
        m.color?.set(0xdfe6ea);
        m.metalness = 0.7;
        m.roughness = 0.12;
        m.envMapIntensity = 1.4;
      } else if (name.includes('metal') || name.includes('chrome') || name.includes('nickel') || name.includes('steel') || name.includes('rubinetteria')) {
        m.metalness = Math.max(m.metalness ?? 0, 0.85);
        m.roughness = Math.min(m.roughness ?? 1, 0.3);
      }
      m.side = THREE.DoubleSide;
    }
  });
}
