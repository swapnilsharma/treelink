// ============================================================
// GlucoQuest — game orchestration: day schedule, decisions,
// alarms, scoring, save/load, HUD.
// ============================================================
import { Sim, fmtBG, bgUnit } from "./engine.js";
import { FOODS, PORTIONS, EXERCISES, FACTS, PROFESSIONS, symptomText } from "./data.js";
import { avatarSVG, renderScene } from "./avatar.js";
import { drawMini, drawTrends } from "./graph.js";
import { BodyView } from "./body.js";

const $ = id => document.getElementById(id);
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SAVE_KEY = "glucoquest-save-v1";

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
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
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
    this.sim = new Sim({ isf: 45, icr: 10, target: 110 });
    this.speed = 4;             // sim minutes per real second
    this.fast = false;
    this.paused = false;
    this.modalOpen = false;
    this.sleeping = false;
    this.energy = 88;
    this.dayIdx = 0;            // 0-based
    this.dayStats = [];         // snapshots at each day end
    this.guessErrors = [];      // |guess - actual| per unlabeled meal
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
    this.toast(`Good morning, ${this.c.name}. A new week starts now — your CGM is on your arm, ${this.c.therapy === "pump" ? "your pump is clipped on" : "your pens are in your bag"}.`, "good", 7000);
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
      add(450, () => this.mealEvent("breakfast", "kitchen", "Breakfast before work. What's it going to be?"));
      add(525, () => { this.setScene("commute", true); this.caption("Heading to work. Walking to the train nudges glucose down a touch."); });
      add(555, () => { this.setScene("office"); this.caption(`${this.profLabel()} mode: ${this.profDesk()}.`); });
      add(620, () => this.maybeStressEvent());
      add(745, () => this.mealEvent("lunch", "restaurant", "Lunch break — and the daily carb-guessing exam."));
      add(840, () => { this.setScene("office"); });
      add(905, () => this.maybeCakeEvent());
      add(960, () => this.mealEvent("snack", "office", "Mid-afternoon slump. Snack?", true));
      add(1035, () => this.exerciseEvent());
      add(1155, () => this.mealEvent("dinner", "kitchen", "Dinner time. Remember: fat slows carbs down."));
      add(1330, () => this.bedtimeEvent());
    } else {
      add(560, () => this.mealEvent("breakfast", "kitchen", `${DAY_NAMES[this.dayIdx % 7]} brunch — sleeping in felt good, but dawn hormones didn't sleep.`));
      add(720, () => { this.setScene("commute", true); this.caption("Errands and a long walk around town."); });
      add(790, () => this.mealEvent("lunch", "restaurant", "Lunch out with friends — no nutrition labels here."));
      add(905, () => this.maybeCakeEvent(true));
      add(990, () => this.exerciseEvent());
      add(1170, () => this.mealEvent("dinner", "restaurant", "Dinner out. Restaurant portions run large…"));
      add(1340, () => this.bedtimeEvent());
    }

    // pump site failure: random weekday afternoons, pump users, ~2 times a week
    if (this.c.therapy === "pump" && Math.random() < (weekend ? 0.15 : 0.3)) {
      const failAt = 600 + Math.floor(Math.random() * 500);
      add(failAt, () => this.startSiteFail());
    }
    // pens: occasionally realize the long-acting shot was forgotten
    if (this.c.therapy === "pens" && Math.random() < 0.18) {
      add(460, () => this.missedBasalEvent());
    }

    this.schedule = S.sort((a, b) => a.t - b.t);
  }

  profLabel() { return (PROFESSIONS.find(p => p.id === this.c.profession) || PROFESSIONS[0]).label.replace(/^\S+\s/, ""); }
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
    // fire schedule
    for (const item of this.schedule) {
      if (!item.done && s.t >= item.t) { item.done = true; item.fn(); if (this.modalOpen) break; }
    }
    // energy drain from being out of range
    if (s.bg < 70) this.energy = Math.max(0, this.energy - 0.06);
    else if (s.bg > 250) this.energy = Math.max(0, this.energy - 0.04);
    else if (s.bg > 180) this.energy = Math.max(0, this.energy - 0.015);

    // severe low forced rescue
    if (s.bg < 45 && s.t > this._sevCooldown) {
      this._sevCooldown = s.t + 120;
      this.severeLows++;
      this.severeLowEvent();
    }
    // site failure hinting
    if (!s.basalOn && s.t - this._siteFailToastT > 90 && s.bg > 200) {
      this._siteFailToastT = s.t;
      this.toast("BG keeps climbing no matter what… when insulin 'isn't working', the first suspect is the delivery: check the site / did the basal happen?", "bad", 9000);
    }
    // sleeping: night alarms + morning wake
    if (this.sleeping) {
      if (s.cgmNow() < 70) this.nightAlarm();
      else if (s.cgmNow() > 260 && Math.random() < 0.004) this.nightAlarm(true);
      const minOfDay = s.t % 1440;
      if (minOfDay === 420) this.wakeUp();
    }
    // periodic ambient fact (not while asleep)
    if (!this.sleeping && s.t % 197 === 0) this.dropFact();
  }

  // ============ rendering ============
  render() {
    const s = this.sim;
    const minOfDay = s.t % 1440;
    $("hud-clock").textContent = `${String(Math.floor(minOfDay / 60)).padStart(2, "0")}:${String(minOfDay % 60).padStart(2, "0")}`;
    $("hud-day").textContent = `${DAY_NAMES[this.dayIdx % 7]} · Day ${this.dayIdx + 1}/${this.totalDays}`;
    const cgm = s.cgmNow();
    $("cgm-value").textContent = fmtBG(cgm, this.mmol);
    $("cgm-arrow").textContent = s.trendArrow();
    $("cgm-unit").textContent = bgUnit(this.mmol);
    const pill = $("cgm-pill");
    pill.className = "cgm-pill " + (cgm < 70 ? "low" : cgm > 180 ? "high" : "in-range");
    $("bar-energy").style.width = `${this.energy}%`;
    $("hud-iob").textContent = `${s.iob().toFixed(1)}u`;

    // alert banner
    const banner = $("alert-banner");
    if (cgm < 55) { this.showBanner(banner, `⚠ URGENT LOW — ${fmtBG(cgm, this.mmol)} ${bgUnit(this.mmol)} — TREAT NOW`, ""); }
    else if (cgm < 70) { this.showBanner(banner, `🔻 LOW — ${fmtBG(cgm, this.mmol)} — fast sugar needed`, ""); }
    else if (cgm > 260) { this.showBanner(banner, `🔺 HIGH — ${fmtBG(cgm, this.mmol)} — correction & water`, "warn"); }
    else { banner.classList.add("hidden"); this._bannerKey = ""; }

    // symptom overlay & avatar mood
    const overlay = $("symptom-overlay");
    overlay.className = "symptom-overlay" + (s.bg < 70 ? " hypo" : s.bg > 250 ? " hyper" : "");
    const mood = s.bg < 70 ? "low" : s.bg > 250 ? "high" : "ok";
    if (mood !== this._mood) {
      this._mood = mood;
      $("scene-avatar").innerHTML = avatarSVG(this.c, { mood });
      const sym = symptomText(s.bg);
      if (sym) this.caption(sym);
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
    const key = text.slice(0, 14) + cls;
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
    $("trend-stats").innerHTML = `
      <div class="tile"><div class="k">TIME IN RANGE</div><div class="v" style="color:#4ade80">${tir.inRange.toFixed(0)}%</div></div>
      <div class="tile"><div class="k">AVG GLUCOSE</div><div class="v">${fmtBG(s.meanBG(), this.mmol)}</div></div>
      <div class="tile"><div class="k">EST. HbA1c (GMI)</div><div class="v" style="color:#5eead4">${s.gmi().toFixed(1)}%</div></div>
      <div class="tile"><div class="k">LOWS</div><div class="v" style="color:#fb7185">${s.lowEpisodes}</div></div>
      <div class="tile"><div class="k">INSULIN ON BOARD</div><div class="v" style="color:#22d3ee">${s.iob().toFixed(1)}u</div></div>
      <div class="tile"><div class="k">CARBS ON BOARD</div><div class="v" style="color:#fb923c">${s.cob().toFixed(0)}g</div></div>`;
  }

  // ============ UI helpers ============
  _bindUI() {
    this.view = "world";
    document.querySelectorAll(".vtab").forEach(b => b.onclick = () => {
      document.querySelectorAll(".vtab").forEach(x => x.classList.toggle("active", x === b));
      this.view = b.dataset.view;
      document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + this.view));
      if (this.view === "trends") { drawTrends($("trend-canvas"), this.sim, this.mmol); this.renderTrendStats(); }
    });
    $("cgm-pill").onclick = () => document.querySelector('.vtab[data-view="trends"]').click();
    $("btn-pause").onclick = () => { this.paused = !this.paused; $("btn-pause").classList.toggle("on", this.paused); $("btn-pause").textContent = this.paused ? "▶" : "⏸"; };
    $("btn-speed").onclick = () => { this.fast = !this.fast; $("btn-speed").classList.toggle("on", this.fast); };
    $("btn-menu").onclick = () => this.menuModal();
    this.renderActionBar();
    $("scene-avatar").innerHTML = avatarSVG(this.c);
  }

  renderActionBar() {
    const bar = $("action-bar");
    bar.innerHTML = "";
    const mk = (label, fn, cls = "btn") => {
      const b = document.createElement("button");
      b.className = cls; b.textContent = label; b.onclick = fn; bar.appendChild(b); return b;
    };
    mk("🧃 Treat low", () => this.treatModal());
    mk("💉 Correction", () => this.bolusModal(0, null, "Correction bolus"));
    mk("🍎 Snack now", () => this.mealEvent("snack", this.scene, "An unscheduled snack — everything still needs counting.", true));
    if (this.c.therapy === "pump") mk("🔧 Pump site", () => this.siteModal());
    mk("💧 Water & breathe", () => {
      this.sim.stress = Math.max(0, this.sim.stress - 0.3);
      this.toast("You drink water and take five slow breaths. Hydration helps the kidneys clear glucose; calm lowers stress hormones.", "good");
    });
  }

  setScene(id, walking = false) {
    this.scene = id;
    const label = renderScene($("scene-art"), id);
    $("scene-avatar").classList.toggle("walking", walking);
    this.caption(label + ".");
  }
  caption(txt) { $("scene-caption").textContent = txt; }

  toast(msg, kind = "", ms = 6000) {
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.innerHTML = msg;
    $("toast-zone").appendChild(t);
    setTimeout(() => { t.classList.add("fade"); setTimeout(() => t.remove(), 500); }, ms);
    while ($("toast-zone").children.length > 3) $("toast-zone").firstChild.remove();
  }

  dropFact() {
    const unused = FACTS.map((f, i) => i).filter(i => !this.factsShown.has(i));
    if (!unused.length) return;
    const i = unused[Math.floor(Math.random() * unused.length)];
    this.factsShown.add(i);
    this.toast(`<b style="color:#fbbf24">DID YOU KNOW</b> · ${FACTS[i]}`, "fact", 11000);
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
      <h3>${category === "snack" ? "🍎 Snack" : "🍽 " + category[0].toUpperCase() + category.slice(1)}</h3>
      <p class="sub">${prompt} ${optional ? "" : "Pick a meal — then count the carbs and choose your dose."}</p>
      <div class="food-grid"></div>
      <div class="modal-actions">${optional ? `<button class="btn btn-ghost" data-x="skip">Skip</button>` : ""}</div>`);
    const grid = m.el.querySelector(".food-grid");
    for (const f of foods) {
      const card = document.createElement("button");
      card.className = "food-card";
      card.innerHTML = `<span class="emoji">${f.emoji}</span><span class="fname">${f.name}</span>
        <span class="carbtag ${f.labeled ? "" : "unknown"}">${f.labeled ? f.carbs + "g carbs" : "?? g carbs"}</span>
        <span class="fmeta">${f.desc}</span>`;
      card.onclick = () => { m.close(); this.portionStep(f, category); };
      grid.appendChild(card);
    }
    const skip = m.el.querySelector('[data-x="skip"]');
    if (skip) skip.onclick = () => { m.close(); this.caption("You skip it."); };
  }

  portionStep(food, category) {
    if (food.carbs === 0) { this.toast("You skip the snack."); return; }
    let portion = PORTIONS[1];
    let guess = food.labeled ? food.carbs : Math.round(food.carbs * 0.7 / 5) * 5; // start guesses low — people usually undercount
    const isGuess = !food.labeled;
    const m = this.modal(`
      <h3>${food.emoji} ${food.name}</h3>
      <p class="sub">${food.desc}</p>
      <div class="seg-row" id="portions"></div>
      <div id="guess-area"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-x="back">← Back</button>
        <button class="btn btn-primary" data-x="next">Count it → dose</button>
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
        ga.innerHTML = `<p class="sub" style="margin:10px 0 2px">No label here — <b>estimate the carbs</b> for this ${portion.label.toLowerCase()} portion. Your insulin dose will be based on your guess; your body gets the real number.</p>
          <div class="guess-row"><input type="range" min="5" max="140" step="5" value="${guess}"/><b>${guess} g</b></div>`;
        const slider = ga.querySelector("input");
        slider.oninput = () => { guess = +slider.value; ga.querySelector("b").textContent = guess + " g"; };
      } else {
        const total = Math.round(food.carbs * portion.mult);
        guess = total;
        ga.innerHTML = `<p class="sub" style="margin:10px 0 2px">Label says <b style="color:#fb923c">${total} g carbs</b> for this portion. Labeled food is the easy mode of carb counting.</p>`;
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
    const suggested = s.suggestBolus(carbGuess);
    let units = suggested;
    let prebolus = false;
    const cgm = s.cgmNow();
    const corr = Math.max(0, (cgm - s.s.target) / s.s.isf);
    const m = this.modal(`
      <h3>💉 ${title}</h3>
      <p class="sub">${meal ? `Covering <b>${carbGuess} g</b> of carbs${meal.guessed != null ? " (your estimate)" : ""}.` : "Insulin to bring a high back down."}</p>
      <div class="dose-box">
        <div class="math">
          ${meal ? `Food: ${carbGuess} g ÷ ${s.s.icr} (carb ratio) = <b>${(carbGuess / s.s.icr).toFixed(1)}u</b><br/>` : ""}
          Correction: (${fmtBG(cgm, this.mmol)} − ${fmtBG(s.s.target, this.mmol)}) ÷ ${this.mmol ? (s.s.isf / 18).toFixed(1) : s.s.isf} = <b>${corr.toFixed(1)}u</b><br/>
          Already working (IOB): <b>−${s.iob().toFixed(1)}u</b><br/>
          Suggested: <b style="color:#22d3ee">${suggested.toFixed(1)}u</b> — but you decide.
        </div>
        <div class="stepper">
          <button data-x="minus">−</button>
          <div class="units"><span id="uval">${units.toFixed(1)}</span><small> units</small></div>
          <button data-x="plus">+</button>
        </div>
        ${meal ? `<div class="seg-row">
          <button class="seg sel" data-x="now">Dose & eat now</button>
          <button class="seg" data-x="pre">Pre-bolus: dose, eat in 15 min</button>
        </div>
        <p class="hint">Insulin needs ~15 min to start working; food can hit in 10. A pre-bolus gives insulin the head start — if the food really is 15 minutes away.</p>` : ""}
        ${meal && meal.food.gi === "slow" ? `<div class="seg-row">
          <button class="seg sel" data-x="all">Whole dose now</button>
          <button class="seg" data-x="split">Split: half now, half in 75 min</button>
        </div>
        <p class="hint">⚠ Fatty meal: carbs will absorb for 4–5 hours, but a rapid bolus peaks in ~1. Dose it all upfront and insulin can win the early race (low now), then lose the late one (high later). ${this.c.therapy === "pump" ? "Pumps call the fix an extended bolus." : "With pens, that means a second small injection later."}</p>` : ""}
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-x="cancel">${meal ? "Eat without insulin" : "Cancel"}</button>
        <button class="btn btn-primary" data-x="ok">Confirm ${this.c.therapy === "pump" ? "bolus" : "injection"}</button>
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
        this.toast("Eating with no insulin at all — in T1D nothing else will move that glucose into cells. Watch what happens…", "bad", 8000);
      }
    };
    m.el.querySelector('[data-x="ok"]').onclick = () => {
      m.close();
      if (meal) this.applyMeal(meal, units, prebolus, split);
      else if (units > 0) { s.bolus(units, "corr"); this.toast(`${units.toFixed(1)}u correction delivered. It will take effect over the next half hour — resist 'rage bolusing' more on top.`, "good", 7000); }
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
          this.toast(`Second part of the split dose: ${later.toFixed(1)}u, timed to meet the slow carbs still arriving.`, "good", 7000);
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
        const msg = err <= 8 ? `Sharp carb counting: you guessed ${meal.guessed} g, it was <b>${meal.actual} g</b>.`
          : err <= 20 ? `You guessed ${meal.guessed} g — actually <b>${meal.actual} g</b>. Close-ish; the difference will show on the graph.`
          : `You guessed ${meal.guessed} g but it was <b>${meal.actual} g</b>. ${meal.guessed < meal.actual ? "Under-counted → expect a climb." : "Over-counted → insulin may outpace the food."}`;
        this.toast(msg, err <= 8 ? "good" : err <= 20 ? "" : "bad", 9000);
      }
      if (meal.food.gi === "slow") this.toast("High fat/protein meal: absorption will drag on for hours — the spike comes late, when the insulin is already fading.", "fact", 9000);
      this.energy = Math.min(100, this.energy + 4);
      this.caption(`You eat the ${meal.food.name.toLowerCase()}. Now glucose and insulin race.`);
    };
    if (eatDelay) {
      this.toast("Pre-bolus running — eating in 15 minutes. (If lunch got delayed right now, this would be a problem…)", "", 7000);
      this.schedule.push({ t: s.t + eatDelay, done: false, fn: doEat });
      this.schedule.sort((a, b) => a.t - b.t);
    } else doEat();
  }

  // ============ treats, site, menu ============
  treatModal() {
    const m = this.modal(`
      <h3>🧃 Fast sugar</h3>
      <p class="sub">For lows: ~15 g fast carbs, then wait 15 minutes. (No insulin for these — they're the antidote.)</p>
      <div class="food-grid"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-x="cancel">Cancel</button></div>`);
    const grid = m.el.querySelector(".food-grid");
    for (const f of FOODS.treat) {
      const card = document.createElement("button");
      card.className = "food-card";
      card.innerHTML = `<span class="emoji">${f.emoji}</span><span class="fname">${f.name}</span><span class="carbtag">${f.carbs}g</span><span class="fmeta">${f.desc}</span>`;
      card.onclick = () => {
        m.close();
        this.sim.eat(f.carbs, "fast", f.name);
        this.toast(`${f.carbs} g of fast sugar in. Now the hard part: wait ~15 min for it to land before re-treating.`, "good", 8000);
      };
      grid.appendChild(card);
    }
    m.el.querySelector('[data-x="cancel"]').onclick = () => m.close();
  }

  startSiteFail() {
    this.sim.basalOn = false;
    this._siteFailToastT = this.sim.t;
    // subtle at first — the player must notice the climb
    this.toast("Hm — slight itch where the pump site sits. Probably nothing.", "", 6000);
  }

  siteModal() {
    const ok = this.sim.basalOn;
    const m = this.modal(`
      <h3>🔧 Pump site</h3>
      <p class="sub">${ok
        ? "You check the infusion site: tape's fine, no redness, cannula looks seated. All good."
        : "<b style='color:#fb7185'>The cannula is kinked!</b> Insulin has been silently failing to go in. This is why the numbers wouldn't come down."}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-x="cancel">Close</button>
        <button class="btn btn-primary" data-x="change">Change the site (5 min)</button>
      </div>`);
    m.el.querySelector('[data-x="cancel"]').onclick = () => m.close();
    m.el.querySelector('[data-x="change"]').onclick = () => {
      m.close();
      this.sim.basalOn = true;
      this.toast(ok ? "Fresh site placed. (It wasn't strictly needed, but peace of mind counts.)" : "New site in — insulin is flowing again. A correction will likely be needed for the climb that happened.", "good", 8000);
    };
  }

  missedBasalEvent() {
    this.sim.basalOn = false;
    const m = this.modal(`
      <h3>😨 Wait — did you take your long-acting last night?</h3>
      <p class="sub">You can't remember injecting the basal insulin. Without it, there's no background coverage and BG will climb all day.</p>
      <div class="choice-list">
        <button class="choice-btn"><span class="ct">Take it now</span><span class="cd">Better late than never — coverage resumes.</span></button>
        <button class="choice-btn"><span class="ct">"I'm sure I took it…"</span><span class="cd">Gamble. If you didn't, today gets rough.</span></button>
      </div>`);
    const [b1, b2] = m.el.querySelectorAll(".choice-btn");
    b1.onclick = () => { m.close(); this.sim.basalOn = true; this.toast("Basal injected. People set alarms, use cap-counters, apps — forgetting is human.", "good", 7000); };
    b2.onclick = () => { m.close(); this.toast("You decide you took it. The CGM will reveal the truth over the next few hours…", "", 7000); };
  }

  maybeStressEvent() {
    if (Math.random() < 0.55) {
      this.sim.addStress(0.65);
      const flavors = {
        engineer: "Production incident. Everyone's in the war room and the dashboard is red.",
        teacher: "Surprise classroom observation by the principal — during your rowdiest class.",
        nurse: "Two admissions at once and a code on the next ward.",
        chef: "A food critic just sat down at table 9. The kitchen goes silent.",
        architect: "The client moved the deadline up by a week. The model isn't done.",
      };
      this.toast(`<b>${flavors[this.c.profession] || flavors.engineer}</b><br/>Your heart rate climbs — and adrenaline tells the liver to release glucose. Stress is carbs you never ate.`, "bad", 10000);
    }
  }

  maybeCakeEvent(weekend = false) {
    if (Math.random() < 0.5) {
      const m = this.modal(`
        <h3>🎂 ${weekend ? "Dessert is on the house!" : "It's someone's birthday!"}</h3>
        <p class="sub">${weekend ? "The waiter brings a slice of chocolate cake, smiling." : "Cake appears in the break room. Everyone's having some. \"One slice won't hurt, right?\""}</p>
        <div class="choice-list">
          <button class="choice-btn"><span class="ct">🍰 Have the cake — and dose for it</span><span class="cd">~50 g of fast carbs. People with T1D can eat cake; it just costs a calculation.</span></button>
          <button class="choice-btn"><span class="ct">🍰 Have the cake, skip the bolus</span><span class="cd">"I'll deal with it later." Famous last words.</span></button>
          <button class="choice-btn"><span class="ct">🙂 Politely pass</span><span class="cd">Also fine. (You wanted it though.)</span></button>
        </div>`);
      const [b1, b2, b3] = m.el.querySelectorAll(".choice-btn");
      const cake = { food: { name: "Birthday cake", gi: "fast", emoji: "🍰" }, portion: PORTIONS[1], actual: 52, guessed: null };
      b1.onclick = () => { m.close(); this.bolusModal(50, cake, "Cake bolus"); };
      b2.onclick = () => { m.close(); this.applyMeal(cake, 0, false); this.toast("Cake, no insulin. The spike is now scheduled.", "bad", 7000); };
      b3.onclick = () => { m.close(); this.toast("You pass on the cake. Willpower +1, but remember — with a dose, you could have had it.", "good", 7000); };
    }
  }

  exerciseEvent() {
    const m = this.modal(`
      <h3>🏃 Evening plans</h3>
      <p class="sub">Movement is medicine for insulin sensitivity — and a live hazard for lows. Current CGM: <b>${fmtBG(this.sim.cgmNow(), this.mmol)} ${bgUnit(this.mmol)}</b>, IOB ${this.sim.iob().toFixed(1)}u.</p>
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
            this.toast("Heads up: starting exercise with insulin on board and BG near range is the classic recipe for a workout low. Many would eat ~15 g uncovered first.", "fact", 10000);
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
      <h3 style="color:#fb7185">🚨 Severe low</h3>
      <p class="sub">The shaking turned to fog. Words stopped making sense mid-sentence. ${this.scene === "office" ? "A colleague noticed you'd gone pale and grabbed the juice from your desk drawer." : "You fumble for the juice you always keep within reach."}
      You get sugar in, sit on the floor, and wait for the world to reassemble. <b>This is the emergency every person with T1D plans around.</b></p>
      <div class="modal-actions"><button class="btn btn-primary" data-x="ok">Recover slowly…</button></div>`);
    m.el.querySelector('[data-x="ok"]').onclick = () => {
      m.close();
      this.sim.eat(32, "fast", "Emergency sugar");
      this.energy = Math.max(5, this.energy - 22);
      this.toast("Lows like that leave you wrung out for hours — and a little afraid of the next one. That fear is part of the condition too.", "bad", 10000);
    };
  }

  bedtimeEvent() {
    this.setScene("bedroom");
    const s = this.sim;
    const cgm = s.cgmNow();
    const advice = cgm < 100 ? "A little low for sleeping — many would eat a small snack so the night doesn't start with an alarm."
      : cgm > 200 ? "High before bed. A cautious correction now beats 8 hours of damage — but overcorrect and the 3 a.m. alarm is a low instead."
      : "Decent number to sleep on. IOB " + s.iob().toFixed(1) + "u still working, though.";
    const m = this.modal(`
      <h3>🌙 Bedtime check</h3>
      <p class="sub">Last decision of the day — the one you make every single night. CGM: <b>${fmtBG(cgm, this.mmol)} ${bgUnit(this.mmol)} ${s.trendArrow()}</b>. ${advice}</p>
      <div class="choice-list">
        <button class="choice-btn" data-x="sleep"><span class="ct">😴 Lights out</span><span class="cd">Trust the number and the CGM alarms.</span></button>
        <button class="choice-btn" data-x="snack"><span class="ct">🥜 Small bedtime snack (12 g, slow)</span><span class="cd">A safety margin against overnight lows.</span></button>
        <button class="choice-btn" data-x="corr"><span class="ct">💉 Correction first</span><span class="cd">Bring a high down before sleeping on it.</span></button>
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
    this.caption("Asleep. The CGM keeps watch — glucose doesn't sleep, and neither do the alarms.");
  }

  nightAlarm(high = false) {
    if (this.modalOpen || this.sim.t < (this._alarmCd || 0)) return;
    this._alarmCd = this.sim.t + 45;
    this.nightWakes++;
    this.energy = Math.max(0, this.energy - 10);
    beep(high ? 540 : 1040, 0.22, 4); buzz([400, 150, 400]);
    const s = this.sim;
    const minOfDay = s.t % 1440;
    const hh = String(Math.floor(minOfDay / 60)).padStart(2, "0"), mm = String(minOfDay % 60).padStart(2, "0");
    const m = this.modal(`
      <h3>⏰ ${hh}:${mm} — CGM ALARM</h3>
      <p class="sub">The phone is screaming on the nightstand. You surface from sleep, heart pounding, and squint at the number:
      <b style="color:${high ? "#fbbf24" : "#fb7185"}">${fmtBG(s.cgmNow(), this.mmol)} ${bgUnit(this.mmol)} ${s.trendArrow()}</b></p>
      <div class="choice-list">
        ${high
          ? `<button class="choice-btn" data-x="corr"><span class="ct">💉 Groggy correction</span><span class="cd">Math at 3 a.m. — be conservative.</span></button>`
          : `<button class="choice-btn" data-x="treat"><span class="ct">🧃 Juice from the nightstand</span><span class="cd">Every T1D bedroom has one within arm's reach.</span></button>`}
        <button class="choice-btn" data-x="ignore"><span class="ct">😴 Ignore it and roll over</span><span class="cd">${high ? "It can wait until morning… probably." : "Dangerous. Lows don't fix themselves with insulin on board."}</span></button>
      </div>`);
    const t = m.el.querySelector('[data-x="treat"]');
    if (t) t.onclick = () => { m.close(); s.eat(18, "fast", "3am juice"); this.toast("Sugar in, eyes already closing. You'll feel this broken sleep tomorrow.", "", 8000); };
    const c = m.el.querySelector('[data-x="corr"]');
    if (c) c.onclick = () => { m.close(); this.bolusModal(0, null, "Night correction"); };
    m.el.querySelector('[data-x="ignore"]').onclick = () => {
      m.close();
      this.toast(high ? "You roll over. The high will grind on for hours." : "You roll over. The CGM will be back — louder.", "bad", 7000);
    };
  }

  wakeUp() {
    this.sleeping = false;
    this.dayIdx++;
    const s = this.sim;
    // restore energy based on night quality
    this.energy = Math.min(100, this.energy + 42);
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
    this.caption(`A new day. Dawn hormones have been at work since 4 a.m. — check the number before anything else.`);
    this.dropFact();
  }

  menuModal() {
    const m = this.modal(`
      <h3>☰ Menu</h3>
      <div class="menu-list">
        <button class="btn" data-x="units">Switch units (now: ${bgUnit(this.mmol)})</button>
        <button class="btn" data-x="save">Save game</button>
        <button class="btn" data-x="quit">Save & quit to title</button>
        <button class="btn btn-ghost" data-x="close">Close</button>
      </div>`);
    m.el.querySelector('[data-x="units"]').onclick = () => { this.mmol = !this.mmol; this.c.mmol = this.mmol; m.close(); };
    m.el.querySelector('[data-x="save"]').onclick = () => { this.save(); m.close(); this.toast("Game saved.", "good"); };
    m.el.querySelector('[data-x="quit"]').onclick = () => { this.save(); this.stop(); location.reload(); };
    m.el.querySelector('[data-x="close"]').onclick = () => m.close();
  }
}
