// ============================================================
// Life in Range — character viewer
// Soft clay lighting, contact blob shadow, transparent bg.
// Used by the creator (drag-orbit + slow sway) and the world
// scene (fixed three-quarter view, walk/mood states).
// ============================================================
import * as THREE from "../vendor/three.module.min.js";
import { buildCharacter, animateCharacter, disposeCharacter } from "./character3d.js";

function blobShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  g.addColorStop(0, "rgba(0,0,0,0.42)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export class CharacterView {
  constructor(container, opts = {}) {
    this.opts = Object.assign({ orbit: false, sway: true, yaw: 0, fit: 1.0 }, opts);
    this.container = container;
    container.innerHTML = "";
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;";
    container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);

    // clay lighting: warm hemisphere + soft key + cool fill
    this.scene.add(new THREE.HemisphereLight(0xfff1de, 0x8a7560, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(2, 3.4, 2.6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xa9bce0, 0.55);
    fill.position.set(-2.4, 1.4, -1.6);
    this.scene.add(fill);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.1),
      new THREE.MeshBasicMaterial({ map: blobShadowTexture(), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    this.scene.add(shadow);

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    this.char = null;
    this.state = { walking: false, mood: "ok" };
    this.userYaw = 0;
    this.clock = new THREE.Clock();

    if (this.opts.orbit) {
      let down = false, px = 0;
      this.canvas.addEventListener("pointerdown", e => { down = true; px = e.clientX; this._dragged = true; });
      window.addEventListener("pointermove", e => {
        if (!down) return;
        this.userYaw += (e.clientX - px) * 0.012;
        px = e.clientX;
      });
      window.addEventListener("pointerup", () => { down = false; });
    }
  }

  setConfig(cfg) {
    if (this.char) { this.pivot.remove(this.char.root); disposeCharacter(this.char); }
    this.char = buildCharacter(cfg);
    this.pivot.add(this.char.root);
  }

  setState(s) { Object.assign(this.state, s); }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return false;
    const dpr = this.renderer.getPixelRatio();
    if (Math.abs(this.canvas.width - w * dpr) > 2 || Math.abs(this.canvas.height - h * dpr) > 2) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    return true;
  }

  draw() {
    if (!this.resize() || !this.char) return;
    const t = this.clock.getElapsedTime();
    animateCharacter(this.char, t, this.state);
    const sway = this.opts.sway && !this._dragged ? Math.sin(t * 0.5) * 0.28 : 0;
    this.pivot.rotation.y = this.opts.yaw + this.userYaw + sway;

    // frame the full figure
    const dist = 3.6 / this.opts.fit;
    this.camera.position.set(0, 1.04, dist);
    this.camera.lookAt(0, 0.92, 0);
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    const loop = () => { this._raf = requestAnimationFrame(loop); this.draw(); };
    loop();
  }
  stopLoop() { cancelAnimationFrame(this._raf); }
}
