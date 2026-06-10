// ============================================================
// GlucoQuest — SVG character + CSS scene art
// ============================================================
import { SKIN_TONES, HAIR_COLORS, SCENES } from "./data.js";

const SHIRTS = { engineer: "#3b82f6", teacher: "#a78bfa", nurse: "#34d399", chef: "#e2e8f0", architect: "#f59e0b" };

function hairSVG(style, color) {
  switch (style) {
    case 0: // short
      return `<path d="M30 26 q0 -16 20 -16 q20 0 20 16 l-2 6 q-4 -10 -18 -10 q-14 0 -18 10 Z" fill="${color}"/>`;
    case 1: // curly
      return `<g fill="${color}">
        <circle cx="33" cy="24" r="8"/><circle cx="43" cy="18" r="9"/><circle cx="55" cy="17" r="9"/>
        <circle cx="66" cy="23" r="8"/><circle cx="29" cy="33" r="6"/><circle cx="70" cy="33" r="6"/></g>`;
    case 2: // long
      return `<path d="M28 28 q2 -20 22 -20 q20 0 22 20 l1 26 q-6 6 -10 2 l-1 -18 q-6 -8 -12 -8 q-6 0 -12 8 l-1 18 q-4 4 -10 -2 Z" fill="${color}"/>`;
    case 3: // bun
      return `<circle cx="50" cy="10" r="7" fill="${color}"/>
        <path d="M30 27 q0 -15 20 -15 q20 0 20 15 l-2 5 q-4 -9 -18 -9 q-14 0 -18 9 Z" fill="${color}"/>`;
    default: // buzz
      return `<path d="M31 25 q2 -12 19 -12 q17 0 19 12 l-1 4 q-5 -8 -18 -8 q-13 0 -18 8 Z" fill="${color}" opacity="0.85"/>`;
  }
}

// Full-body adult professional. therapy: pump → visible pump + tubing; CGM patch on arm always.
export function avatarSVG(c, opts = {}) {
  const skin = SKIN_TONES[c.skin], hair = HAIR_COLORS[c.hairColor];
  const shirt = SHIRTS[c.profession] || "#3b82f6";
  const pants = "#334155";
  const mood = opts.mood || "ok"; // ok | low | high | happy
  const mouth =
    mood === "happy" ? `<path d="M44 47 q6 6 12 0" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>` :
    mood === "low"   ? `<path d="M44 50 q6 -5 12 0" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>` :
    mood === "high"  ? `<path d="M45 49 h10" stroke="#7c2d12" stroke-width="2" stroke-linecap="round"/>` :
                       `<path d="M45 48 q5 3 10 0" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const sweat = mood === "low" ? `<circle cx="68" cy="34" r="2.4" fill="#7dd3fc"><animate attributeName="cy" values="32;40" dur="0.9s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="0.9s" repeatCount="indefinite"/></circle>` : "";
  const pump = c.therapy === "pump"
    ? `<rect x="56" y="92" width="12" height="16" rx="3" fill="#0ea5e9" stroke="#bae6fd" stroke-width="1"/>
       <path d="M62 92 q8 -14 1 -24" stroke="#bae6fd" stroke-width="1.6" fill="none"/>
       <circle cx="62" cy="67" r="2.6" fill="#bae6fd"/>`
    : "";
  return `<svg viewBox="0 0 100 190" xmlns="http://www.w3.org/2000/svg">
    <!-- legs -->
    <rect x="38" y="128" width="10" height="48" rx="5" fill="${pants}"/>
    <rect x="52" y="128" width="10" height="48" rx="5" fill="${pants}"/>
    <ellipse cx="42" cy="180" rx="9" ry="5" fill="#1e293b"/>
    <ellipse cx="58" cy="180" rx="9" ry="5" fill="#1e293b"/>
    <!-- torso -->
    <path d="M32 70 q18 -10 36 0 l4 50 q-22 10 -44 0 Z" fill="${shirt}"/>
    <path d="M32 70 q18 -10 36 0 l1 12 q-19 8 -38 0 Z" fill="rgba(255,255,255,0.18)"/>
    <!-- arms -->
    <rect x="22" y="72" width="11" height="44" rx="5.5" fill="${shirt}"/>
    <rect x="67" y="72" width="11" height="44" rx="5.5" fill="${shirt}"/>
    <circle cx="27.5" cy="120" r="6" fill="${skin}"/>
    <circle cx="72.5" cy="120" r="6" fill="${skin}"/>
    <!-- CGM sensor on left arm -->
    <circle cx="27.5" cy="86" r="5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="27.5" cy="86" r="2" fill="#38bdf8"/>
    ${pump}
    <!-- neck & head -->
    <rect x="45" y="56" width="10" height="10" fill="${skin}"/>
    <circle cx="50" cy="38" r="20" fill="${skin}"/>
    ${hairSVG(c.hairStyle, hair)}
    <circle cx="43" cy="38" r="2.3" fill="#1f2430"/>
    <circle cx="57" cy="38" r="2.3" fill="#1f2430"/>
    ${mouth}${sweat}
  </svg>`;
}

// ------------------------------------------------------------
// Scene props rendered as positioned divs with inline SVG/emoji
// ------------------------------------------------------------
const PROP_SETS = {
  bedroom: [
    { x: "6%", y: "52%", s: 64, e: "🛏" }, { x: "78%", y: "30%", s: 34, e: "🌙" }, { x: "70%", y: "58%", s: 30, e: "🪟" },
  ],
  kitchen: [
    { x: "8%", y: "46%", s: 50, e: "🍳" }, { x: "76%", y: "44%", s: 46, e: "☕" }, { x: "44%", y: "26%", s: 30, e: "💡" },
  ],
  city: [
    { x: "5%", y: "30%", s: 56, e: "🏢" }, { x: "22%", y: "36%", s: 44, e: "🏬" }, { x: "74%", y: "32%", s: 52, e: "🏙" }, { x: "86%", y: "60%", s: 34, e: "🚌" },
  ],
  office: [
    { x: "8%", y: "44%", s: 48, e: "🖥" }, { x: "74%", y: "42%", s: 44, e: "🗄" }, { x: "30%", y: "24%", s: 26, e: "🕒" }, { x: "84%", y: "22%", s: 26, e: "🪴" },
  ],
  restaurant: [
    { x: "8%", y: "42%", s: 44, e: "🍽" }, { x: "76%", y: "40%", s: 40, e: "🕯" }, { x: "40%", y: "20%", s: 26, e: "✨" },
  ],
  gym: [
    { x: "8%", y: "46%", s: 48, e: "🏋️" }, { x: "76%", y: "46%", s: 44, e: "🚴" }, { x: "42%", y: "22%", s: 26, e: "💪" },
  ],
  night: [
    { x: "70%", y: "16%", s: 40, e: "🌙" }, { x: "20%", y: "20%", s: 16, e: "⭐" }, { x: "36%", y: "12%", s: 12, e: "⭐" }, { x: "8%", y: "54%", s: 60, e: "🛏" },
  ],
};

export function renderScene(el, sceneId) {
  const sc = SCENES[sceneId] || SCENES.office;
  el.style.background = sc.sky;
  el.innerHTML = "";
  const ground = document.createElement("div");
  ground.className = "decor";
  ground.style.cssText = `left:0;right:0;bottom:0;height:26%;background:${sc.ground};border-top:1px solid rgba(255,255,255,0.08)`;
  el.appendChild(ground);
  for (const p of PROP_SETS[sc.props] || []) {
    const d = document.createElement("div");
    d.className = "decor";
    d.style.cssText = `left:${p.x};top:${p.y};font-size:${p.s}px;opacity:0.92;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.4))`;
    d.textContent = p.e;
    el.appendChild(d);
  }
  return sc.label;
}
