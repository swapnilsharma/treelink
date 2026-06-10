// ============================================================
// GlucoQuest — CGM graph rendering (mini strip + full trends)
// ============================================================
import { fmtBG } from "./engine.js";

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

function bgColor(bg) {
  if (bg < 70) return "#fb7185";
  if (bg > 250) return "#f97316";
  if (bg > 180) return "#fbbf24";
  return "#4ade80";
}

const Y_MAX = 320, Y_MIN = 40;
function yFor(bg, h, pad = 6) {
  const c = Math.max(Y_MIN, Math.min(Y_MAX, bg));
  return pad + (1 - (c - Y_MIN) / (Y_MAX - Y_MIN)) * (h - pad * 2);
}

// ---- compact strip under the HUD: last 3 hours ----
export function drawMini(canvas, sim) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  ctx.clearRect(0, 0, w, h);
  const windowMin = 180;
  const t0 = sim.t - windowMin;

  // target band 70–180
  ctx.fillStyle = "rgba(74, 222, 128, 0.10)";
  const yTop = yFor(180, h), yBot = yFor(70, h);
  ctx.fillRect(0, yTop, w, yBot - yTop);

  const pts = sim.history.filter(p => p.t >= t0);
  if (pts.length > 1) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const x = ((pts[i].t - t0) / windowMin) * w;
      const y = yFor(pts[i].bg, h);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
    const last = pts[pts.length - 1];
    const lx = ((last.t - t0) / windowMin) * w, ly = yFor(last.bg, h);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = bgColor(last.bg); ctx.fill();
  }
}

// ---- full trends view: last 24 h with markers + axis ----
export function drawTrends(canvas, sim, mmol) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  ctx.clearRect(0, 0, w, h);
  const padL = 42, padR = 12, padT = 14, padB = 26;
  const gw = w - padL - padR, gh = h - padT - padB;
  const windowMin = 1440;
  const t0 = Math.max(0, sim.t - windowMin);
  const span = Math.max(360, sim.t - t0); // before 6 h of history exists, show a 6 h window

  const yy = bg => padT + (1 - (Math.max(Y_MIN, Math.min(Y_MAX, bg)) - Y_MIN) / (Y_MAX - Y_MIN)) * gh;
  const xx = t => padL + ((t - t0) / span) * gw;

  // target band
  ctx.fillStyle = "rgba(74, 222, 128, 0.10)";
  ctx.fillRect(padL, yy(180), gw, yy(70) - yy(180));

  // gridlines + y labels
  ctx.font = "10.5px Inter, system-ui, sans-serif";
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (const g of [70, 120, 180, 250, 300]) {
    ctx.strokeStyle = "rgba(148, 163, 196, 0.14)";
    ctx.beginPath(); ctx.moveTo(padL, yy(g)); ctx.lineTo(w - padR, yy(g)); ctx.stroke();
    ctx.fillStyle = g === 70 || g === 180 ? "#94a3c4" : "rgba(148,163,196,0.55)";
    ctx.fillText(fmtBG(g, mmol), padL - 6, yy(g));
  }

  // x labels: every 4 h
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(148,163,196,0.65)";
  const firstHour = Math.ceil(t0 / 240) * 240;
  for (let t = firstHour; t <= t0 + span; t += 240) {
    const hr = Math.floor((t % 1440) / 60);
    ctx.fillText(`${String(hr).padStart(2, "0")}:00`, xx(t), h - padB + 6);
    ctx.strokeStyle = "rgba(148, 163, 196, 0.08)";
    ctx.beginPath(); ctx.moveTo(xx(t), padT); ctx.lineTo(xx(t), h - padB); ctx.stroke();
  }

  // event markers
  for (const ev of sim.events) {
    if (ev.t < t0) continue;
    const x = xx(ev.t);
    let glyph = "•", col = "#94a3c4";
    if (ev.kind === "carb") { glyph = "🍽"; col = "#fb923c"; }
    if (ev.kind === "bolus") { glyph = "💧"; col = "#22d3ee"; }
    if (ev.kind === "exercise") { glyph = "🏃"; col = "#a78bfa"; }
    ctx.strokeStyle = col + "44";
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke();
    ctx.font = "11px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(glyph, x, padT + 12);
    ctx.font = "10.5px Inter, system-ui, sans-serif";
  }

  // trace, colored by zone
  const pts = sim.history.filter(p => p.t >= t0);
  if (pts.length > 1) {
    ctx.lineWidth = 2.2; ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      ctx.beginPath();
      ctx.moveTo(xx(pts[i - 1].t), yy(pts[i - 1].bg));
      ctx.lineTo(xx(pts[i].t), yy(pts[i].bg));
      ctx.strokeStyle = bgColor((pts[i - 1].bg + pts[i].bg) / 2);
      ctx.stroke();
    }
    const last = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(xx(last.t), yy(last.bg), 5, 0, Math.PI * 2);
    ctx.fillStyle = bgColor(last.bg); ctx.fill();
    ctx.strokeStyle = "#0b1020"; ctx.lineWidth = 2; ctx.stroke();
  }
}

// ---- ambient title-screen background: drifting glucose trace ----
export function startTitleBG(canvas) {
  const dots = [];
  let raf;
  function loop() {
    const s = setupCanvas(canvas);
    if (s) {
      const { ctx, w, h } = s;
      ctx.clearRect(0, 0, w, h);
      if (dots.length < 70 && Math.random() < 0.4) {
        dots.push({ x: -10, y: h * (0.2 + Math.random() * 0.6), v: 0.4 + Math.random() * 0.9, r: 1.5 + Math.random() * 3.5, c: Math.random() < 0.55 ? "#fb923c" : "#22d3ee", ph: Math.random() * 6 });
      }
      for (const d of dots) {
        d.x += d.v;
        const y = d.y + Math.sin(d.x / 60 + d.ph) * 14;
        ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c + "55"; ctx.fill();
      }
      for (let i = dots.length - 1; i >= 0; i--) if (dots[i].x > w + 12) dots.splice(i, 1);
    }
    raf = requestAnimationFrame(loop);
  }
  loop();
  return () => cancelAnimationFrame(raf);
}
