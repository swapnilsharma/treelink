// ============================================================
// Life in Range — CGM rendering (mini strip + full trends)
// Styled like real CGM software: dot trace, quiet target band.
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
  if (bg < 70) return "#e05c6e";
  if (bg > 250) return "#c96f3f";
  if (bg > 180) return "#cf9a42";
  return "#e8eaed";
}

const Y_MAX = 320, Y_MIN = 40;
function yFor(bg, h, pad = 7) {
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

  // target band
  const yTop = yFor(180, h), yBot = yFor(70, h);
  ctx.fillStyle = "rgba(79, 174, 125, 0.07)";
  ctx.fillRect(0, yTop, w, yBot - yTop);
  ctx.strokeStyle = "rgba(79, 174, 125, 0.22)";
  ctx.setLineDash([3, 5]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(w, yTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(w, yBot); ctx.stroke();
  ctx.setLineDash([]);

  const pts = sim.history.filter(p => p.t >= t0);
  for (let i = 0; i < pts.length; i++) {
    const x = ((pts[i].t - t0) / windowMin) * w;
    const y = yFor(pts[i].bg, h);
    const last = i === pts.length - 1;
    ctx.beginPath(); ctx.arc(x, y, last ? 3.4 : 1.7, 0, Math.PI * 2);
    ctx.fillStyle = last ? bgColor(pts[i].bg) : "rgba(232, 234, 237, 0.65)";
    ctx.fill();
  }
}

// ---- full trends view: last 24 h ----
export function drawTrends(canvas, sim, mmol) {
  const s = setupCanvas(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  ctx.clearRect(0, 0, w, h);
  const padL = 44, padR = 14, padT = 16, padB = 28;
  const gw = w - padL - padR, gh = h - padT - padB;
  const windowMin = 1440;
  const t0 = Math.max(0, sim.t - windowMin);
  const span = Math.max(360, sim.t - t0);

  const yy = bg => padT + (1 - (Math.max(Y_MIN, Math.min(Y_MAX, bg)) - Y_MIN) / (Y_MAX - Y_MIN)) * gh;
  const xx = t => padL + ((t - t0) / span) * gw;

  // target band
  ctx.fillStyle = "rgba(79, 174, 125, 0.06)";
  ctx.fillRect(padL, yy(180), gw, yy(70) - yy(180));
  ctx.strokeStyle = "rgba(79, 174, 125, 0.25)";
  ctx.setLineDash([4, 6]); ctx.lineWidth = 1;
  for (const g of [70, 180]) { ctx.beginPath(); ctx.moveTo(padL, yy(g)); ctx.lineTo(w - padR, yy(g)); ctx.stroke(); }
  ctx.setLineDash([]);

  ctx.font = "500 10px Inter, system-ui, sans-serif";
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (const g of [70, 120, 180, 250, 300]) {
    if (g !== 70 && g !== 180) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath(); ctx.moveTo(padL, yy(g)); ctx.lineTo(w - padR, yy(g)); ctx.stroke();
    }
    ctx.fillStyle = g === 70 || g === 180 ? "rgba(79, 174, 125, 0.8)" : "#5f656e";
    ctx.fillText(fmtBG(g, mmol), padL - 8, yy(g));
  }

  // x labels every 4 h
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  const firstHour = Math.ceil(t0 / 240) * 240;
  for (let t = firstHour; t <= t0 + span; t += 240) {
    const hr = Math.floor((t % 1440) / 60);
    ctx.fillStyle = "#5f656e";
    ctx.fillText(`${String(hr).padStart(2, "0")}:00`, xx(t), h - padB + 8);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath(); ctx.moveTo(xx(t), padT); ctx.lineTo(xx(t), h - padB); ctx.stroke();
  }

  // event markers: thin ticks at the top
  for (const ev of sim.events) {
    if (ev.t < t0) continue;
    const x = xx(ev.t);
    let col = "#5f656e";
    if (ev.kind === "carb") col = "#d49a55";
    if (ev.kind === "bolus") col = "#6b9fd4";
    if (ev.kind === "exercise") col = "#8d7fc0";
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + 7); ctx.stroke();
  }

  // dot trace
  const pts = sim.history.filter(p => p.t >= t0);
  for (let i = 0; i < pts.length; i++) {
    const x = xx(pts[i].t), y = yy(pts[i].bg);
    const last = i === pts.length - 1;
    ctx.beginPath(); ctx.arc(x, y, last ? 4 : 1.6, 0, Math.PI * 2);
    const v = pts[i].bg;
    ctx.fillStyle = last ? bgColor(v)
      : v < 70 ? "rgba(224, 92, 110, 0.85)"
      : v > 180 ? "rgba(207, 154, 66, 0.8)"
      : "rgba(232, 234, 237, 0.6)";
    ctx.fill();
  }
}

// ---- title background: a slow ghost CGM trace ----
export function startTitleBG(canvas) {
  let raf, t = 0;
  function loop() {
    const s = setupCanvas(canvas);
    if (s) {
      const { ctx, w, h } = s;
      ctx.clearRect(0, 0, w, h);
      // faint band
      ctx.fillStyle = "rgba(79, 174, 125, 0.04)";
      ctx.fillRect(0, h * 0.42, w, h * 0.2);
      t += 0.35;
      const n = Math.floor(w / 9);
      for (let i = 0; i < n; i++) {
        const x = i * 9;
        const ph = (i + t) * 0.11;
        const y = h * 0.52 + Math.sin(ph) * h * 0.09 + Math.sin(ph * 0.37 + 2) * h * 0.07;
        const inBand = y > h * 0.42 && y < h * 0.62;
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = inBand ? "rgba(232,234,237,0.34)" : "rgba(207,154,66,0.3)";
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(loop);
  }
  loop();
  return () => cancelAnimationFrame(raf);
}
