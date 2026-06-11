// ============================================================
// Life in Range — monochrome stroke icon set (no emoji anywhere)
// All icons: 24×24 viewBox, currentColor, 1.5px strokes.
// ============================================================

const S = `fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
const wrap = inner => `<svg viewBox="0 0 24 24" ${S}>${inner}</svg>`;

const bowl = extra => wrap(`<path d="M4 11h16a8 8 0 0 1-5 7.4V20H9v-1.6A8 8 0 0 1 4 11Z"/>${extra || ""}`);

export const ICONS = {
  // ---- breakfast ----
  oatmeal: bowl(`<path d="M9 7c0-1.2 1-1.8 1-3M13 7c0-1.2 1-1.8 1-3"/>`),
  bagel: wrap(`<ellipse cx="12" cy="12" rx="8" ry="6.5"/><ellipse cx="12" cy="12" rx="2.6" ry="2"/>`),
  eggs: wrap(`<path d="M5 13c-1.5-3 .5-7.5 4-8.5 2.6-.8 6 .3 7.5 2.5M19 13a7 7 0 0 1-14 .5"/><circle cx="12" cy="13" r="2.6"/>`),
  yogurt: wrap(`<path d="M7 4h10l-1.2 16H8.2L7 4Z"/><path d="M7.6 9h8.8"/>`),
  pancakes: wrap(`<ellipse cx="12" cy="8" rx="7" ry="2.4"/><path d="M5 8v3c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4V8M5 11v3c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4v-3"/><path d="M12 5.6V4"/>`),
  skipbf: wrap(`<path d="M5 8h11v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 5c0-1 .8-1.2.8-2M11.5 5c0-1 .8-1.2.8-2"/>`),
  // ---- lunch ----
  salad: bowl(`<path d="M8 11c.5-2.5 2-4 4-5M16 11c-.3-2 .5-3.5 2-4.5M12 11c-.4-1.6-1.6-2.6-3-3"/>`),
  sandwich: wrap(`<path d="M3 9.5 12 5l9 4.5H3ZM4 13h16l-8 6-8-6Z"/>`),
  burrito: wrap(`<path d="M5 16 14 7a4.2 4.2 0 0 1 6 6l-9 9"/><path d="M5 16a4.2 4.2 0 0 0 6 6M8 13c1.5.2 3 1.7 3.2 3.2"/>`),
  ramen: bowl(`<path d="M7 8c3-1.5 7-1.5 10 0M4 5l16-2"/>`),
  sushi: wrap(`<circle cx="8" cy="14" r="4.5"/><circle cx="8" cy="14" r="1.8"/><path d="M14.5 10h6v8h-6z"/>`),
  soup: wrap(`<path d="M5 10h14v3a7 7 0 0 1-14 0v-3Z"/><path d="M3 10h18M9 7c0-1 .8-1.4.8-2.6M13 7c0-1 .8-1.4.8-2.6"/>`),
  // ---- dinner ----
  pizza: wrap(`<path d="M4 6c5-2.7 11-2.7 16 0L12 21 4 6Z"/><circle cx="10" cy="9" r="1.1"/><circle cx="14" cy="11.5" r="1.1"/><circle cx="11" cy="14.5" r="1.1"/>`),
  pasta: wrap(`<path d="M8 3v8M11 3v8M14 3v8M11 11l-1 4"/><path d="M4 15h16a8 8 0 0 1-5 5.4v.6H9v-.6A8 8 0 0 1 4 15Z"/>`),
  stirfry: wrap(`<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 9c1-1.4 2.8-1.8 4-1M13 9c.6-.8 1.8-1.2 3-.8"/>`),
  salmon: wrap(`<path d="M3 12c3-4 8-6 13-5 2.4.5 4 1.6 5 3-1 1.4-2.6 2.5-5 3-5 1-10-1-13-5v8"/><circle cx="15" cy="10.6" r="0.9" fill="currentColor" stroke="none"/>`),
  curry: bowl(`<path d="M6 8c2-2 5-2.6 8-2M17 7.5c1.2.2 2.3.7 3 1.5"/>`),
  tacos: wrap(`<path d="M4 17a8 8 0 0 1 16 0H4Z"/><path d="M7 17a5 5 0 0 1 10 0"/>`),
  // ---- snacks ----
  apple: wrap(`<path d="M12 8c-1-2-3.5-2.6-5.4-1.2C4 8.7 4.5 13 6.5 16.5c1.4 2.4 3 3.4 4.3 2.7.4-.2.8-.2 1.2 0 1.4.7 3.4-.3 4.8-2.7 2-3.5 2.5-7.8-.1-9.7C15 5.4 13 6 12 8Z"/><path d="M12 7.5c0-2 1-3.2 2.6-3.5"/>`),
  bar: wrap(`<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M8 8v8M12 8v8M16 8v8"/>`),
  chips: wrap(`<path d="M7 4h10l1.6 14a2 2 0 0 1-2 2.2H7.4a2 2 0 0 1-2-2.2L7 4Z"/><path d="M7 8.5h10"/>`),
  nuts: wrap(`<ellipse cx="8" cy="9" rx="3" ry="3.7"/><ellipse cx="15.8" cy="11" rx="2.8" ry="3.4" transform="rotate(25 15.8 11)"/><ellipse cx="10.6" cy="16.6" rx="2.8" ry="3.3" transform="rotate(-18 10.6 16.6)"/>`),
  cookie: wrap(`<circle cx="12" cy="12" r="8.5"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="9.5" r="1"/><circle cx="13.5" cy="14.5" r="1"/><circle cx="9" cy="14.8" r="1"/>`),
  nosnack: wrap(`<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>`),
  cake: wrap(`<path d="M5 12h14v8H5z"/><path d="M5 15.5c1.5 1.4 3-1.4 4.5 0s3-1.4 4.5 0 3-1.4 4.5 0"/><path d="M12 12V9.5"/><path d="M12 7.5c-.8-.8-.4-2 0-2.5.4.5.8 1.7 0 2.5Z"/>`),
  // ---- Indian dishes ----
  dosa: wrap(`<path d="M3 16h18a6 6 0 0 1-4 3H7a6 6 0 0 1-4-3Z"/><path d="M6 16 16 5a3.2 3.2 0 0 1 3 3L13 16"/>`),
  idli: wrap(`<ellipse cx="8.5" cy="10" rx="4.5" ry="2.6"/><ellipse cx="15.5" cy="13" rx="4.5" ry="2.6"/><path d="M3 18h18a7 7 0 0 1-3 3H6a7 7 0 0 1-3-3Z"/>`),
  paratha: wrap(`<circle cx="12" cy="12" r="8.5"/><path d="M8 9.5c1.4 1 2.6 1 4 0s2.6-1 4 0M8 14.5c1.4 1 2.6 1 4 0s2.6-1 4 0"/>`),
  chole: wrap(`<circle cx="9" cy="9" r="6"/><path d="M4 17h16a7 7 0 0 1-4.5 4h-7A7 7 0 0 1 4 17Z"/><circle cx="16.5" cy="13" r="0.8"/><circle cx="18.5" cy="14.8" r="0.8"/>`),
  thali: wrap(`<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9.5" r="2.4"/><circle cx="15.5" cy="9.5" r="2.4"/><path d="M8 16c2.5 1.4 5.5 1.4 8 0"/>`),
  biryani: wrap(`<path d="M4 12h16a8 8 0 0 1-5 7.4V20H9v-.6A8 8 0 0 1 4 12Z"/><path d="M8 9.5c0-1 .8-1.4.8-2.5M12 9.5c0-1 .8-1.4.8-2.5M16 9.5c0-1 .8-1.4.8-2.5"/><path d="M7.5 15h2M11 16.5h2M14.5 15h2"/>`),
  paneer: wrap(`<path d="M3 14c0-5 4-8 8-8 5 0 10 2.5 10 8 0 3-2 5-5 5H8c-3 0-5-2-5-5Z"/><rect x="8" y="11" width="3.4" height="3.4" rx="0.6"/><rect x="13.5" y="12" width="3.4" height="3.4" rx="0.6"/>`),
  samosa: wrap(`<path d="M12 3 21 19H3L12 3Z"/><path d="M9 13c1.8 1.2 4.2 1.2 6 0"/>`),
  chai: wrap(`<path d="M5 9h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 6c0-1 .8-1.2.8-2.4M11.5 6c0-1 .8-1.2.8-2.4"/>`),
  // ---- treats ----
  juice: wrap(`<path d="M7 8h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8Z"/><path d="M7 8l1-3h8l1 3M13.5 5l1.8-3"/>`),
  tabs: wrap(`<rect x="4" y="9" width="9" height="6" rx="3"/><path d="M8.5 9v6"/><rect x="13" y="13" width="7" height="5" rx="2.5"/>`),
  candy: wrap(`<circle cx="12" cy="12" r="4.5"/><path d="M16 9.5 20 6l-1 4 1 .5-3.5 2M8 14.5 4 18l1-4-1-.5L7.5 11"/>`),
  // ---- actions / UI ----
  treat: wrap(`<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>`),
  syringe: wrap(`<path d="m18 3 3 3M19.5 4.5 9 15l-4 1 1-4L16.5 1.5M5 19l-2 2"/><path d="m11 9 2 2"/>`),
  snack: wrap(`<path d="M12 8c-1-2-3.5-2.6-5.4-1.2C4 8.7 4.5 13 6.5 16.5c1.4 2.4 3 3.4 4.3 2.7.4-.2.8-.2 1.2 0 1.4.7 3.4-.3 4.8-2.7 2-3.5 2.5-7.8-.1-9.7C15 5.4 13 6 12 8Z"/><path d="M12 7.5c0-2 1-3.2 2.6-3.5"/>`),
  pump: wrap(`<rect x="5" y="8" width="10" height="13" rx="2.5"/><path d="M10 8V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v6"/><circle cx="18" cy="14" r="1.4"/><path d="M8 12h4M8 15h4"/>`),
  water: wrap(`<path d="M7 3h10l-1.5 17a1.8 1.8 0 0 1-1.8 1.6H10.3a1.8 1.8 0 0 1-1.8-1.6L7 3Z"/><path d="M8 10c2 1.2 6 1.2 8 0"/>`),
  moon: wrap(`<path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 7 7 0 0 0 20 13.5Z"/>`),
  run: wrap(`<circle cx="14.5" cy="4.5" r="1.8"/><path d="M9 20.5 11.5 15l-2-4 4-3.5 2.5 3.5 3.5 1M11.5 15l-4 5.5M9.5 11 5 12.5"/>`),
  alert: wrap(`<path d="M12 3 2.5 19.5h19L12 3Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r="0.4" fill="currentColor"/>`),
};

export function icon(name, cls = "") {
  const svg = ICONS[name] || ICONS.bar;
  return cls ? `<span class="${cls}">${svg}</span>` : svg;
}
