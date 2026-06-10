// ============================================================
// Life in Range — figure illustration + scene art
// A proportioned adult silhouette (fashion-sketch style), and
// atmospheric vector scenes. No emoji, no cartoons.
// ============================================================
import { SKIN_TONES, HAIR_COLORS } from "./data.js";

// muted professional wardrobe tints
const ATTIRE = {
  engineer: "#3d4654", teacher: "#4a4258", nurse: "#39504b",
  chef: "#494a4e", architect: "#54483a",
};

function hairPath(style, color) {
  switch (style) {
    case 0: // short
      return `<path d="M44 28c0-10 7-16 16-16s16 6 16 16l-1.5 6c-1-7-6.5-11-14.5-11s-13.5 4-14.5 11Z" fill="${color}"/>`;
    case 1: // curly
      return `<path d="M43 30c-2-12 6-19 17-19 10 0 18 7 16 19l-1.6 5c.2-8-5.4-13-14.4-13-9.4 0-14.6 5-14.4 13Z" fill="${color}"/>
        <circle cx="45" cy="22" r="4.4" fill="${color}"/><circle cx="53" cy="15.5" r="4.8" fill="${color}"/>
        <circle cx="62" cy="13.5" r="4.8" fill="${color}"/><circle cx="71" cy="16" r="4.6" fill="${color}"/><circle cx="76" cy="23" r="4" fill="${color}"/>`;
    case 2: // long
      return `<path d="M44 28c0-10 7-16 16-16s16 6 16 16l2 26c.5 5-3 7-6 5l-2.5-20c-2-5-5-7.5-9.5-7.5S52.5 34 50.5 39L48 59c-3 2-6.5 0-6-5Z" fill="${color}"/>`;
    case 3: // bun
      return `<circle cx="60" cy="9" r="5.5" fill="${color}"/>
        <path d="M45 28c0-9.5 6.5-15 15-15s15 5.5 15 15l-1.4 5.5c-1-6.7-6-10.5-13.6-10.5s-12.6 3.8-13.6 10.5Z" fill="${color}"/>`;
    default: // buzz
      return `<path d="M46 27c0-8.5 6-13.5 14-13.5s14 5 14 13.5l-1.2 4.5c-1-6-5.8-9.5-12.8-9.5s-11.8 3.5-12.8 9.5Z" fill="${color}" opacity="0.9"/>`;
  }
}

// Full-body adult, ~7.5 head proportions. Subtle CGM on the arm,
// pump at the waistband for pump users.
export function avatarSVG(c, opts = {}) {
  const skin = SKIN_TONES[c.skin];
  const hair = HAIR_COLORS[c.hairColor];
  const attire = ATTIRE[c.profession] || "#3d4654";
  const trouser = "#23262c";
  const pump = c.therapy === "pump"
    ? `<rect x="69" y="142" width="9" height="14" rx="2.5" fill="#1b1e24" stroke="#6b9fd4" stroke-width="0.8"/>
       <path d="M73 142c4-10 1-18-2-24" stroke="#6b9fd4" stroke-width="0.9" fill="none" opacity="0.7"/>`
    : "";
  return `<svg viewBox="0 0 120 330" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade-${c.skin}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="rgba(255,255,255,0.10)"/><stop offset="0.6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.30)"/>
      </linearGradient>
    </defs>
    <!-- legs -->
    <path d="M48 165 L46 240 47 305 H56 L58 245 60 205 62 245 64 305 H73 L74 240 72 165 Z" fill="${trouser}"/>
    <path d="M44 305 h14 v6 a2.5 2.5 0 0 1 -2.5 2.5 H46 a4 4 0 0 1 -4 -4 Z" fill="#15171b"/>
    <path d="M62 305 h14 v6 a2.5 2.5 0 0 1 -2.5 2.5 H64 a4 4 0 0 1 -4 -4 Z" fill="#15171b"/>
    <!-- torso -->
    <path d="M42 64 C50 58 70 58 78 64 L82 100 80 150 c0 10 -8 16 -20 16 s-20 -6 -20 -16 L38 100 Z" fill="${attire}"/>
    <path d="M42 64 C50 58 70 58 78 64 L82 100 80 150 c0 10 -8 16 -20 16 s-20 -6 -20 -16 L38 100 Z" fill="url(#shade-${c.skin})"/>
    <!-- collar -->
    <path d="M53 61 L60 70 67 61" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
    <!-- arms -->
    <path d="M40 68 C33 76 31 96 32 112 L33 150 a5.5 5.5 0 0 0 11 0 L43 112 44 80 Z" fill="${attire}"/>
    <path d="M80 68 C87 76 89 96 88 112 L87 150 a5.5 5.5 0 0 1 -11 0 L77 112 76 80 Z" fill="${attire}"/>
    <circle cx="38.5" cy="156" r="5" fill="${skin}"/>
    <circle cx="81.5" cy="156" r="5" fill="${skin}"/>
    <!-- CGM sensor, upper left arm -->
    <circle cx="37.5" cy="95" r="3.6" fill="#1b1e24" stroke="#9aa0a8" stroke-width="0.8"/>
    <circle cx="37.5" cy="95" r="1.2" fill="#6b9fd4"/>
    ${pump}
    <!-- neck & head -->
    <path d="M54 48 h12 v14 c-3 3 -9 3 -12 0 Z" fill="${skin}"/>
    <ellipse cx="60" cy="32" rx="16.5" ry="18.5" fill="${skin}"/>
    <ellipse cx="60" cy="32" rx="16.5" ry="18.5" fill="url(#shade-${c.skin})"/>
    ${hairPath(c.hairStyle, hair)}
  </svg>`;
}

// ------------------------------------------------------------
// Scenes — quiet, atmospheric vector environments
// ------------------------------------------------------------
const SCENE_LABELS = {
  bedroom: "Home · Bedroom", kitchen: "Home · Kitchen", commute: "In transit",
  office: "Work", restaurant: "Restaurant", gym: "Gym", night: "Night",
};

function skyline(y, h, fill, seed = 3) {
  let x = -10, out = "";
  let i = 0;
  while (x < 1010) {
    const w = 40 + ((i * seed * 37) % 70);
    const bh = h * (0.45 + ((i * seed * 53) % 100) / 180);
    out += `<rect x="${x}" y="${y - bh}" width="${w}" height="${bh + 4}" fill="${fill}"/>`;
    x += w + 14; i++;
  }
  return out;
}

function windowLights(y0, y1, color, n, seed = 7) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = ((i * seed * 131) % 1000);
    const y = y0 + ((i * seed * 61) % (y1 - y0));
    out += `<rect x="${x}" y="${y}" width="5" height="7" fill="${color}" opacity="${0.25 + ((i * 13) % 40) / 100}"/>`;
  }
  return out;
}

function stars(n, yMax, seed = 5) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = (i * seed * 173) % 1000;
    const y = (i * seed * 97) % yMax;
    out += `<circle cx="${x}" cy="${y}" r="${0.8 + (i % 3) * 0.5}" fill="#cfd5dd" opacity="${0.15 + (i % 5) / 10}"/>`;
  }
  return out;
}

const SCENE_BUILDERS = {
  office: () => `
    <rect width="1000" height="600" fill="#0e1014"/>
    <rect width="1000" height="600" fill="url(#g-office)"/>
    ${skyline(430, 300, "#171a21", 4)}${skyline(450, 220, "#1d212a", 9)}
    ${windowLights(220, 440, "#cf9a42", 26)}
    <g stroke="#262a33" stroke-width="6">${[0, 200, 400, 600, 800, 1000].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="470"/>`).join("")}
      <line x1="0" y1="470" x2="1000" y2="470"/></g>
    <rect y="470" width="1000" height="130" fill="#101216"/>
    <rect x="560" y="380" width="420" height="14" rx="3" fill="#1a1d23"/>
    <rect x="600" y="394" width="14" height="76" fill="#16181d"/><rect x="900" y="394" width="14" height="76" fill="#16181d"/>
    <rect x="660" y="300" width="130" height="80" rx="6" fill="#14161b" stroke="#2a2e38" stroke-width="2"/>
    <path d="M715 380 h20 l6 14 h-32 Z" fill="#16181d"/>`,
  kitchen: () => `
    <rect width="1000" height="600" fill="#121009"/>
    <rect width="1000" height="600" fill="url(#g-kitchen)"/>
    <rect x="640" y="80" width="280" height="300" rx="6" fill="#1c1812" stroke="#332b1d" stroke-width="3"/>
    <rect x="652" y="92" width="124" height="276" fill="#241e13" opacity="0.9"/>
    <rect x="788" y="92" width="120" height="276" fill="#27200f" opacity="0.9"/>
    <line x1="120" y1="0" x2="120" y2="140" stroke="#2a251b" stroke-width="3"/>
    <path d="M90 140 h60 l14 34 h-88 Z" fill="#1f1b12"/>
    <ellipse cx="120" cy="176" rx="46" ry="9" fill="#cf9a42" opacity="0.10"/>
    <line x1="330" y1="0" x2="330" y2="120" stroke="#2a251b" stroke-width="3"/>
    <path d="M300 120 h60 l14 34 h-88 Z" fill="#1f1b12"/>
    <ellipse cx="330" cy="156" rx="46" ry="9" fill="#cf9a42" opacity="0.10"/>
    <rect y="430" width="1000" height="24" fill="#23201a"/>
    <rect y="454" width="1000" height="146" fill="#15130e"/>
    <rect x="430" y="350" width="120" height="80" rx="4" fill="#1b1812"/>`,
  commute: () => `
    <rect width="1000" height="600" fill="#0c0e13"/>
    <rect width="1000" height="600" fill="url(#g-commute)"/>
    ${stars(26, 200)}
    ${skyline(440, 330, "#13161d", 5)}${skyline(470, 260, "#191d26", 11)}${skyline(500, 180, "#20242f", 7)}
    ${windowLights(240, 490, "#9aa0a8", 34, 11)}
    <rect y="520" width="1000" height="80" fill="#0e1014"/>
    <line x1="0" y1="520" x2="1000" y2="520" stroke="#262a33" stroke-width="2"/>`,
  restaurant: () => `
    <rect width="1000" height="600" fill="#120e0c"/>
    <rect width="1000" height="600" fill="url(#g-restaurant)"/>
    <circle cx="180" cy="140" r="60" fill="#cf9a42" opacity="0.05"/><circle cx="180" cy="140" r="22" fill="#cf9a42" opacity="0.08"/>
    <circle cx="520" cy="100" r="70" fill="#cf9a42" opacity="0.045"/><circle cx="520" cy="100" r="26" fill="#cf9a42" opacity="0.07"/>
    <circle cx="840" cy="160" r="55" fill="#cf9a42" opacity="0.05"/><circle cx="840" cy="160" r="20" fill="#cf9a42" opacity="0.08"/>
    <line x1="180" y1="0" x2="180" y2="118" stroke="#241d15" stroke-width="2.5"/>
    <line x1="520" y1="0" x2="520" y2="76" stroke="#241d15" stroke-width="2.5"/>
    <line x1="840" y1="0" x2="840" y2="138" stroke="#241d15" stroke-width="2.5"/>
    <rect x="560" y="420" width="380" height="16" rx="4" fill="#1e1813"/>
    <rect x="580" y="436" width="12" height="100" fill="#181310"/><rect x="908" y="436" width="12" height="100" fill="#181310"/>
    <rect y="510" width="1000" height="90" fill="#100c0a"/>`,
  gym: () => `
    <rect width="1000" height="600" fill="#0d1013"/>
    <rect width="1000" height="600" fill="url(#g-gym)"/>
    <rect x="620" y="120" width="16" height="330" fill="#1c2127"/><rect x="920" y="120" width="16" height="330" fill="#1c2127"/>
    <rect x="600" y="170" width="356" height="10" fill="#22272e"/><rect x="600" y="280" width="356" height="10" fill="#22272e"/>
    <circle cx="700" cy="175" r="26" fill="#14171b" stroke="#2a2f37" stroke-width="3"/>
    <circle cx="745" cy="175" r="18" fill="#14171b" stroke="#2a2f37" stroke-width="3"/>
    <circle cx="860" cy="285" r="26" fill="#14171b" stroke="#2a2f37" stroke-width="3"/>
    <rect y="450" width="1000" height="150" fill="#0f1216"/>
    <line x1="0" y1="450" x2="1000" y2="450" stroke="#262b33" stroke-width="2"/>`,
  bedroom: () => `
    <rect width="1000" height="600" fill="#0b0d12"/>
    <rect width="1000" height="600" fill="url(#g-bedroom)"/>
    <rect x="600" y="70" width="320" height="290" rx="6" fill="#10141d" stroke="#222835" stroke-width="3"/>
    <circle cx="780" cy="170" r="38" fill="#d9dde3" opacity="0.75"/>
    <circle cx="766" cy="160" r="34" fill="#10141d"/>
    ${stars(18, 340, 9)}
    <rect x="540" y="430" width="440" height="60" rx="10" fill="#191d26"/>
    <rect x="540" y="415" width="120" height="34" rx="8" fill="#232834"/>
    <rect x="530" y="488" width="460" height="20" fill="#13161d"/>
    <rect y="508" width="1000" height="92" fill="#0c0e13"/>`,
  night: () => `
    <rect width="1000" height="600" fill="#07080b"/>
    ${stars(40, 420, 13)}
    <circle cx="820" cy="110" r="34" fill="#d9dde3" opacity="0.6"/><circle cx="808" cy="102" r="30" fill="#07080b"/>
    <rect x="540" y="430" width="440" height="60" rx="10" fill="#11141a"/>
    <rect x="540" y="415" width="120" height="34" rx="8" fill="#181d26"/>
    <rect x="530" y="488" width="460" height="20" fill="#0d0f14"/>
    <rect y="508" width="1000" height="92" fill="#08090c"/>`,
};

const SCENE_GRADS = `
  <linearGradient id="g-office" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(107,159,212,0.10)"/><stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="g-kitchen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(207,154,66,0.09)"/><stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="g-commute" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(120,110,160,0.12)"/><stop offset="0.6" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="g-restaurant" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(207,130,66,0.07)"/><stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="g-gym" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(107,159,212,0.07)"/><stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="g-bedroom" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(110,130,180,0.08)"/><stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>`;

export function renderScene(el, sceneId) {
  const build = SCENE_BUILDERS[sceneId] || SCENE_BUILDERS.office;
  el.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>${SCENE_GRADS}</defs>${build()}
    <rect width="1000" height="600" fill="url(#g-vignette)" opacity="0"/>
  </svg>`;
  return SCENE_LABELS[sceneId] || "—";
}
