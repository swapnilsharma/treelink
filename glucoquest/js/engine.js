// ============================================================
// GlucoQuest — metabolic simulation engine
//
// Simplified but honest model, stepped in 1-minute ticks:
//   BG rises with carb absorption (curve depends on glycemic profile)
//   BG falls with insulin activity (rapid-acting curve, ~4 h tail)
//   Basal insulin cancels the liver's background output — unless it stops
//   Exercise, stress, dawn phenomenon and noise perturb the balance
// Units internally: mg/dL, grams, insulin units, minutes.
// ============================================================

export const MGDL_PER_GRAM = 4.4;   // BG rise per gram of carbs (≈70 kg adult)
export const DIA = 240;             // duration of insulin action, minutes

// Absorption profiles: when carbs hit the blood, by glycemic character
const GI_PROFILES = {
  fast: { delay: 5,  peak: 30,  dur: 100 },
  med:  { delay: 10, peak: 55,  dur: 180 },
  slow: { delay: 12, peak: 85, dur: 330 },    // high fat/protein — early trickle, long tail (the pizza effect)
};

// Triangular rate curve: rises to peak then falls; area normalized to 1.
function triRate(tau, delay, peak, dur) {
  const t = tau - delay;
  const span = dur - delay;
  if (t <= 0 || t >= span) return 0;
  const p = peak - delay;
  const h = 2 / span; // height so total area = 1
  return t < p ? (h * t) / p : h * (1 - (t - p) / (span - p));
}
function triCum(tau, delay, peak, dur) {
  const t = Math.max(0, Math.min(tau - delay, dur - delay));
  const span = dur - delay, p = peak - delay, h = 2 / span;
  if (t <= 0) return 0;
  if (t <= p) return (h * t * t) / (2 * p);
  const rest = Math.min(t - p, span - p);
  return (h * p) / 2 + h * rest - (h * rest * rest) / (2 * (span - p));
}

// Rapid-acting insulin activity: onset ~12 min, peak ~70, done by DIA
const INS = { delay: 12, peak: 70, dur: DIA };

export class Sim {
  constructor(settings) {
    this.s = Object.assign({ isf: 45, icr: 10, target: 110 }, settings);
    this.t = 7 * 60;                 // minutes since Day-1 00:00 (start 07:00)
    this.bg = 124;                   // blood glucose, mg/dL
    this.carbs = [];                 // {grams, gi, t0, absorbed}
    this.boluses = [];               // {units, t0}
    this.basalOn = true;             // basal covering liver output?
    this.dampedUntil = 0;            // post-severe-low liver dump cooldown
    this.exercise = null;            // {until, uptake, adrenaline}
    this.sensUntil = 0; this.sensMult = 1;   // post-exercise sensitivity
    this.stress = 0;                 // 0..1, decays
    this.fatStore = 0;               // grams of "extra" stored fat (teaching stat)
    this.drift = 0;                  // slow random walk
    this.history = [];               // per-5-min {t, bg} CGM trace
    this.cgmLag = [];                // ring buffer for sensor lag
    this.events = [];                // markers {t, kind, label}
    this._mealSeq = 0;
    // rolling stats
    this.minutesTotal = 0; this.minutesLow = 0; this.minutesHigh = 0;
    this.bgSum = 0;
    this.lowEpisodes = 0; this._wasLow = false;
    this._seedCgm();
  }

  _seedCgm() {
    for (let i = 0; i < 4; i++) this.cgmLag.push(this.bg);
    this.history.push({ t: this.t, bg: this.bg });
  }

  // ---- inputs --------------------------------------------------
  eat(grams, gi, label) {
    if (grams <= 0) return;
    // real-world absorption variability ±12%
    const eff = grams * (0.88 + Math.random() * 0.24);
    this.carbs.push({ grams: eff, gi, t0: this.t });
    this.events.push({ t: this.t, kind: "carb", label: `${label || "Food"} ${Math.round(grams)}g` });
  }

  bolus(units, label) {
    if (units <= 0) return;
    this.boluses.push({ units, t0: this.t });
    this.events.push({ t: this.t, kind: "bolus", label: `${units}u ${label || ""}`.trim() });
  }

  startExercise(opt) {
    this.exercise = { until: this.t + opt.duration, uptake: opt.uptake, adrenaline: opt.adrenaline };
    if (opt.sensHours > 0) {
      this.sensUntil = this.t + opt.duration + opt.sensHours * 60;
      this.sensMult = opt.sensMult;
    }
    this.events.push({ t: this.t, kind: "exercise", label: "Exercise" });
  }

  addStress(amount) { this.stress = Math.min(1, this.stress + amount); }

  // insulin-on-board (units still active)
  iob() {
    let u = 0;
    for (const b of this.boluses) {
      const tau = this.t - b.t0;
      if (tau < INS.dur) u += b.units * (1 - triCum(tau, INS.delay, INS.peak, INS.dur));
    }
    return u;
  }

  // carbs still being absorbed
  cob() {
    let g = 0;
    for (const c of this.carbs) {
      const p = GI_PROFILES[c.gi];
      const tau = this.t - c.t0;
      if (tau < p.dur) g += c.grams * (1 - triCum(tau, p.delay, p.peak, p.dur));
    }
    return g;
  }

  // current flow rates (used by the body visualization)
  flows() {
    let carbRate = 0, insRate = 0;
    for (const c of this.carbs) {
      const p = GI_PROFILES[c.gi];
      carbRate += c.grams * triRate(this.t - c.t0, p.delay, p.peak, p.dur);
    }
    for (const b of this.boluses) {
      insRate += b.units * triRate(this.t - b.t0, INS.delay, INS.peak, INS.dur);
    }
    return { carbRate, insRate }; // g/min, u/min
  }

  sensitivity() {
    let m = this.t < this.sensUntil ? this.sensMult : 1;
    return m;
  }

  hourOfDay() { return (this.t % 1440) / 60; }

  // ---- one minute of physiology --------------------------------
  tick() {
    const { carbRate, insRate } = this.flows();
    let d = 0;

    // food in
    d += carbRate * MGDL_PER_GRAM;

    // insulin action (boosted by exercise sensitivity, blunted slightly
    // when very low — counter-regulatory hormones fight back)
    const insulinDrop = insRate * this.s.isf * this.sensitivity() * (this.bg < 60 ? 0.75 : 1);
    d -= insulinDrop;

    // liver vs basal: balanced when basal flows; if basal is interrupted
    // (site failure / missed long-acting), glucose climbs steadily
    const liver = 0.75;
    d += liver - (this.basalOn ? liver : 0);

    // dawn phenomenon: 04:00–08:00 hormonal push
    const h = this.hourOfDay();
    if (h >= 4 && h < 8) d += 0.22;

    // exercise: direct muscle uptake + adrenaline push for intense work
    if (this.exercise) {
      if (this.t < this.exercise.until) {
        d -= this.exercise.uptake * (this.bg > 90 ? 1 : 0.3);
        d += this.exercise.adrenaline;
      } else this.exercise = null;
    }

    // stress hormones
    if (this.stress > 0) {
      d += 0.45 * this.stress;
      this.stress = Math.max(0, this.stress - 1 / 150); // ~2.5 h decay
    }

    // body's own defense: liver rescue dump when very low (weakened if recent)
    if (this.bg < 65 && this.t > this.dampedUntil) d += 0.5;

    // gentle homeostatic pull + noise
    d += (110 - this.bg) * 0.0012;
    this.drift = Math.max(-0.25, Math.min(0.25, this.drift + (Math.random() - 0.5) * 0.05));
    d += this.drift;

    this.bg = Math.max(35, Math.min(440, this.bg + d));

    // fat storage teaching stat: insulin clearing glucose beyond what's
    // needed → energy stored as fat (~very rough conversion for display)
    if (insulinDrop > 0 && this.bg < 150) {
      this.fatStore += (insulinDrop / this.s.isf) * 0.9; // "grams" per unit cleared at normal BG
    }

    this.t++;
    this.minutesTotal++;
    this.bgSum += this.bg;
    if (this.bg < 70) this.minutesLow++;
    else if (this.bg > 180) this.minutesHigh++;
    const isLow = this.bg < 70;
    if (isLow && !this._wasLow) this.lowEpisodes++;
    this._wasLow = isLow;

    // CGM: sensor lags blood by ~10 min (ring buffer, 5-min cadence) + noise
    if (this.t % 5 === 0) {
      this.cgmLag.push(this.bg);
      const lagged = this.cgmLag.shift();
      const reading = Math.round(Math.max(40, Math.min(400, lagged + (Math.random() - 0.5) * 6)));
      this.history.push({ t: this.t, bg: reading });
      if (this.history.length > 2200) this.history.splice(0, this.history.length - 2200);
    }

    // prune finished curves
    this.carbs = this.carbs.filter(c => this.t - c.t0 < GI_PROFILES[c.gi].dur + 5);
    this.boluses = this.boluses.filter(b => this.t - b.t0 < INS.dur + 5);
  }

  cgmNow() { return this.history.length ? this.history[this.history.length - 1].bg : Math.round(this.bg); }

  // CGM trend over last 20 min → arrow glyph
  trendArrow() {
    const n = this.history.length;
    if (n < 5) return "→";
    const a = this.history[n - 5].bg, b = this.history[n - 1].bg;
    const slope = (b - a) / 20; // mg/dL per min
    if (slope > 3) return "⇈";
    if (slope > 1.5) return "↑";
    if (slope > 0.6) return "↗";
    if (slope < -3) return "⇊";
    if (slope < -1.5) return "↓";
    if (slope < -0.6) return "↘";
    return "→";
  }

  // suggested bolus from announced carbs + correction − IOB
  suggestBolus(carbGuess) {
    const food = carbGuess / this.s.icr;
    const corr = Math.max(0, (this.cgmNow() - this.s.target) / this.s.isf);
    const u = Math.max(0, food + corr - this.iob() * 0.85);
    return Math.round(u * 2) / 2;
  }

  // stats helpers
  meanBG() { return this.minutesTotal ? this.bgSum / this.minutesTotal : this.bg; }
  tir() {
    const tot = Math.max(1, this.minutesTotal);
    return {
      low: (this.minutesLow / tot) * 100,
      inRange: ((tot - this.minutesLow - this.minutesHigh) / tot) * 100,
      high: (this.minutesHigh / tot) * 100,
    };
  }
  // Glucose Management Indicator — estimated HbA1c from mean glucose
  gmi() { return 3.31 + 0.02392 * this.meanBG(); }
}

export function fmtBG(v, mmol) { return mmol ? (v / 18).toFixed(1) : String(Math.round(v)); }
export function bgUnit(mmol) { return mmol ? "mmol/L" : "mg/dL"; }
