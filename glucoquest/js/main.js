// ============================================================
// GlucoQuest — screens, character creation, summaries, ending
// ============================================================
import { SKIN_TONES, HAIR_COLORS, HAIR_STYLES, PROFESSIONS, THERAPIES, DEFAULT_CHARACTERS, FACTS, ABOUT_HTML } from "./data.js";
import { avatarSVG } from "./avatar.js";
import { startTitleBG } from "./graph.js";
import { fmtBG, bgUnit } from "./engine.js";
import { Game } from "./game.js";

const $ = id => document.getElementById(id);
let game = null;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === "screen-" + id));
}
document.querySelectorAll("[data-nav]").forEach(b => b.onclick = () => showScreen(b.dataset.nav));

// ---------- title ----------
startTitleBG($("title-canvas"));
$("btn-about").onclick = () => { $("about-content").innerHTML = ABOUT_HTML; showScreen("about"); };
$("btn-new-game").onclick = () => { initCreate(); showScreen("create"); };

const saved = Game.loadSave();
if (saved && saved.c) {
  const btn = $("btn-continue");
  btn.classList.remove("hidden");
  btn.textContent = `⏵ Continue — ${saved.c.name}, day ${saved.dayIdx + 1}`;
  btn.onclick = () => startGame(saved.c, saved);
}

// ---------- character creation ----------
const character = { name: "Maya", age: 34, profession: "engineer", skin: 2, hairColor: 0, hairStyle: 2, therapy: "pump", mmol: false, days: 7, diagnosedAge: 19 };
let defaultIdx = 0;

function chipRow(el, items, getLabel, isSel, onPick) {
  el.innerHTML = "";
  items.forEach((item, i) => {
    const b = document.createElement("button");
    b.className = "chip" + (isSel(item, i) ? " sel" : "");
    const lbl = getLabel(item, i);
    if (lbl.startsWith("#")) { b.style.background = lbl; b.setAttribute("aria-label", "option " + (i + 1)); }
    else b.textContent = lbl;
    b.onclick = () => { onPick(item, i); refreshCreate(); };
    el.appendChild(b);
  });
}

function refreshCreate() {
  $("create-avatar").innerHTML = avatarSVG(character, { mood: "happy" });
  $("inp-name").value = character.name;
  $("inp-age").value = character.age;
  $("age-val").textContent = character.age;
  const prof = PROFESSIONS.find(p => p.id === character.profession);
  const th = THERAPIES.find(t => t.id === character.therapy);
  $("create-summary").innerHTML = `<b>${character.name}</b>, ${character.age} — ${prof.label.replace(/^\S+\s/, "")}<br/>
    T1D since age ${character.diagnosedAge} · ${character.therapy === "pump" ? "pump + CGM" : "pens (MDI) + CGM"}`;
  $("therapy-note").textContent = th.note;
  chipRow($("opt-profession"), PROFESSIONS, p => p.label, p => p.id === character.profession, p => character.profession = p.id);
  chipRow($("opt-skin"), SKIN_TONES, t => t, (t, i) => i === character.skin, (t, i) => character.skin = i);
  chipRow($("opt-hair"), HAIR_STYLES, (h, i) => h, (h, i) => i === character.hairStyle, (h, i) => character.hairStyle = i);
  chipRow($("opt-therapy"), THERAPIES, t => t.label, t => t.id === character.therapy, t => character.therapy = t.id);
  chipRow($("opt-units"), [false, true], m => m ? "mmol/L" : "mg/dL", m => m === character.mmol, m => character.mmol = m);
  chipRow($("opt-days"), [3, 5, 7], d => d + " days", d => d === character.days, d => character.days = d);
}

function initCreate() {
  $("inp-name").oninput = e => { character.name = e.target.value.trim() || "Alex"; $("create-summary").querySelector("b").textContent = character.name; };
  $("inp-age").oninput = e => { character.age = +e.target.value; $("age-val").textContent = character.age; };
  $("btn-default-char").onclick = () => {
    const d = DEFAULT_CHARACTERS[defaultIdx++ % DEFAULT_CHARACTERS.length];
    Object.assign(character, d);
    refreshCreate();
  };
  $("btn-begin").onclick = () => {
    character.name = ($("inp-name").value.trim() || character.name || "Alex").slice(0, 18);
    // hair color follows a sensible default per style pick; allow cycling via repeated style clicks later
    startGame({ ...character });
  };
  refreshCreate();
}

// cycle hair color when clicking the selected hair style again
$("opt-hair").addEventListener("click", e => {
  if (e.target.classList.contains("sel")) {
    character.hairColor = (character.hairColor + 1) % HAIR_COLORS.length;
    refreshCreate();
  }
});

// ---------- game lifecycle ----------
function startGame(c, restore = null) {
  showScreen("game");
  game = new Game(c, {
    restore,
    onDaySummary: g => showDaySummary(g),
    onFinish: g => showEnd(g),
  });
  game.start();
}

function gradeFor(tirPct) {
  if (tirPct >= 80) return { g: "A+", col: "#4ade80" };
  if (tirPct >= 70) return { g: "A", col: "#4ade80" };
  if (tirPct >= 60) return { g: "B", col: "#a3e635" };
  if (tirPct >= 50) return { g: "C", col: "#fbbf24" };
  if (tirPct >= 35) return { g: "D", col: "#fb923c" };
  return { g: "E", col: "#fb7185" };
}

function tirBarHTML(low, inR, high, mmol) {
  return `<div class="tir-bar">
      <div class="tir-low" style="width:${low}%"></div>
      <div class="tir-in" style="width:${inR}%"></div>
      <div class="tir-high" style="width:${high}%"></div>
    </div>
    <div class="tir-legend"><span>🔻 low ${low.toFixed(0)}%</span><span>✅ in range (${fmtBG(70, mmol)}–${fmtBG(180, mmol)}) ${inR.toFixed(0)}%</span><span>🔺 high ${high.toFixed(0)}%</span></div>`;
}

// ---------- day summary ----------
function showDaySummary(g) {
  const s = g.sim;
  const prev = g.dayStats.length > 1 ? g.dayStats[g.dayStats.length - 2] : { minutesTotal: 0, minutesLow: 0, minutesHigh: 0, bgSum: 0, lowEpisodes: 0 };
  const cur = g.dayStats[g.dayStats.length - 1];
  const tot = Math.max(1, cur.minutesTotal - prev.minutesTotal);
  const low = ((cur.minutesLow - prev.minutesLow) / tot) * 100;
  const high = ((cur.minutesHigh - prev.minutesHigh) / tot) * 100;
  const inR = 100 - low - high;
  const avg = (cur.bgSum - prev.bgSum) / tot;
  const lows = cur.lowEpisodes - prev.lowEpisodes;
  const grade = gradeFor(inR);
  const fact = FACTS[(g.dayIdx * 3 + 1) % FACTS.length];
  const dayDone = g.dayIdx; // just-finished day number

  $("summary-panel").innerHTML = `
    <h2>Day ${dayDone} complete</h2>
    <div class="day-grade" style="color:${grade.col}">${grade.g}</div>
    ${tirBarHTML(low, inR, high, g.mmol)}
    <div class="summary-tiles">
      <div class="tile"><div class="k">AVG GLUCOSE</div><div class="v">${fmtBG(avg, g.mmol)}<small style="font-size:11px;color:#94a3c4"> ${bgUnit(g.mmol)}</small></div></div>
      <div class="tile"><div class="k">LOW EPISODES</div><div class="v" style="color:${lows ? "#fb7185" : "#4ade80"}">${lows}</div></div>
      <div class="tile"><div class="k">NIGHT WAKE-UPS</div><div class="v">${g.nightWakes}</div></div>
      <div class="tile"><div class="k">EST. HbA1c SO FAR</div><div class="v" style="color:#5eead4">${s.gmi().toFixed(1)}%</div></div>
    </div>
    <div class="fact-card"><div class="fk">DID YOU KNOW</div>${fact}</div>
    <div class="row-end"><button class="btn btn-primary btn-big" id="btn-next-day">Start day ${dayDone + 1} →</button></div>`;
  showScreen("summary");
  $("btn-next-day").onclick = () => { showScreen("game"); g.resumeAfterSummary(); };
}

// ---------- ending ----------
function showEnd(g) {
  const s = g.sim;
  const tir = s.tir();
  const gmi = s.gmi();
  const grade = gradeFor(tir.inRange);
  const avgErr = g.guessErrors.length ? g.guessErrors.reduce((a, b) => a + b, 0) / g.guessErrors.length : 0;
  const a1cCol = gmi < 7 ? "#4ade80" : gmi < 8 ? "#fbbf24" : "#fb7185";
  const verdict =
    gmi < 7 ? "Outstanding. An HbA1c under 7% is the clinical gold standard — and you earned it one decision at a time."
    : gmi < 8 ? "Solid. You kept the week mostly in hand — and you felt how much invisible work that took."
    : "A rough week — and an honest one. Highs, lows, alarms: this is what an unforgiving condition feels like before routines click.";

  $("end-panel").innerHTML = `
    <h2>The week is over — for you</h2>
    <p class="muted">${g.c.name} wakes up on day ${g.totalDays + 1} and does it all again. There is no finish line in type 1 — but there is a scoreboard:</p>
    <div class="hba1c-dial">
      <div class="big" style="color:${a1cCol}">${gmi.toFixed(1)}%</div>
      <div class="lbl">estimated HbA1c (GMI) · clinical target &lt; 7%</div>
    </div>
    <div class="day-grade" style="color:${grade.col};font-size:40px">Overall grade: ${grade.g}</div>
    ${tirBarHTML(tir.low, tir.inRange, tir.high, g.mmol)}
    <div class="summary-tiles">
      <div class="tile"><div class="k">AVG GLUCOSE</div><div class="v">${fmtBG(s.meanBG(), g.mmol)}</div></div>
      <div class="tile"><div class="k">LOW EPISODES</div><div class="v" style="color:#fb7185">${s.lowEpisodes}</div></div>
      <div class="tile"><div class="k">SEVERE LOWS</div><div class="v" style="color:#fb7185">${g.severeLows}</div></div>
      <div class="tile"><div class="k">NIGHT ALARMS</div><div class="v">${g.nightWakes}</div></div>
      <div class="tile"><div class="k">CARB-COUNT ERROR</div><div class="v">±${avgErr.toFixed(0)}g</div></div>
      <div class="tile"><div class="k">EXTRA FAT STORED</div><div class="v">${(s.fatStore / 1000).toFixed(2)}kg</div></div>
    </div>
    <div class="fact-card"><div class="fk">VERDICT</div>${verdict}</div>
    <div class="fact-card"><div class="fk">THE POINT</div>
      Every number you just juggled — carb guesses, dose math, alarm decisions at 3 a.m. — is a real person's ordinary ${g.totalDays === 7 ? "week" : "few days"}, repeated for life,
      on top of their job, family and everything else. If someone in your life has T1D: they're doing all of this, silently, right now. The kindest thing you can do is understand it.
    </div>
    <div class="row-end">
      <button class="btn btn-ghost" id="btn-end-title">← Title</button>
      <button class="btn btn-primary btn-big" id="btn-replay">Live another week</button>
    </div>`;
  showScreen("end");
  $("btn-end-title").onclick = () => location.reload();
  $("btn-replay").onclick = () => { initCreate(); showScreen("create"); };
}
