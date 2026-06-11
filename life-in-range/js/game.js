// ============================================================
// Life in Range — game orchestration: day schedule, decisions,
// alarms, scoring, save/load, HUD.
// ============================================================
import { Sim, fmtBG, bgUnit } from "./engine.js";
import { FOODS, PORTIONS, EXERCISES, FACTS, PROFESSIONS, DIFFICULTIES, symptomText } from "./data.js";
import { avatarSVG, renderScene } from "./avatar.js";
import { drawMini, drawTrends } from "./graph.js";
import { BodyView } from "./body.js";
import { icon } from "./icons.js";

const $ = id => document.getElementById(id);
const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const SAVE_KEY = "life-in-range-save-v1";

// ---------- tiny audio ----------
let audioCtx = null;
function beep(freq = 880, dur = 0.18, times = 1) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = freq; o.type = "sine";
      const t = audioCtx.currentTime + i * (dur + 0.12);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    }
  } catch (e) { /* audio unavailable */ }
}
function buzz(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

export class Game {
  constructor(character, opts = {}) {
    this.c = character;
    this.mmol = !!character.mmol;
    this.totalDays = character.days || 7;
    this.diff = DIFFICULTIES.find(d => d.id === character.difficulty) || DIFFICULTIES[1];
    // Personal insulin needs: derive carb ratio and correction factor
    // from a randomized total daily dose (the clinical 500/1800 rules).
    // 1u might cover 7 g for this character and 14 g for the next.
    if (!character.tdd) character.tdd = 36 + Math.floor(Math.random() * 35);
    const icr = Math.max(6, Math.round(500 / character.tdd));
    const isf = Math.max(25, Math.round(1800 / character.tdd / 5) * 5);
    this.sim = new Sim({ isf, icr, target: 110 });
    this.speed = 4;
    this.fast = false;
    this.paused = false;
    this.modalOpen = false;
    this.sleeping = false;
    this.energy = 88;
    this.dayIdx = 0;
    this.dayStats = [];
    this.guessErrors = [];
    this.severeLows = 0;
    this.nightWakes = 0;
    this.factsShown = new Set();
    this._sevCooldown = 0;
    this._siteFailToastT = 0;
    this._acc = 0;
    this._lastFrame = 0;
    this._trendTick = 0;
    this.scene = "kitchen";
    this.bodyView = new BodyView($("body-canvas"), $("body-caption"));
    this.onFinish = opts.onFinish || (() => {});
    this.onDaySummary = opts.onDaySummary || (() => {});
    if (opts.restore) this._restore(opts.restore);
    this.buildDay();
    // a restored game resumes mid-stream: don't re-fire past events
    if (opts.restore) for (const item of this.schedule) if (item.t <= this.sim.t) item.done = true;
    this._bindUI();
    this.setScene(this.scene);
    this.toast(`CGM on your arm, ${this.c.therapy === "pump" ? "pump clipped on" : "pens in your bag"}. The week starts now.`, "good", 6000, "MONDAY · 07:00");
    if (!opts.restore) this.settingsIntro();
  }

  // first-morning card: this character's personal numbers
  settingsIntro() {
    const s = this.sim.s;
    const body = this.diff.assist === "none"
      ? `<p class="sub">Somewhere there's a letter from your endocrinologist with your ratios. You never read it.</p>
         <p class="sub">Adults range from <b>1u : 6 g</b> to <b>1u : 15 g</b> of carbs — and ${this.c.name}'s number is in there somewhere.
         Find it the only way left: dose, watch the graph, adjust. Start cautious.</p>`
      : `<p class="sub">Everyone's insulin needs are different — these were tuned with your endocrinologist, and they're <b>yours</b>:</p>
         <div class="dose-box"><div class="math">
           Carb ratio &nbsp;·&nbsp; 1u covers <b>${s.icr} g</b> of carbs<br/>
           Correction &nbsp;·&nbsp; 1u lowers ~<b>${fmtBG(s.isf, this.mmol)} ${bgUnit(this.mmol)}</b><br/>
           Target &nbsp;·&nbsp; <b>${fmtBG(s.target, this.mmol)}</b>
         </div></div>
         <p class="sub" style="margin-top:12px">They're starting points, not physics: your body is more resistant in the morning,
         more sensitive after exercise and late at night. The same dose lands differently at 8 a.m. and 8 p.m.</p>`;
    const m = this.modal(`
      <h3>${this.c.name}'s numbers</h3>
      ${body}
      <div class="modal-actions"><button class="btn btn-primary" data-x="ok">Start the day</button></div>`);
    m.el.querySelector('[data-x="ok"]').onclick = () => m.close();
  }

  // ============ persistence ============
  save() {
    const s = this.sim;
    const data = {
      c: this.c, energy: this.energy, dayIdx: this.dayIdx, dayStats: this.dayStats,
      guessErrors: this.guessErrors, severeLows: this.severeLows, nightWakes: this.nightWakes,
      sim: {
        t: s.t, bg: s.bg, carbs: s.carbs, boluses: s.boluses, basalOn: s.basalOn,
        sensUntil: s.sensUntil, sensMult: s.sensMult, stress: s.stress, fatStore: s.fatStore,
        history: s.history.slice(-600), cgmLag: s.cgmLag, events: s.events.slice(-120),
        minutesTotal: s.minutesTotal, minutesLow: s.minutesLow, minutesHigh: s.minutesHigh,
        bgSum: s.bgSum, lowEpisodes: s.lowEpisodes,
      },
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  _restore(d) {
    Object.assign(this, {
      energy: d.energy, dayIdx: d.dayIdx, dayStats: d.dayStats || [],
      guessErrors: d.guessErrors || [], severeLows: d.severeLows || 0, nightWakes: d.nightWakes || 0,
    });
    Object.assign(this.sim, d.sim);
  }
  static loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  }
  static clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  // ============ day schedule ============
  buildDay() {
    const base = this.dayIdx * 1440;
    const weekend = (this.dayIdx % 7) >= 5;
    const S = [];
    const add = (min, fn) => S.push({ t: base + min, fn, done: false });

    if (!weekend) {
      add(450, () => this.mealEvent("breakfast", "kitchen", "Breakfast before work."));
      add(525, () => { this.setScene("commute", true); this.caption("Walking to the train nudges glucose down a touch."); });
      add(555, () => { this.setScene("office"); this.caption(this.profDesk() + "."); });
      add(620, () => this.maybeStressEvent());
      add(745, () => this.mealEvent("lunch", "restaurant", "Lunch — the daily carb-counting exam."));
      add(840, () => { this.setScene("office"); });
      add(905, () => this.maybeCakeEvent());
      add(960, () => this.mealEvent("snack", "office", "Mid-afternoon slump.", true));
      add(1035, () => this.exerciseEvent());
      add(1155, () => this.mealEvent("dinner", "kitchen", "Dinner. Fat slows carbs down."));
      add(1330, () => this.bedtimeEvent());
    } else {
      add(560, () => this.mealEvent("breakfast", "kitchen", "Brunch — sleeping in felt good, but dawn hormones didn't sleep."));
      add(720, () => { this.setScene("commute", true); this.caption("Errands and a long walk."); });
      add(790, () => this.mealEvent("lunch", "restaurant", "Lunch out — no nutrition labels here."));
      add(905, () => this.maybeCakeEvent(true));
      add(990, () => this.exerciseEvent());
      add(1170, () => this.mealEvent("dinner", "restaurant", "Dinner out. Restaurant portions run large."));
      add(1340, () => this.bedtimeEvent());
    }

    if (this.c.therapy === "pump" && Math.random() < (weekend ? 0.15 : 0.3) * this.diff.adverse) {
      const failAt = 600 + Math.floor(Math.random() * 500);
      add(failAt, () => this.startSiteFail());
    }
    if (this.c.therapy === "pens" && Math.random() < 0.18 * this.diff.adverse) {
      add(460, () => this.missedBasalEvent());
    }

    this.schedule = S.sort((a, b) => a.t - b.t);
  }

  profDesk() { return (PROFESSIONS.find(p => p.id === this.c.profession) || PROFESSIONS[0]).desk; }

  // ============ main loop ============
  start() {
    this._lastFrame = performance.now();
    const loop = now => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.25, (now - this._lastFrame) / 1000);
      this._lastFrame = now;
      if (!this.paused && !this.modalOpen) {
        const spd = this.sleeping ? 42 : (this.fast ? 12 : this.speed);
        this._acc += dt * spd;
        let guard = 80;
        while (this._acc >= 1 && guard-- > 0) {
          this._acc -= 1;
          this.sim.tick();
          this.afterMinute();
        }
      }
      this.render();
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { cancelAnimationFrame(this._raf); }

  afterMinute() {
    const s = this.sim;
    for (const item of this.schedule) {
      if (!item.done && s.t >= item.t) { item.done = true; item.fn(); if (this.modalOpen) break; }
    }
    if (s.bg < 70) this.energy = Math.max(0, this.energy - 0.06);
    else if (s.bg > 250) this.energy = Math.max(0, this.energy - 0.04);
    else if (s.bg > 180) this.energy = Math.max(0, this.energy - 0.015);

    if (s.bg < 45 && s.t > this._sevCooldown) {
      this._sevCooldown = s.t + 120;
      this.severeLows++;
      this.severeLowEvent();
    }
    if (!s.basalOn && s.t - this._siteFailToastT > 90 && s.bg > 200) {
      this._siteFailToastT = s.t;
      this.toast("Climbing no matter what. When insulin \"isn't working\", suspect the delivery first.", "bad", 8000, "SOMETHING'S OFF");
    }
    if (this.sleeping) {
      if (s.cgmNow() < 70) this.nightAlarm();
      else if (s.cgmNow() > 260 && Math.random() < 0.004) this.nightAlarm(true);
      const minOfDay = s.t % 1440;
      if (minOfDay === 420) this.wakeUp();
    }
    if (!this.sleeping && s.t % 311 === 0) this.dropFact();
  }

  // ============ rendering ============
  render() {
    const s = this.sim;
    const minOfDay = s.t % 1440;
    $("hud-clock").textContent = `${String(Math.floor(minOfDay / 60)).padStart(2, "0")}:${String(minOfDay % 60).padStart(2, "0")}`;
    $("hud-day").textContent = `${DAY_NAMES[this.dayIdx % 7]} · DAY ${this.dayIdx + 1}/${this.totalDays}`;
    const cgm = s.cgmNow();
    $("cgm-value").textContent = fmtBG(cgm, this.mmol);
    $("cgm-arrow").textContent = s.trendArrow();
    $("cgm-unit").textContent = bgUnit(this.mmol);
    $("cgm-pill").className = "cgm-pill " + (cgm < 70 ? "low" : cgm > 180 ? "high" : "in-range");
    $("bar-energy").style.width = `${this.energy}%`;
    $("hud-iob").textContent = `${s.iob().toFixed(1)}u`;

    const banner = $("alert-banner");
    if (cgm < 55) this.showBanner(banner, `URGENT LOW · ${fmtBG(cgm, this.mmol)} — treat now`, "");
    else if (cgm < 70) this.showBanner(banner, `LOW · ${fmtBG(cgm, this.mmol)} — fast sugar`, "");
    else if (cgm > 260) this.showBanner(banner, `HIGH · ${fmtBG(cgm, this.mmol)} — correction & water`, "warn");
    else { banner.classList.add("hidden"); this._bannerKey = ""; }

    const overlay = $("symptom-overlay");
    overlay.className = "symptom-overlay" + (s.bg < 70 ? " hypo" : s.bg > 250 ? " hyper" : "");
    const mood = s.bg < 70 ? "low" : s.bg > 250 ? "high" : "ok";
    if (mood !== this._mood) {
      this._mood = mood;
      const chip = $("symptom-chip");
      const sym = symptomText(s.bg);
      chip.classList.toggle("hidden", !sym);
      chip.classList.toggle("hyper", mood === "high");
      if (sym) chip.textContent = sym;
    }

    drawMini($("cgm-mini"), s);
    if (this.view === "body") this.bodyView.draw(s, this.mmol);
    if (this.view === "trends" && performance.now() - this._trendTick > 700) {
      this._trendTick = performance.now();
      drawTrends($("trend-canvas"), s, this.mmol);
      this.renderTrendStats();
    }
  }

  showBanner(banner, text, cls) {
    const key = text.slice(0, 12) + cls;
    banner.classList.remove("hidden");
    banner.className = "alert-banner " + cls;
    banner.textContent = text;
    if (this._bannerKey !== key) {
      this._bannerKey = key;
      if (cls === "warn") { beep(520, 0.15, 2); } else { beep(980, 0.2, 3); buzz([180, 90, 180]); }
    }
  }

  renderTrendStats() {
    const s = this.sim, tir = s.tir();
    const sens = s.sensitivityInfo();
    const sensPct = Math.round(sens.total * 100);
    const why = sens.exercise > 1.05 ? "post-exercise" : sens.stress < 0.95 ? "stress" : sens.circadian < 0.95 ? "morning hormones" : sens.circadian > 1.05 ? "evening rhythm" : sens.sleep < 1 ? "broken sleep" : "baseline";
    $("trend-stats").innerHTML = `
      <div class="tile"><div class="k">IN RANGE</div><div class="v" style="color:var(--range)">${tir.inRange.toFixed(0)}%</div></div>
      <div class="tile"><div class="k">AVERAGE</div><div class="v">${fmtBG(s.meanBG(), this.mmol)}<small> ${bgUnit(this.mmol)}</small></div></div>
      <div class="tile"><div class="k">EST. HbA1c</div><div class="v">${s.gmi().toFixed(1)}%</div></div>
      <div class="tile"><div class="k">LOWS</div><div class="v" style="color:var(--low)">${s.lowEpisodes}</div></div>
      <div class="tile"><div class="k">INSULIN OB</div><div class="v" style="color:var(--insulin)">${s.iob().toFixed(1)}u</div></div>
      <div class="tile"><div class="k">CARBS OB</div><div class="v" style="color:var(--glucose)">${s.cob().toFixed(0)}g</div></div>
      <div class="tile"><div class="k">INSULIN SENSITIVITY</div><div class="v" style="color:${sensPct < 95 ? "var(--high)" : sensPct > 105 ? "var(--insulin)" : "var(--text)"}">${sensPct}%<small> · ${why}</small></div></div>`;
  }

  // ============ UI helpers ============
  _bindUI() {
    this.view = "world";
    document.querySelectorAll(".vtab").forEach(b => b.onclick = () => {
      document.querySelectorAll(".vtab").forEach(x => x.classList.toggle("active", x === b));
      this.view = b.dataset.view;
      document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + this.view));
      if (this.view === "trends") { drawTrends($("trend-canvas"), this.sim, this.mmol); this.renderTrendStats(); }
      if (this.view === "body" && !localStorage.getItem("lir-body-intro")) {
        $("body-intro").classList.remove("hidden");
        $("body-intro-ok").onclick = () => {
          $("body-intro").classList.add("hidden");
          try { localStorage.setItem("lir-body-intro", "1"); } catch (e) {}
        };
      }
    });
    $("cgm-pill").onclick = () => document.querySelector('.vtab[data-view="trends"]').click();
    $("btn-pause").onclick = () => { this.paused = !this.paused; $("btn-pause").classList.toggle("on", this.paused); };
    $("btn-speed").onclick = () => { this.fast = !this.fast; $("btn-speed").classList.toggle("on", this.fast); };
    $("btn-menu").onclick = () => this.menuModal();
    this.renderActionBar();
    $("scene-avatar").innerHTML = avatarSVG(this.c);
  }

  renderActionBar() {
    const bar = $("action-bar");
    bar.innerHTML = "";
    const mk = (label, ic, fn) => {
      const b = document.createElement("button");
      b.className = "abtn";
      b.innerHTML = icon(ic) + `<span>${label}</span>`;
      b.onclick = fn;
      bar.appendChild(b);
      return b;
    };
    mk("Treat low", "juice", () => this.treatModal());
    mk("Correct", "syringe", () => this.bolusModal(0, null, "Correction"));
    mk("Snack", "snack", () => this.mealEvent("snack", this.scene, "An unscheduled snack still needs counting.", true));
    if (this.c.therapy === "pump") mk("Pump site", "pump", () => this.siteModal());
    mk("Water", "water", () => {
      this.sim.stress = Math.max(0, this.sim.stress - 0.3);
      this.toast("Water and five slow breaths. Hydration helps clear glucose; calm lowers stress hormones.", "good", 5000);
    });
  }

  setScene(id, walking = false) {
    this.scene = id;
    const label = renderScene($("scene-art"), id);
    $("scene-location").textContent = label;
    $("scene-avatar").classList.toggle("walking", walking);
    this.caption("");
  }
  caption(txt) { $("scene-caption").textContent = txt; }

  toast(msg, kind = "", ms = 6000, eyebrow = "") {
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.innerHTML = (eyebrow ? `<span class="tk">${eyebrow}</span>` : "") + msg;
    $("toast-zone").appendChild(t);
    setTimeout(() => { t.classList.add("fade"); setTimeout(() => t.remove(), 500); }, ms);
    while ($("toast-zone").children.length > 3) $("toast-zone").firstChild.remove();
  }

  dropFact() {
    const unused = FACTS.map((f, i) => i).filter(i => !this.factsShown.has(i));
    if (!unused.length) return;
    const i = unused[Math.floor(Math.random() * unused.length)];
    this.factsShown.add(i);
    this.toast(FACTS[i], "fact", 10000, "INSIGHT");
  }

  modal(html) {
    this.modalOpen = true;
    const bd = document.createElement("div");
    bd.className = "modal-backdrop";
    bd.innerHTML = `<div class="modal">${html}</div>`;
    $("modal-zone").appendChild(bd);
    return {
      el: bd.querySelector(".modal"),
      close: () => { bd.remove(); this.modalOpen = $("modal-zone").children.length > 0; },
    };
  }

  // ============ MEALS & DOSING ============
  mealEvent(category, sceneId, prompt, optional = false) {
    if (sceneId) this.setScene(sceneId);
    const foods = FOODS[category];
    const m = this.modal(`
      <h3>${category[0].toUpperCase() + category.slice(1)}</h3>
      <p class="sub">${prompt}</p>
      <div class="food-grid"></div>
      <div class="modal-actions">${optional ? `<button class="btn btn-quiet" data-x="skip">Skip</button>` : ""}</div>`);
    const grid = m.el.querySelector(".food-grid");
    for (const f of foods) {
      const card = document.createElement("button");
      card.className = "food-card";
      const known = f.labeled || this.diff.revealCarbs || this.diff.macros;
      const tag = this.diff.macros
        ? `${f.carbs}g C · ${f.fat || 0}g F · ${f.protein || 0}g P`
        : known ? `${f.carbs} g carbs` : "? g carbs";
      card.innerHTML = `${icon(f.icon || f.id, "ficon")}<span class="fname">${f.name}</span>
        <span class="carbtag ${known ? "" : "unknown"}">${tag}</span>
        <span class="fmeta">${f.desc}</span>`;
      card.onclick = () => { m.close(); this.portionStep(f, category); };
      grid.appendChild(card);
    }
    const skip = m.el.querySelector('[data-x="skip"]');
    if (skip) skip.onclick = () => { m.close(); };
  }

  portionStep(food, category) {
    if (food.carbs === 0) { this.toast("You skip it."); return; }
    let portion = PORTIONS[1];
    const isGuess = !food.labeled && !this.diff.revealCarbs && !this.diff.macros;
    let guess = isGuess ? Math.round(food.carbs * 0.7 / 5) * 5 : food.carbs;
    const m = this.modal(`
      <h3>${food.name}</h3>
      <p class="sub">${food.desc}</p>
      <div class="seg-row" id="portions"></div>
      <div id="guess-area"></div>
      <div class="modal-actions">
        <button class="btn btn-quiet" data-x="back">Back</button>
        <button class="btn btn-primary" data-x="next">Set the dose</button>
      </div>`);
    const portRow = m.el.querySelector("#portions");
    PORTIONS.forEach(p => {
      const b = document.createElement("button");
      b.className = "seg" + (p === portion ? " sel" : "");
      b.textContent = p.label;
      b.onclick = () => { portion = p; portRow.querySelectorAll(".seg").forEach(x => x.classList.toggle("sel", x === b)); refresh(); };
      portRow.appendChild(b);
    });
    const ga = m.el.querySelector("#guess-area");
    const refresh = () => {
      if (isGuess) {
        ga.innerHTML = `<p class="sub" style="margin:12px 0 2px">No label. <b>Estimate the carbs</b> — your dose follows your guess; your body gets the truth.</p>
          <div class="guess-row"><input type="range" min="5" max="140" step="5" value="${guess}"/><b>${guess} g</b></div>`;
        const slider = ga.querySelector("input");
        slider.oninput = () => { guess = +slider.value; ga.querySelector("b").textContent = guess + " g"; };
      } else {
        const total = Math.round(food.carbs * portion.mult);
        guess = total;
        const extra = this.diff.macros
          ? ` · ${Math.round((food.fat || 0) * portion.mult)} g fat · ${Math.round((food.protein || 0) * portion.mult)} g protein`
          : "";
        ga.innerHTML = `<p class="sub" style="margin:12px 0 2px">${food.labeled ? "Label" : "Nutrition"}: <b style="color:var(--glucose)">${total} g carbs</b>${extra} — this portion.</p>`;
      }
    };
    refresh();
    m.el.querySelector('[data-x="back"]').onclick = () => { m.close(); this.mealEvent(category, null, "Pick again."); };
    m.el.querySelector('[data-x="next"]').onclick = () => {
      m.close();
      const actual = Math.round(food.carbs * portion.mult);
      this.bolusModal(isGuess ? guess : actual, { food, portion, actual, guessed: isGuess ? guess : null }, "Meal bolus");
    };
  }

  bolusModal(carbGuess, meal, title) {
    const s = this.sim;
    const assist = this.diff.assist;
    const suggested = s.suggestBolus(carbGuess);
    let units = assist === "full" ? suggested : 0;
    let prebolus = false;
    const cgm = s.cgmNow();
    const corr = Math.max(0, (cgm - s.s.target) / s.s.isf);
    const sensPct = Math.round(s.sensitivity() * 100);
    const sensLine = sensPct < 94
      ? `<br/>Body right now &nbsp;·&nbsp; <b style="color:var(--high)">${sensPct}% sensitivity</b> — doses act weaker than your settings assume.`
      : sensPct > 106
      ? `<br/>Body right now &nbsp;·&nbsp; <b style="color:var(--insulin)">${sensPct}% sensitivity</b> — doses hit harder than your settings assume.`
      : "";
    const mathHTML =
      assist === "full" ? `
          ${meal ? `Food &nbsp;·&nbsp; ${carbGuess} g ÷ ${s.s.icr} = <b>${(carbGuess / s.s.icr).toFixed(1)}u</b><br/>` : ""}
          Correction &nbsp;·&nbsp; (${fmtBG(cgm, this.mmol)} − ${fmtBG(s.s.target, this.mmol)}) ÷ ${this.mmol ? (s.s.isf / 18).toFixed(1) : s.s.isf} = <b>${corr.toFixed(1)}u</b><br/>
          Already working &nbsp;·&nbsp; <b>−${s.iob().toFixed(1)}u</b><br/>
          Suggested &nbsp;·&nbsp; <b class="sug">${suggested.toFixed(1)}u</b> — you decide.${sensLine}`
      : assist === "ratios" ? `
          Your settings &nbsp;·&nbsp; 1u per <b>${s.s.icr} g</b> carbs &nbsp;·&nbsp; 1u lowers ~<b>${fmtBG(s.s.isf, this.mmol)}</b><br/>
          CGM <b>${fmtBG(cgm, this.mmol)}</b> · target ${fmtBG(s.s.target, this.mmol)} · IOB <b>${s.iob().toFixed(1)}u</b><br/>
          No suggestions at this level — the arithmetic is yours.${sensLine}`
      : `You are the pancreas. No suggestions, no formulas — your call.`;
    const m = this.modal(`
      <h3>${title}</h3>
      <p class="sub">${meal ? `Covering <b>${carbGuess} g</b> of carbs${meal.guessed != null ? " — your estimate" : ""}.` : "Insulin to bring a high back down."}</p>
      <div class="dose-box">
        <div class="math">${mathHTML}</div>
        <div class="stepper">
          <button data-x="minus">−</button>
          <div class="units"><span id="uval">${units.toFixed(1)}</span><small> units</small></div>
          <button data-x="plus">+</button>
        </div>
        ${meal ? `<div class="seg-row">
          <button class="seg sel" data-x="now">Dose & eat now</button>
          <button class="seg" data-x="pre">Pre-bolus · eat in 15 min</button>
        </div>
        <p class="hint">Insulin needs ~15 minutes to start working; food can hit in 10. Pre-bolusing gives insulin the head start.</p>` : ""}
        ${meal && meal.food.gi === "slow" ? `<div class="seg-row">
          <button class="seg sel" data-x="all">Whole dose now</button>
          <button class="seg" data-x="split">Split · half now, half in 75 min</button>
        </div>
        <p class="hint">Fatty meal: carbs absorb for 4–5 hours, but a bolus peaks in one. All upfront → low now, high later. ${this.c.therapy === "pump" ? "Pumps call the fix an extended bolus." : "With pens, a second small shot later."}</p>` : ""}
      </div>
      <div class="modal-actions">
        <button class="btn btn-quiet" data-x="cancel">${meal ? "Eat without insulin" : "Cancel"}</button>
        <button class="btn btn-primary" data-x="ok">Deliver</button>
      </div>`);
    const uval = m.el.querySelector("#uval");
    m.el.querySelector('[data-x="minus"]').onclick = () => { units = Math.max(0, units - 0.5); uval.textContent = units.toFixed(1); };
    m.el.querySelector('[data-x="plus"]').onclick = () => { units = Math.min(25, units + 0.5); uval.textContent = units.toFixed(1); };
    const segNow = m.el.querySelector('[data-x="now"]'), segPre = m.el.querySelector('[data-x="pre"]');
    if (segNow) {
      segNow.onclick = () => { prebolus = false; segNow.classList.add("sel"); segPre.classList.remove("sel"); };
      segPre.onclick = () => { prebolus = true; segPre.classList.add("sel"); segNow.classList.remove("sel"); };
    }
    let split = false;
    const segAll = m.el.querySelector('[data-x="all"]'), segSplit = m.el.querySelector('[data-x="split"]');
    if (segAll) {
      segAll.onclick = () => { split = false; segAll.classList.add("sel"); segSplit.classList.remove("sel"); };
      segSplit.onclick = () => { split = true; segSplit.classList.add("sel"); segAll.classList.remove("sel"); };
    }
    m.el.querySelector('[data-x="cancel"]').onclick = () => {
      m.close();
      if (meal) {
        this.applyMeal(meal, 0, false);
        this.toast("Eating with no insulin. Nothing else will move that glucose into cells — watch.", "bad", 7000);
      }
    };
    m.el.querySelector('[data-x="ok"]').onclick = () => {
      m.close();
      if (meal) this.applyMeal(meal, units, prebolus, split);
      else if (units > 0) { s.bolus(units, "corr"); this.toast(`${units.toFixed(1)}u delivered. It works over the next half hour — resist stacking more.`, "good", 6000); }
    };
  }

  applyMeal(meal, units, prebolus, split = false) {
    const s = this.sim;
    if (units > 0) {
      if (split) {
        s.bolus(Math.round(units * 0.5 * 2) / 2, meal.food.name);
        const later = Math.round(units * 0.5 * 2) / 2;
        this.schedule.push({ t: s.t + 75, done: false, fn: () => {
          s.bolus(later, "extended");
          this.toast(`Second half of the split: ${later.toFixed(1)}u, timed for the slow carbs still arriving.`, "good", 6000);
        }});
        this.schedule.sort((a, b) => a.t - b.t);
      } else s.bolus(units, meal.food.name);
    }
    const eatDelay = prebolus && units > 0 ? 15 : 0;
    const doEat = () => {
      s.eat(meal.actual, meal.food.gi, meal.food.name);
      if (meal.guessed != null) {
        const err = Math.abs(meal.guessed - meal.actual);
        this.guessErrors.push(err);
        const msg = err <= 8 ? `You guessed ${meal.guessed} g — it was <b>${meal.actual} g</b>. Sharp.`
          : err <= 20 ? `You guessed ${meal.guessed} g — actually <b>${meal.actual} g</b>. The difference will show on the graph.`
          : `You guessed ${meal.guessed} g — it was <b>${meal.actual} g</b>. ${meal.guessed < meal.actual ? "Expect a climb." : "Insulin may outpace the food."}`;
        this.toast(msg, err <= 8 ? "good" : err <= 20 ? "" : "bad", 8000, "CARB COUNT");
      }
      this.energy = Math.min(100, this.energy + 4);
    };
    if (eatDelay) {
      this.schedule.push({ t: s.t + eatDelay, done: false, fn: doEat });
      this.schedule.sort((a, b) => a.t - b.t);
    } else doEat();
  }

  // ============ treats, site, menu ============
  treatModal() {
    const m = this.modal(`
      <h3>Fast sugar</h3>
      <p class="sub">For lows: ~15 g fast carbs, then wait 15 minutes. No insulin for these.</p>
      <div class="food-grid"></div>
      <div class="modal-actions"><button class="btn btn-quiet" data-x="cancel">Cancel</button></div>`);
    const grid = m.el.querySelector(".food-grid");
    for (const f of FOODS.treat) {
      const card = document.createElement("button");
      card.className = "food-card";
      card.innerHTML = `${icon(f.id, "ficon")}<span class="fname">${f.name}</span><span class="carbtag">${f.carbs} g</span><span class="fmeta">${f.desc}</span>`;
      card.onclick = () => {
        m.close();
        this.sim.eat(f.carbs, "fast", f.name);
        this.toast(`${f.carbs} g in. Now the hard part: wait 15 minutes before re-treating.`, "good", 7000);
      };
      grid.appendChild(card);
    }
    m.el.querySelector('[data-x="cancel"]').onclick = () => m.close();
  }

  startSiteFail() {
    this.sim.basalOn = false;
    this._siteFailToastT = this.sim.t;
    this.toast("Slight itch where the pump site sits. Probably nothing.", "", 5000);
  }

  siteModal() {
    const ok = this.sim.basalOn;
    const m = this.modal(`
      <h3>Pump site</h3>
      <p class="sub">${ok
        ? "Tape's fine, no redness, cannula seated. All good."
        : "<b style='color:var(--low)'>The cannula is kinked.</b> Insulin has been silently failing to go in — that's why nothing was coming down."}</p>
      <div class="modal-actions">
        <button class="btn btn-quiet" data-x="cancel">Close</button>
        <button class="btn btn-primary" data-x="change">Change the site</button>
      </div>`);
    m.el.querySelector('[data-x="cancel"]').onclick = () => m.close();
    m.el.querySelector('[data-x="change"]').onclick = () => {
      m.close();
      this.sim.basalOn = true;
      this.toast(ok ? "Fresh site placed. Peace of mind counts too." : "New site in — insulin flows again. The climb that happened will need a correction.", "good", 7000);
    };
  }

  missedBasalEvent() {
    this.sim.basalOn = false;
    const m = this.modal(`
      <h3>Did you take your long-acting last night?</h3>
      <p class="sub">You can't remember injecting the basal. Without it there's no background coverage — glucose will climb all day.</p>
      <div class="choice-list">
        <button class="choice-btn"><span class="ct">Take it now</span><span class="cd">Better late than never.</span></button>
        <button class="choice-btn"><span class="ct">"I'm sure I took it"</span><span class="cd">Gamble. The CGM will reveal the truth.</span></button>
      </div>`);
    const [b1, b2] = m.el.querySelectorAll(".choice-btn");
    b1.onclick = () => { m.close(); this.sim.basalOn = true; this.toast("Basal injected. Forgetting is human — people use alarms, apps, cap counters.", "good", 6000); };
    b2.onclick = () => { m.close(); };
  }

  maybeStressEvent() {
    if (Math.random() < 0.55 * this.diff.stress) {
      this.sim.addStress(0.65);
      const flavors = {
        engineer: "Production incident. The dashboard is red and everyone's in the war room.",
        teacher: "Surprise observation by the principal — during your rowdiest class.",
        nurse: "Two admissions at once and a code on the next ward.",
        chef: "A food critic just sat down at table 9.",
        architect: "The client moved the deadline up a week.",
      };
      this.toast(`${flavors[this.c.profession] || flavors.engineer}<br/>Adrenaline tells the liver to release glucose. <b>Stress is carbs you never ate.</b>`, "bad", 9000, "WORK");
    }
  }

  maybeCakeEvent(weekend = false) {
    if (Math.random() < 0.5) {
      const m = this.modal(`
        <h3>${weekend ? "Dessert is on the house" : "Cake in the break room"}</h3>
        <p class="sub">${weekend ? "The waiter brings chocolate cake, smiling." : "It's someone's birthday. \"One slice won't hurt, right?\""}</p>
        <div class="choice-list">
          <button class="choice-btn"><span class="ct">Have it — and dose for it</span><span class="cd">~50 g fast carbs. Cake is allowed; it just costs a calculation.</span></button>
          <button class="choice-btn"><span class="ct">Have it, skip the bolus</span><span class="cd">"I'll deal with it later." Famous last words.</span></button>
          <button class="choice-btn"><span class="ct">Pass</span><span class="cd">Also fine. You wanted it, though.</span></button>
        </div>`);
      const [b1, b2, b3] = m.el.querySelectorAll(".choice-btn");
      const cake = { food: { id: "cake", name: "Birthday cake", gi: "fast" }, portion: PORTIONS[1], actual: 52, guessed: null };
      b1.onclick = () => { m.close(); this.bolusModal(50, cake, "Cake bolus"); };
      b2.onclick = () => { m.close(); this.applyMeal(cake, 0, false); this.toast("Cake, no insulin. The spike is now scheduled.", "bad", 6000); };
      b3.onclick = () => { m.close(); };
    }
  }

  exerciseEvent() {
    const m = this.modal(`
      <h3>Evening</h3>
      <p class="sub">Movement is medicine for insulin sensitivity — and a live hazard for lows. CGM <b>${fmtBG(this.sim.cgmNow(), this.mmol)}</b> · IOB ${this.sim.iob().toFixed(1)}u.</p>
      <div class="choice-list"></div>`);
    const list = m.el.querySelector(".choice-list");
    for (const ex of EXERCISES) {
      const b = document.createElement("button");
      b.className = "choice-btn";
      b.innerHTML = `<span class="ct">${ex.label}</span><span class="cd">${ex.desc}</span>`;
      b.onclick = () => {
        m.close();
        if (ex.duration > 0) {
          this.setScene(ex.id === "walk" ? "commute" : "gym", true);
          this.sim.startExercise(ex);
          if (this.sim.cgmNow() < 120 && this.sim.iob() > 0.8) {
            this.toast("Exercise + insulin on board + BG near range: the classic recipe for a workout low. Many would eat ~15 g uncovered first.", "fact", 9000, "HEADS UP");
          }
        } else {
          this.setScene("kitchen");
        }
        this.energy = Math.min(100, this.energy + ex.energy);
      };
      list.appendChild(b);
    }
  }

  severeLowEvent() {
    beep(980, 0.25, 4); buzz([300, 100, 300, 100, 300]);
    const m = this.modal(`
      <h3 style="color:var(--low)">Severe low</h3>
      <p class="sub">The shaking turned to fog. Words stopped making sense mid-sentence.
      ${this.scene === "office" ? "A colleague noticed you'd gone pale and grabbed the juice from your drawer." : "You fumble for the juice you always keep within reach."}
      Sugar in. Sit down. Wait for the world to reassemble.</p>
      <div class="modal-actions"><button class="btn btn-primary" data-x="ok">Recover slowly</button></div>`);
    m.el.querySelector('[data-x="ok"]').onclick = () => {
      m.close();
      this.sim.eat(32, "fast", "Emergency sugar");
      this.energy = Math.max(5, this.energy - 22);
      this.toast("Lows like that leave you wrung out for hours — and a little afraid of the next one.", "bad", 9000);
    };
  }

  bedtimeEvent() {
    this.setScene("bedroom");
    const s = this.sim;
    const cgm = s.cgmNow();
    const advice = cgm < 100 ? "A little low for sleeping — a small snack buys a safer night."
      : cgm > 200 ? "High before bed. A careful correction beats eight hours of damage — but overcorrect and 3 a.m. is a low instead."
      : `A decent number to sleep on. ${s.iob().toFixed(1)}u still working, though.`;
    const m = this.modal(`
      <h3>Bedtime check</h3>
      <p class="sub">The decision every night ends with. CGM <b>${fmtBG(cgm, this.mmol)} ${s.trendArrow()}</b>. ${advice}</p>
      <div class="choice-list">
        <button class="choice-btn" data-x="sleep"><span class="ct">Lights out</span><span class="cd">Trust the number and the alarms.</span></button>
        <button class="choice-btn" data-x="snack"><span class="ct">Small bedtime snack · 12 g slow</span><span class="cd">A margin against overnight lows.</span></button>
        <button class="choice-btn" data-x="corr"><span class="ct">Correction first</span><span class="cd">Bring a high down before sleeping on it.</span></button>
      </div>`);
    m.el.querySelector('[data-x="sleep"]').onclick = () => { m.close(); this.goToSleep(); };
    m.el.querySelector('[data-x="snack"]').onclick = () => { m.close(); s.eat(12, "slow", "Bedtime snack"); this.goToSleep(); };
    m.el.querySelector('[data-x="corr"]').onclick = () => { m.close(); this.bolusModal(0, null, "Bedtime correction"); this._afterModalSleep(); };
  }
  _afterModalSleep() {
    const wait = () => { if (this.modalOpen) return setTimeout(wait, 300); this.goToSleep(); };
    setTimeout(wait, 300);
  }

  goToSleep() {
    this.sleeping = true;
    this.setScene("night");
    this.caption("Asleep. The CGM keeps watch.");
  }

  nightAlarm(high = false) {
    if (this.modalOpen || this.sim.t < (this._alarmCd || 0)) return;
    this._alarmCd = this.sim.t + 45;
    this.nightWakes++;
    this._wokeTonight = true;
    this.energy = Math.max(0, this.energy - 10);
    beep(high ? 540 : 1040, 0.22, 4); buzz([400, 150, 400]);
    const s = this.sim;
    const minOfDay = s.t % 1440;
    const hh = String(Math.floor(minOfDay / 60)).padStart(2, "0"), mm = String(minOfDay % 60).padStart(2, "0");
    const m = this.modal(`
      <h3>${hh}:${mm} — CGM alarm</h3>
      <p class="sub">The phone is screaming on the nightstand. You surface, heart pounding, and squint at it:
      <b style="color:${high ? "var(--high)" : "var(--low)"}">${fmtBG(s.cgmNow(), this.mmol)} ${s.trendArrow()}</b></p>
      <div class="choice-list">
        ${high
          ? `<button class="choice-btn" data-x="corr"><span class="ct">Groggy correction</span><span class="cd">Math at 3 a.m. Be conservative.</span></button>`
          : `<button class="choice-btn" data-x="treat"><span class="ct">Juice from the nightstand</span><span class="cd">Every T1D bedroom has one in arm's reach.</span></button>`}
        <button class="choice-btn" data-x="ignore"><span class="ct">Roll over</span><span class="cd">${high ? "It can wait until morning. Probably." : "Lows don't fix themselves with insulin on board."}</span></button>
      </div>`);
    const t = m.el.querySelector('[data-x="treat"]');
    if (t) t.onclick = () => { m.close(); s.eat(18, "fast", "3am juice"); this.toast("Sugar in, eyes already closing. You'll feel this broken sleep tomorrow.", "", 7000); };
    const c = m.el.querySelector('[data-x="corr"]');
    if (c) c.onclick = () => { m.close(); this.bolusModal(0, null, "Night correction"); };
    m.el.querySelector('[data-x="ignore"]').onclick = () => {
      m.close();
      this.toast(high ? "The high will grind on for hours." : "The CGM will be back. Louder.", "bad", 6000);
    };
  }

  wakeUp() {
    this.sleeping = false;
    this.dayIdx++;
    const s = this.sim;
    this.energy = Math.min(100, this.energy + 42);
    // a broken night blunts insulin sensitivity the next day
    s.sleepFactor = this._wokeTonight ? 0.92 : 1;
    this._wokeTonight = false;
    this.dayStats.push({
      minutesTotal: s.minutesTotal, minutesLow: s.minutesLow, minutesHigh: s.minutesHigh,
      bgSum: s.bgSum, lowEpisodes: s.lowEpisodes,
    });
    if (this.dayIdx >= this.totalDays) {
      this.stop();
      Game.clearSave();
      this.onFinish(this);
      return;
    }
    this.buildDay();
    this.save();
    this.onDaySummary(this);
  }

  resumeAfterSummary() {
    this.setScene("kitchen");
    this.caption("Dawn hormones have been at work since 4 a.m. Check the number first.");
    if (this.dayIdx === 1) {
      this.toast("Mornings run insulin-resistant — hormones blunt every unit. The same breakfast dose does less now than it would tonight.", "fact", 9000, "SENSITIVITY");
    } else if (this.sim.sleepFactor < 1) {
      this.toast("Last night's broken sleep lowered today's insulin sensitivity. Expect doses to act a little weaker.", "fact", 8000, "SENSITIVITY");
    }
  }

  menuModal() {
    const m = this.modal(`
      <h3>Menu</h3>
      <div class="menu-list">
        <button class="btn" data-x="units">Units · ${bgUnit(this.mmol)}</button>
        <button class="btn" data-x="save">Save</button>
        <button class="btn" data-x="quit">Save & quit to title</button>
        <button class="btn btn-quiet" data-x="close">Close</button>
      </div>`);
    m.el.querySelector('[data-x="units"]').onclick = () => { this.mmol = !this.mmol; this.c.mmol = this.mmol; m.close(); };
    m.el.querySelector('[data-x="save"]').onclick = () => { this.save(); m.close(); this.toast("Saved.", "good", 3000); };
    m.el.querySelector('[data-x="quit"]').onclick = () => { this.save(); this.stop(); location.reload(); };
    m.el.querySelector('[data-x="close"]').onclick = () => m.close();
  }
}
