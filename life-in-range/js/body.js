// ============================================================
// Life in Range — the body, in 3D (Three.js)
//
// A circulation loop rendered as a translucent vessel in space.
// Glucose (amber) and insulin (blue) particles flow through it;
// organ nodes sit along the loop. Particle density tracks real
// blood glucose. Drag to orbit.
// ============================================================
import * as THREE from "../vendor/three.module.min.js";

const MAX_G = 150, MAX_I = 90;

export class BodyView {
  constructor(canvas, captionEl) {
    this.canvas = canvas;
    this.captionEl = captionEl;
    this.labelBox = document.getElementById("body-labels");
    this.inited = false;
    this.lastCaption = "";
    this.az = 0; this.pol = 1.18;          // camera spherical angles
    this.dragging = false;
    this.autoSpin = true;
    this.clock = new THREE.Clock();
  }

  init() {
    const c = this.canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);

    // ---- circulation loop curve ----
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(a) * 2.1,
        Math.sin(a) * 2.55,
        Math.sin(a * 2) * 0.5
      ));
    }
    this.curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.6);

    const tubeGeo = new THREE.TubeGeometry(this.curve, 180, 0.21, 14, true);
    this.tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({
      color: 0x5a1822, roughness: 0.35, metalness: 0.15,
      transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide,
    }));
    this.scene.add(this.tube);

    const innerGeo = new THREE.TubeGeometry(this.curve, 180, 0.105, 10, true);
    this.inner = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({
      color: 0x962b3c, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.scene.add(this.inner);

    // ---- lights ----
    this.scene.add(new THREE.AmbientLight(0xbfc6d0, 0.55));
    const key = new THREE.DirectionalLight(0xe8eaed, 1.5);
    key.position.set(4, 6, 5);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x6b9fd4, 6, 18);
    rim.position.set(-5, -2, -4);
    this.scene.add(rim);

    // ---- organs along the loop ----
    const organ = (t, scaleV, color, rough = 0.5) => {
      const p = this.curve.getPointAt(t).multiplyScalar(1.42);
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 22),
        new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.08, emissive: color, emissiveIntensity: 0.06 })
      );
      m.position.copy(p);
      m.scale.setScalar(scaleV);
      this.scene.add(m);
      return m;
    };
    this.stomach = organ(0.105, 0.46, 0xb97f3e);
    this.stomach.scale.set(0.52, 0.4, 0.42);
    this.liver = organ(0.30, 0.5, 0x7e4430);
    this.liver.scale.set(0.62, 0.4, 0.45);
    this.pancreas = organ(0.455, 0.3, 0x5a5f68, 0.8);
    this.pancreas.scale.set(0.46, 0.22, 0.26);
    this.muscle = organ(0.645, 0.42, 0x96474f);
    this.muscle.scale.set(0.42, 0.55, 0.42);
    this.fat = organ(0.815, 0.4, 0xb6a25e);

    // insulin entry: a small ring at the bottom of the loop
    const sitePos = this.curve.getPointAt(0.93).multiplyScalar(1.25);
    this.site = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.045, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x6b9fd4, emissive: 0x6b9fd4, emissiveIntensity: 0.5, roughness: 0.3 })
    );
    this.site.position.copy(sitePos);
    this.scene.add(this.site);

    // ---- particles ----
    const mkParticles = (n, size, color, ei) => {
      const mesh = new THREE.InstancedMesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: ei, roughness: 0.4 }),
        n
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.scene.add(mesh);
      const parts = [];
      for (let i = 0; i < n; i++) {
        parts.push({
          t: Math.random(),
          speed: 0.014 + Math.random() * 0.012,
          off: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.22),
        });
      }
      return { mesh, parts };
    };
    this.glu = mkParticles(MAX_G, 0.05, 0xd49a55, 0.7);
    this.ins = mkParticles(MAX_I, 0.034, 0x7fb1e3, 0.9);
    this.ins.parts.forEach(p => { p.t = 0.93 + Math.random() * 0.06; p.speed *= 1.25; });
    this.dummy = new THREE.Object3D();

    // ---- labels ----
    this.labels = [
      { mesh: this.stomach, name: "Stomach", sub: "" },
      { mesh: this.liver, name: "Liver", sub: "" },
      { mesh: this.pancreas, name: "Pancreas", sub: "beta cells offline" },
      { mesh: this.muscle, name: "Muscle", sub: "" },
      { mesh: this.fat, name: "Fat", sub: "" },
      { mesh: this.site, name: "Insulin in", sub: "" },
    ];
    this.labelBox.innerHTML = "";
    for (const l of this.labels) {
      l.el = document.createElement("div");
      l.el.className = "blabel";
      this.labelBox.appendChild(l.el);
    }

    // ---- pointer orbit ----
    let px = 0, py = 0;
    this.canvas.addEventListener("pointerdown", e => { this.dragging = true; this.autoSpin = false; px = e.clientX; py = e.clientY; });
    window.addEventListener("pointermove", e => {
      if (!this.dragging) return;
      this.az -= (e.clientX - px) * 0.008;
      this.pol = Math.max(0.5, Math.min(2.4, this.pol - (e.clientY - py) * 0.006));
      px = e.clientX; py = e.clientY;
    });
    window.addEventListener("pointerup", () => { this.dragging = false; setTimeout(() => this.autoSpin = true, 4000); });

    this.inited = true;
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return false;
    const dw = this.renderer.domElement.width, dpr = this.renderer.getPixelRatio();
    if (Math.abs(dw - w * dpr) > 2 || Math.abs(this.renderer.domElement.height - h * dpr) > 2) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    return true;
  }

  draw(sim, mmol) {
    if (!this.canvas.clientWidth) return;
    if (!this.inited) this.init();
    if (!this.resize()) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    const now = performance.now();
    const { carbRate, insRate } = sim.flows();
    const bg = sim.bg;

    // camera — distance chosen so the full loop + organs (+labels) fit
    // whichever axis is tighter
    if (this.autoSpin && !this.dragging) this.az += dt * 0.12;
    const halfFov = Math.tan((this.camera.fov / 2) * Math.PI / 180);
    const r = Math.min(15, 4.1 / (halfFov * Math.min(1, this.camera.aspect)));
    this.camera.position.set(
      r * Math.sin(this.pol) * Math.sin(this.az),
      r * Math.cos(this.pol),
      r * Math.sin(this.pol) * Math.cos(this.az)
    );
    this.camera.lookAt(0, 0, 0);

    // vessel stress when very high
    const stress = Math.max(0, Math.min(1, (bg - 220) / 180));
    this.inner.material.color.setRGB(0.59 + stress * 0.3, 0.17 + stress * 0.25, 0.24 - stress * 0.08);
    this.inner.material.opacity = 0.22 + stress * 0.25;

    // organ states
    const pulse = 1 + Math.sin(now / 220) * 0.05;
    this.stomach.material.emissiveIntensity = carbRate > 0.02 ? 0.45 * pulse : 0.06;
    this.liver.material.emissiveIntensity = sim.basalOn ? 0.06 : 0.3 + Math.sin(now / 300) * 0.12;
    this.pancreas.material.emissiveIntensity = 0.03 + (Math.sin(now / 900) > 0.92 ? 0.1 : 0);
    this.muscle.material.emissiveIntensity = insRate > 0.012 ? 0.35 : 0.06;
    const fatScale = 0.4 * (1 + Math.min(0.85, sim.fatStore / 700));
    this.fat.scale.setScalar(fatScale);
    this.site.material.emissiveIntensity = sim.basalOn ? 0.45 + (insRate > 0.012 ? 0.4 : 0) : 0.05;
    this.site.material.color.setHex(sim.basalOn ? 0x6b9fd4 : 0x55313a);

    // particles
    const flowBoost = 1 + stress * 0.5;
    const targetG = Math.round(((Math.min(400, bg) - 40) / 360) * (MAX_G - 8) + 8);
    this.updateParticles(this.glu, targetG, dt * flowBoost, 1.0);
    const targetI = Math.min(MAX_I, Math.round(insRate * 220 + (sim.basalOn ? 7 : 0)));
    this.updateParticles(this.ins, targetI, dt, 1.0);

    this.renderer.render(this.scene, this.camera);
    this.placeLabels(sim);
    this.updateCaption(sim, carbRate, insRate);
  }

  updateParticles(group, count, dt, radialMult) {
    const { mesh, parts } = group;
    mesh.count = Math.max(0, Math.min(parts.length, count));
    for (let i = 0; i < mesh.count; i++) {
      const p = parts[i];
      p.t = (p.t + p.speed * dt * 10) % 1;
      const pos = this.curve.getPointAt(p.t);
      this.dummy.position.set(
        pos.x + p.off.x * radialMult,
        pos.y + p.off.y * radialMult,
        pos.z + p.off.z * radialMult
      );
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  placeLabels(sim) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const v = new THREE.Vector3();
    for (const l of this.labels) {
      v.copy(l.mesh.position); v.y += 0.55;
      v.project(this.camera);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      const visible = v.z < 1 && x > 20 && x < w - 20 && y > 14 && y < h - 40;
      l.el.style.opacity = visible ? "" : "0";
      if (!visible) continue;
      l.el.style.left = x + "px";
      l.el.style.top = y + "px";
      let sub = l.sub;
      if (l.name === "Insulin in") {
        sub = sim.basalOn ? (sim.iob() > 0.2 ? `${sim.iob().toFixed(1)}u active` : "basal only") : "no flow";
        l.el.classList.toggle("warn", !sim.basalOn);
      }
      l.el.innerHTML = l.name + (sub ? `<small>${sub}</small>` : "");
    }
  }

  updateCaption(sim, carbRate, insRate) {
    const bg = sim.bg;
    let txt;
    if (!sim.basalOn) txt = `<b class="ins">No insulin is reaching the blood.</b> The liver keeps releasing glucose; levels climb until delivery is fixed.`;
    else if (bg < 70) txt = `<b>Glucose is scarce.</b> The brain runs almost entirely on it — hence the shaking and the fog. Fast sugar is the only fix.`;
    else if (carbRate > 0.06 && insRate > 0.012) txt = `<b class="glu">Glucose</b> streams in from the meal while <b class="ins">insulin</b> unlocks cells to absorb it — the handshake you dosed for.`;
    else if (carbRate > 0.06 && sim.iob() > 0.5) txt = `The meal is landing before the <b class="ins">insulin</b> can act — the dose is still soaking in. These opening minutes are why pre-bolusing matters.`;
    else if (carbRate > 0.06) txt = `A meal is arriving with <b>no insulin to answer it</b>. The pancreas can't respond; the sugar simply accumulates.`;
    else if (bg > 250) txt = `<b class="glu">Glucose is crowding the vessel.</b> Cells starve while sugar piles up outside — this is what damages eyes, kidneys, nerves over years.`;
    else if (bg > 180) txt = `Running high. The kidneys spill excess sugar — the thirst and fatigue of hyperglycemia.`;
    else if (insRate > 0.012) txt = `<b class="ins">Insulin</b> active with little food left. Surplus glucose is being stored in <b>fat</b> — and a low is possible.`;
    else txt = `Steady state: basal insulin quietly matches the liver. The pancreas stays dark — its beta cells are gone.`;
    if (txt !== this.lastCaption) {
      this.lastCaption = txt;
      this.captionEl.innerHTML = txt;
    }
  }
}
