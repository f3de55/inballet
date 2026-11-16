const path = (d, extra = '') => `<path d="${d}"${extra}/>`;
const circle = (cx, cy, r, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}"${extra}/>`;
const rect = (x, y, width, height, rx = 2) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"/>`;
const person = circle(12, 5, 2) + path('M12 9v6m-5-4 5 1 5-1m-5 4-4 6m4-6 4 6');
const heart = path('M12 20s-8-4.8-8-10a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 5.2-8 10-8 10Z');
const book = path('M12 6v14M3.5 4.5c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v14c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z');
const calendar = rect(3.5, 5.5, 17, 15) + path('M7.5 3v5m9-5v5m-13 3h17');
const pin = path('M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z') + circle(12, 10, 2.3);
const check = path('m5 12 4.5 4.5L19 7');
const cross = path('m6 6 12 12m0-12-12 12');
const arrow = path('M4.5 12h15m-6-6 6 6-6 6');
const external = path('M14 4h6v6m-.5-5.5L11 13m-1-8H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5');
const turn = (markup, angle) => `<g transform="rotate(${angle} 12 12)">${markup}</g>`;

export const icons = {
  bars: path('M4 8h16M8 16h12'),
  xmark: cross,
  'arrow-right': arrow,
  'arrow-left': turn(arrow, 180),
  'arrow-up': turn(arrow, -90),
  'arrow-down': turn(arrow, 90),
  'chevron-right': path('m9 5.5 6.5 6.5L9 18.5'),
  'chevron-left': path('m15 5.5-6.5 6.5 6.5 6.5'),
  'chevron-down': path('m5.5 9 6.5 6.5L18.5 9'),
  'arrow-up-right-from-square': external,
  'arrows-left-right': path('M3 12h18m-4-4 4 4-4 4M7 8l-4 4 4 4'),
  'arrows-up-down-left-right': path('M12 3v18M3 12h18m-6-6-3-3-3 3m6 12-3 3-3-3M6 9l-3 3 3 3m12-6 3 3-3 3'),
  'arrow-trend-up': path('m3.5 17 6-6 4 3 7-9m-6.5 0h6.5v6.5'),
  expand: path('M9 3.5H3.5V9m11-5.5H20V9M3.5 15V20H9m11-5v5h-5.5'),
  compress: path('M3.5 9H9V3.5M15 3.5V9h5.5M9 20.5V15H3.5m17 0H15v5.5'),
  'arrows-rotate': path('M20 9a8 8 0 0 0-13.5-3L3.5 9M3 4v5h5M4 15a8 8 0 0 0 13.5 3l3-3M21 20v-5h-5'),
  'redo-alt': path('M19.5 8.5a8 8 0 1 0 0 7M15 8.5h5v-5'),
  'rotate-left': path('M4.5 8.5a8 8 0 1 1 0 7M9 8.5H4v-5'),
  shuffle: path('M3 6h2c5 0 8 12 13 12h3m-4-4 4 4-4 4M3 18h2c1.5 0 3-1.3 4.3-3.2M14.7 9.2C16 7.3 17 6 19 6h2m-4-4 4 4-4 4'),
  check,
  'check-circle': circle(12, 12, 9) + path('m7.5 12 3 3 6-6'),
  'times-circle': circle(12, 12, 9) + path('m9 9 6 6m0-6-6 6'),
  'exclamation-circle': circle(12, 12, 9) + path('M12 7v6m0 3.5v.1'),
  'exclamation-triangle': path('m10.5 4.5-8 14A1.6 1.6 0 0 0 4 21h16a1.6 1.6 0 0 0 1.5-2.5l-8-14a1.7 1.7 0 0 0-3 0ZM12 9v5m0 3.5v.1'),
  circle: circle(12, 12, 6, ' fill="currentColor" stroke="none"'),
  plus: path('M12 5v14M5 12h14'),
  star: path('m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'),
  phone: path('m5.5 3.5 4 4-2 3c1.2 2.7 3.3 4.8 6 6l3-2 4 4-1.8 2a3 3 0 0 1-3 .5A21 21 0 0 1 3 8.3a3 3 0 0 1 .5-3Z'),
  envelope: rect(3, 5, 18, 14, 2.5) + path('m3.5 6.5 7 6a2.3 2.3 0 0 0 3 0l7-6'),
  comments: path('M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 1.5 1.5-5a8.5 8.5 0 1 1 16-4Z') + path('M8 10h8m-8 4h5'),
  'paper-plane': path('m3 10 18-7-7 18-3.2-7.8L3 10Zm7.8 3.2L21 3'),
  'share-alt': circle(18, 5, 2.5) + circle(6, 12, 2.5) + circle(18, 19, 2.5) + path('m8.2 10.7 7.6-4.4m-7.6 7 7.6 4.4'),
  'location-dot': pin,
  'map-location-dot': path('m3 7 6-2 6 2 6-2v15l-6 2-6-2-6 2ZM9 5v15m6-9v11') + path('M19 5c0 3-4 6-4 6s-4-3-4-6a4 4 0 1 1 8 0Z'),
  clock: circle(12, 12, 9) + path('M12 6.5V12l4 2.5'),
  'calendar-days': calendar + path('M7.5 14.5h1m3 0h1m3 0h1m-9 3h1m3 0h1'),
  download: path('M12 3v12m-5-5 5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3'),
  'cloud-upload-alt': path('M7 17H6a4 4 0 0 1-1-7.9A7 7 0 0 1 18.5 8 4.5 4.5 0 0 1 18 17h-1M12 21V11m-4 4 4-4 4 4'),
  'file-pdf': path(
    'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6M8 16c4.8-1 7-3.5 5.5-5.5-1.5 1 0 6 3.5 6-1.5-2.5-8.5-2.5-9 1-.2 1.5 2-.2 3-2',
  ),
  lock: rect(5, 10, 14, 11, 2.5) + path('M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2'),
  'sign-out-alt': path('M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M10 12h11m-4-4 4 4-4 4'),
  gear:
    path('m10 3-.7 2.5-2 .9-2.3-.7-2 3.5L5 11v2l-2 1.8 2 3.5 2.3-.7 2 .9.7 2.5h4l.7-2.5 2-.9 2.3.7 2-3.5-2-1.8v-2l2-1.8-2-3.5-2.3.7-2-.9L14 3Z') +
    circle(12, 12, 3),
  pen: path('m14.5 5.5 4 4M4 20l4.5-1 12-12a2.8 2.8 0 0 0-4-4l-12 12Z'),
  'trash-alt': path('M3.5 6.5h17M9 6.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5M5.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5l1-13M10 10.5v6m4-6v6'),
  image: rect(3, 3, 18, 18, 2.5) + circle(8, 8, 1.5) + path('m3 17 5-5 4 4 4-7 5 8'),
  film: rect(3, 4, 18, 16) + path('M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4'),
  'magnifying-glass': circle(10.5, 10.5, 6.5) + path('m15.5 15.5 5 5'),
  eye: path('M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z') + circle(12, 12, 3),
  list: path('M9 6h12M9 12h12M9 18h12M3 6h.1M3 12h.1M3 18h.1'),
  'list-check': path('m2.5 6 1.5 1.5 3-3M10 6h11m-18.5 6L4 13.5l3-3M10 12h11m-18.5 6L4 19.5l3-3M10 18h11'),
  'grip-lines': path('M5 9h14M5 15h14'),
  bold: path('M7 4h6a4 4 0 0 1 0 8H7m0-8v16h7a4 4 0 0 0 0-8H7', ' stroke-width="2.5"'),
  italic: path('M10 4h9M5 20h9M15 4 9 20'),
  flask: path('M9 3h6M10 3v6l-6 10a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7 15h10'),
  book: book,
  'book-open-reader': path('M12 10v11M3.5 8c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v11c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z') + circle(12, 4, 2),
  music: path('M10 17V5l10-2v12M10 8l10-2') + `<ellipse cx="7" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>`,
  heart,
  'hand-holding-heart':
    path('M3 15h4l3 3h5a1.5 1.5 0 0 0 0-3h-3l-3-3H5m-2 0v9m4-1h9l5-5') + path('M15 11s-4-2.5-4-5a2.3 2.3 0 0 1 4-1.3A2.3 2.3 0 0 1 19 6c0 2.5-4 5-4 5Z'),
  'hands-holding': path('M3 10v7l5 4h8l5-4v-7M7 9v6l3 2m7-8v6l-3 2M3 10a2 2 0 0 1 4 0m10 0a2 2 0 0 1 4 0M10 17h4') + path('m9 7 3-4 3 4'),
  handshake: path('m2.5 8 4-4 4 1 4-1 7 5-4 8-4 4-6-4-5-7M6.5 4l4 1-3 4 2 2 4-3 5 4m-5 4 3 2m-6-4 3 2'),
  person,
  child: circle(12, 5, 2.3) + path('m5 10 7 2 7-2m-7 0v4m0 0-4 6m4-6 4 6'),
  baby: circle(12, 12, 8) + path('M12 4c3-3 5 1 2 2M4 11a2 2 0 0 0 0 4m16-4a2 2 0 0 1 0 4M9 11v.1m6-.1v.1m-6 4c2 2 4 2 6 0'),
  users: circle(9, 7, 3) + path('M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 4v3'),
  'universal-access': circle(12, 12, 9) + circle(12, 7, 1.2) + path('m6.5 10 5.5 1 5.5-1M12 11v4m0 0-3 4m3-4 3 4'),
  school: path('M3 21V10h5m8 0h5v11M8 21V7l4-4 4 4v14M10 21v-5h4v5M11 9h2M5 14v2m14-2v2M2 21h20'),
  'graduation-cap': path('m2 8 10-5 10 5-10 5ZM6 10v7c4 3 8 3 12 0v-7m4-2v9'),
  'chalkboard-user': rect(7, 3, 14, 13) + circle(7, 12, 3) + path('M2 21v-1a5 5 0 0 1 10 0v1M12 7h5m-4 4h4m-2 5v5m-2 0h4'),
  'house-user': path('m2.5 11 9.5-8 9.5 8M5 9v12h14V9') + circle(12, 12, 2) + path('M8.5 20a3.5 3.5 0 0 1 7 0'),
  'masks-theater': path(
    'M3 4c4 1.5 7 1.5 11 0v6c0 4-5.5 7-5.5 7S3 14 3 10Zm2.5 4h.1m5-.1h.1M6 11c1.5 1.5 3.5 1.5 5 0M15 8l6-1v6c0 4-5.5 8-5.5 8l-3-2m3.5-8h.1m2.5 5c-1-1-2-1-3 0',
  ),
  'champagne-glasses': path('m4 3 6 2-2 6a3 3 0 0 1-6-2Zm1 10-2 6m-2-1 4 1M20 3l-6 2 2 6a3 3 0 0 0 6-2Zm-1 10 2 6m-2 1 4-1M11 3l1 2 1-2'),
  'shoe-prints': path('M8 3C4 2 2 8 4 12l4 1 2-6c.6-2-.5-3.5-2-4ZM4 15l4 1-1 4-4-1ZM17 5c4 0 5 6 2 9h-4l-1-6c-.3-2 1.5-3 3-3Zm-2 12h4v4h-4Z'),
  dumbbell: path('M3 9v6m3-9v12M6 12h12m0-6v12m3-9v6'),
  spa: path('M12 21C5 20 3 15 3 10c4 0 7 2 9 5 2-3 5-5 9-5 0 5-2 10-9 11Zm0-6C7 10 9 6 12 3c3 3 5 7 0 12Z'),
  seedling: path('M12 21v-8C5 14 3 9 3 5c6 0 9 2 9 8m0 2c0-6 3-10 9-10 0 6-2 10-9 10'),
  leaf: path('M4 20C0 9 8 3 21 3c0 12-6 20-17 17Zm0 0L17 7'),
  feather: path('M4 21 18 5M7 17C0 8 12 1 19 3c4 7-1 15-9 15m0-6h6m-3-5v4'),
  wind: path('M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h6a2.5 2.5 0 1 1-2.5 2.5'),
  fire: path('M13 2c1 5-3 5-2 9 1 1 3-1 3-3 4 3 6 6 5 9a7 7 0 0 1-14 0c-1-4 2-7 4-10 0 3 2 3 2 3-2-3 0-6 2-8Z'),
  bolt: path('m14 2-11 12h8l-1 8 11-12h-8Z'),
  lightbulb: path('M8 16a7 7 0 1 1 8 0v3H8Zm0 3h8m-6 3h4M12 12v4m-3-6 3 2 3-2'),
  brain: path(
    'M12 5a3 3 0 0 0-6-1A4 4 0 0 0 3 11a4 4 0 0 0 2 7 3.5 3.5 0 0 0 7 1V5Zm0 0a3 3 0 0 1 6-1 4 4 0 0 1 3 7 4 4 0 0 1-2 7 3.5 3.5 0 0 1-7 1M6 8l3 1m-5 4 4-1m-1 5 2-3m9-6-3 1m5 4-4-1m1 5-2-3',
  ),
  bullseye: circle(12, 12, 9) + circle(12, 12, 5) + circle(12, 12, 1, ' fill="currentColor"'),
  compass: circle(12, 12, 9) + path('m16 8-2.5 5.5L8 16l2.5-5.5Z'),
  route: circle(5, 5, 2) + circle(19, 19, 2) + path('M9 5h8a4 4 0 0 1 0 8H7a4 4 0 0 0 0 8h6'),
  'scale-balanced': path('M12 3v18M5 5h14M3 21h18M5 5l-4 9h8Zm14 0-4 9h8ZM1 14a4 4 0 0 0 8 0m6 0a4 4 0 0 0 8 0'),
  'ruler-combined': path('M3 3h6v12h12v6H3ZM6 7h3M6 11h3m4 7v3m4-3v3'),
  'layer-group': path('m2 8 10-5 10 5-10 5Zm0 5 10 5 10-5M2 17l10 5 10-5'),
  'puzzle-piece': path('M9 3H3v6h2a2 2 0 1 1 0 4H3v8h7v-2a2 2 0 1 1 4 0v2h7v-7h-2a2 2 0 1 1 0-4h2V3h-8v2a2 2 0 1 1-4 0Z'),
  hand: path('M7 12V5a1.5 1.5 0 0 1 3 0m0 7V3.5a1.5 1.5 0 0 1 3 0V12m0-7a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v9a6 6 0 0 1-11 3l-4-6a1.5 1.5 0 0 1 2-2Z'),
  'ear-listen': path('M8 17c0 5 6 5 6 0 0-3 4-3 4-8A6 6 0 0 0 6 9m3 1a3 3 0 0 1 6 0c0 2-3 2-3 4M21 5c2 3 2 6 0 9'),
  headphones: path('M4 14v-3a8 8 0 0 1 16 0v3') + rect(3, 12, 4, 8) + rect(17, 12, 4, 8),
  fingerprint: path('M4 10a8 8 0 0 1 16 0v3m-16 1v3m3-7a5 5 0 0 1 10 0v5c0 2 1 3 2 4M10 21c2-3 3-6 3-11a1 1 0 0 0-2 0c0 4-.5 7-3 9m-1-5v-3m9 10-2-4'),
  instagram: rect(3.5, 3.5, 17, 17, 5) + circle(12, 12, 4) + circle(17.2, 6.8, 0.8, ' fill="currentColor" stroke="none"'),
  facebook: path('M14.5 21V12h4l.5-4h-4.5V6c0-1.5.5-2 2-2H19V1.5h-3c-3.5 0-5.5 2-5.5 5.5v1H7v4h3.5v9'),
  whatsapp:
    path('M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 1.5 1.5-5a8.5 8.5 0 1 1 16-4Z') + path('m9 7.5-1.5 1c-.5 3 2 5.5 5 6l1.5-1.5-2-1.5-1 1c-1.5-.5-2.5-1.5-3-3l1-1Z'),
  google: path('M20 7a8.5 8.5 0 1 0 1 5h-8m8 0v6'),
  apple: path('M12 7c-3-3-8-1-8 4 0 5 3 10 5 10 1.5 0 2-1 3-1s1.5 1 3 1c2 0 4-3 5-6-4-2-4-5 0-7-3-3-6-3-8-1Zm0-3c0-2 2-3 4-3 0 2-2 4-4 4Z'),
  paypal: path('m5 21 3-18h7c8 0 6 10 0 10H8m0 8 2-12h7c5 0 4 8-2 8h-4'),
};

export const aliases = {
  times: 'xmark',
  'external-link-alt': 'arrow-up-right-from-square',
  'calendar-alt': 'calendar-days',
  'map-marker-alt': 'location-dot',
  search: 'magnifying-glass',
  'book-open': 'book',
  'list-ul': 'list',
};

export function svg(name, { filled = false } = {}) {
  const canonical = aliases[name] ?? name;
  if (!icons[canonical]) throw new Error(`Icona InBallet sconosciuta: ${name}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[canonical]}</svg>`;
}
