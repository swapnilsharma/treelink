// ============================================================
// GlucoQuest — "Inside the body" live visualization
//
// A stylized cross-section: stomach, bloodstream loop, the offline
// pancreas, liver, a muscle cell and a fat cell. Glucose particles
// (orange) enter from digestion; insulin particles (cyan) enter from
// the pump/pen site; cells take up glucose when insulin is present.
// Particle density in the vessel tracks actual blood glucose.
// ============================================================
import { fmtBG } from "./engine.js";

const TAU = Math.PI * 2;

export class BodyView {
  constructor(canvas, captionEl) {
    this.canvas = canvas;
    this.captionEl = captionEl;
    this.glucose = [];   // particles on the vessel loop {a, speed, r, leaving:null|{tx,ty,p}}
    this.insulin = [];
    this.sparks = [];    // uptake flashes at cells
    this.lastCaption = "";
  }

  // vessel loop: ellipse around the torso center
  loopPoint(cx, cy, rx, ry, a) {
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry * 0.9 };
  }

  draw(sim, mmol) {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h * 0.52;
    const scale = Math.min(w / 420, h / 460);
    const rx = 130 * scale, ry = 150 * scale;

    // ---- torso silhouette (soft 3D shading) ----
    const grad = ctx.createRadialGradient(cx - 40 * scale, cy - 60 * scale, 20, cx, cy, 260 * scale);
    grad.addColorStop(0, "rgba(120, 88, 110, 0.55)");
    grad.addColorStop(0.6, "rgba(70, 50, 80, 0.45)");
    grad.addColorStop(1, "rgba(30, 22, 45, 0.2)");
    ctx.beginPath();
    ctx.ellipse(cx, cy, 185 * scale, 215 * scale, 0, 0, TAU);
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(190, 150, 180, 0.25)"; ctx.lineWidth = 2; ctx.stroke();

    const { carbRate, insRate } = sim.flows();
    const bg = sim.bg;

    // ---- bloodstream tube ----
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry * 0.9, 0, 0, TAU);
    ctx.strokeStyle = "rgba(190, 40, 60, 0.30)";
    ctx.lineWidth = 26 * scale; ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry * 0.9, 0, 0, TAU);
    ctx.strokeStyle = "rgba(255, 120, 130, 0.16)";
    ctx.lineWidth = 12 * scale; ctx.stroke();
    // vessel stress glow when very high
    if (bg > 250) {
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry * 0.9, 0, 0, TAU);
      ctx.strokeStyle = `rgba(251, 146, 60, ${Math.min(0.4, (bg - 250) / 300)})`;
      ctx.lineWidth = 34 * scale; ctx.stroke();
    }

    // ---- organ positions ----
    const organs = {
      stomach:  { x: cx - rx * 0.55, y: cy - ry * 0.55, r: 30 * scale, label: "Stomach" },
      pancreas: { x: cx + rx * 0.05, y: cy - ry * 0.18, r: 24 * scale, label: "Pancreas" },
      liver:    { x: cx + rx * 0.55, y: cy - ry * 0.55, r: 30 * scale, label: "Liver" },
      muscle:   { x: cx + rx * 0.62, y: cy + ry * 0.58, r: 27 * scale, label: "Muscle cell" },
      fat:      { x: cx - rx * 0.62, y: cy + ry * 0.58, r: (22 + Math.min(16, sim.fatStore / 28)) * scale, label: "Fat cell" },
      site:     { x: cx, y: cy + ry * 0.95, r: 13 * scale, label: "Insulin in" },
    };

    const drawOrgan = (o, color, dim = false) => {
      const g = ctx.createRadialGradient(o.x - o.r * 0.35, o.y - o.r * 0.35, o.r * 0.15, o.x, o.y, o.r);
      g.addColorStop(0, dim ? "rgba(140,140,150,0.7)" : color);
      g.addColorStop(1, dim ? "rgba(70,70,85,0.55)" : "rgba(20,20,40,0.4)");
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = dim ? "rgba(160,160,170,0.4)" : "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.5; ctx.stroke();
    };

    // stomach pulses while digesting
    const digestPulse = carbRate > 0.02 ? 1 + Math.sin(performance.now() / 180) * 0.06 : 1;
    organs.stomach.r *= digestPulse;
    drawOrgan(organs.stomach, "rgba(251, 146, 60, 0.95)");
    drawOrgan(organs.liver, "rgba(180, 83, 50, 0.95)");
    drawOrgan(organs.muscle, "rgba(225, 80, 100, 0.95)");
    drawOrgan(organs.fat, "rgba(250, 220, 120, 0.95)");
    drawOrgan(organs.pancreas, "", true); // offline!
    // pancreas "offline" mark
    ctx.font = `${Math.max(11, 13 * scale)}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("⚠", organs.pancreas.x, organs.pancreas.y);

    // pump/pen site
    ctx.beginPath(); ctx.arc(organs.site.x, organs.site.y, organs.site.r, 0, TAU);
    ctx.fillStyle = "rgba(34, 211, 238, 0.25)"; ctx.fill();
    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2; ctx.stroke();

    // ---- particle management ----
    // target glucose particle count ∝ BG
    const targetG = Math.round(((Math.min(400, bg) - 40) / 360) * 110 + 6);
    while (this.glucose.length < targetG) {
      this.glucose.push({ a: Math.random() * TAU, speed: 0.004 + Math.random() * 0.005, r: (2 + Math.random() * 1.8) * scale, leaving: null, jit: Math.random() * TAU });
    }
    if (this.glucose.length > targetG) {
      // excess particles get taken up by cells (visual: send to muscle, or fat if storing)
      const extra = this.glucose.length - targetG;
      let sent = 0;
      for (const p of this.glucose) {
        if (sent >= Math.min(extra, 3)) break;
        if (!p.leaving) {
          const storingFat = insRate > 0.01 && bg < 150;
          const dest = storingFat && Math.random() < 0.45 ? organs.fat : organs.muscle;
          p.leaving = { tx: dest.x, ty: dest.y, p: 0, fat: dest === organs.fat };
          sent++;
        }
      }
      if (sent === 0) this.glucose.splice(0, Math.min(extra, 2));
    }

    // insulin particles ∝ activity (+ basal trickle)
    const targetI = Math.round(insRate * 240 + (sim.basalOn ? 5 : 0));
    while (this.insulin.length < targetI) {
      this.insulin.push({ a: Math.PI / 2 + (Math.random() - 0.5) * 0.4, speed: 0.006 + Math.random() * 0.006, r: 1.8 * scale, life: 1 });
    }
    if (this.insulin.length > targetI) this.insulin.splice(0, this.insulin.length - targetI);

    // ---- draw glucose particles ----
    for (let i = this.glucose.length - 1; i >= 0; i--) {
      const p = this.glucose[i];
      if (p.leaving) {
        p.leaving.p += 0.025;
        const from = this.loopPoint(cx, cy, rx, ry, p.a);
        const x = from.x + (p.leaving.tx - from.x) * p.leaving.p;
        const y = from.y + (p.leaving.ty - from.y) * p.leaving.p;
        ctx.beginPath(); ctx.arc(x, y, p.r, 0, TAU);
        ctx.fillStyle = "#fb923c"; ctx.fill();
        if (p.leaving.p >= 1) {
          this.sparks.push({ x: p.leaving.tx, y: p.leaving.ty, life: 1, fat: p.leaving.fat });
          this.glucose.splice(i, 1);
        }
        continue;
      }
      p.a += p.speed * (1 + (bg > 250 ? 0.3 : 0));
      const pt = this.loopPoint(cx, cy, rx, ry, p.a);
      const jx = Math.cos(p.jit + performance.now() / 400) * 5 * scale;
      const jy = Math.sin(p.jit + performance.now() / 350) * 4 * scale;
      ctx.beginPath(); ctx.arc(pt.x + jx, pt.y + jy, p.r, 0, TAU);
      ctx.fillStyle = "rgba(251, 146, 60, 0.95)"; ctx.fill();
    }

    // new glucose entering from stomach while digesting (visual stream)
    if (carbRate > 0.02) {
      const n = Math.min(4, Math.ceil(carbRate * 6));
      ctx.strokeStyle = "rgba(251, 146, 60, 0.5)"; ctx.lineWidth = 2;
      for (let k = 0; k < n; k++) {
        const t = ((performance.now() / 500) + k / n) % 1;
        const sx = organs.stomach.x + (this.loopPoint(cx, cy, rx, ry, Math.PI * 1.25).x - organs.stomach.x) * t;
        const sy = organs.stomach.y + (this.loopPoint(cx, cy, rx, ry, Math.PI * 1.25).y - organs.stomach.y) * t;
        ctx.beginPath(); ctx.arc(sx, sy, 2.5 * scale, 0, TAU);
        ctx.fillStyle = "#fdba74"; ctx.fill();
      }
    }

    // ---- draw insulin particles (enter at site, circulate) ----
    for (const p of this.insulin) {
      p.a += p.speed;
      const pt = this.loopPoint(cx, cy, rx, ry, p.a);
      ctx.beginPath(); ctx.arc(pt.x, pt.y, p.r, 0, TAU);
      ctx.fillStyle = "rgba(34, 211, 238, 0.95)"; ctx.fill();
      // tiny key glyph: insulin "unlocks" cells
    }

    // ---- uptake sparks ----
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.life -= 0.04;
      if (sp.life <= 0) { this.sparks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(sp.x, sp.y, (1 - sp.life) * 22 * scale, 0, TAU);
      ctx.strokeStyle = sp.fat ? `rgba(250, 220, 120, ${sp.life})` : `rgba(74, 222, 128, ${sp.life})`;
      ctx.lineWidth = 2; ctx.stroke();
    }

    // ---- labels ----
    ctx.font = `600 ${Math.max(10, 11.5 * scale)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "rgba(238, 242, 255, 0.85)";
    ctx.textAlign = "center";
    for (const key of ["stomach", "liver", "muscle", "fat"]) {
      const o = organs[key];
      ctx.fillText(o.label, o.x, o.y + o.r + 13);
    }
    ctx.fillStyle = "rgba(180, 180, 195, 0.8)";
    ctx.fillText("Pancreas (beta cells offline)", organs.pancreas.x, organs.pancreas.y + organs.pancreas.r + 13);
    ctx.fillStyle = "rgba(34, 211, 238, 0.9)";
    ctx.fillText(sim.basalOn ? "Insulin in (pump/pen)" : "⚠ No insulin flowing!", organs.site.x, organs.site.y + organs.site.r + 13);

    // BG readout in corner
    ctx.textAlign = "left";
    ctx.font = `800 ${Math.max(15, 18 * scale)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = bg < 70 ? "#fb7185" : bg > 180 ? "#fbbf24" : "#4ade80";
    ctx.fillText(`Blood glucose: ${fmtBG(bg, mmol)}`, 12, 24);

    this.updateCaption(sim, carbRate, insRate);
  }

  updateCaption(sim, carbRate, insRate) {
    const bg = sim.bg;
    let txt;
    if (!sim.basalOn) {
      txt = `<b class="ins">No insulin is flowing in.</b> With zero insulin, glucose can't enter cells at all — the liver keeps releasing more, and BG climbs relentlessly. This is why a failed pump site gets dangerous within hours.`;
    } else if (bg < 70) {
      txt = `<b>Too little glucose in the blood.</b> The brain runs almost entirely on glucose — that's why a low feels like shaking, sweating and fog. Fast sugar is the only fix; insulin on board will keep pulling BG down meanwhile.`;
    } else if (carbRate > 0.06 && insRate > 0.012) {
      txt = `<b class="glu">Glucose</b> is streaming in from digestion while <b class="ins">insulin</b> circulates, unlocking muscle cells to absorb it. This handshake — which a working pancreas does automatically — is the dose you chose, racing the meal.`;
    } else if (carbRate > 0.06) {
      txt = `<b class="glu">Glucose</b> is pouring in from the stomach, but the pancreas can't answer — its beta cells are gone. Without injected <b class="ins">insulin</b>, this sugar just accumulates in the bloodstream.`;
    } else if (bg > 250) {
      txt = `<b class="glu">The bloodstream is crowded with glucose.</b> Cells are starving while sugar piles up outside — at these levels, blood vessels and nerves are under stress. Years of this is what damages eyes, kidneys and feet.`;
    } else if (bg > 180) {
      txt = `<b>Running high.</b> Extra glucose thickens the traffic in the vessel; the kidneys start dumping sugar into urine — hence the thirst and bathroom trips of hyperglycemia.`;
    } else if (insRate > 0.012) {
      txt = `<b class="ins">Insulin</b> is active with little food left to cover — glucose keeps moving into cells, and what isn't needed for energy is stored in <b>fat cells</b>. Dosing more than the food requires builds fat over time, and risks a low.`;
    } else {
      txt = `<b>Steady state.</b> Background (basal) insulin is quietly matching the liver's glucose output. The pancreas is dim because in T1D its insulin factories — beta cells — were destroyed by the immune system.`;
    }
    if (txt !== this.lastCaption) {
      this.lastCaption = txt;
      this.captionEl.innerHTML = txt;
    }
  }
}
