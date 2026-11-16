const shape = (d) => `<path d="${d}"/>`;
const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const box = (x, y, width, height, radius = 1.5) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/>`;
const turn = (markup, angle) => `<g transform="rotate(${angle} 12 12)">${markup}</g>`;
const segment = (x1, y1, x2, y2, width = 3) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return `<rect x="${x1 - width / 2}" y="${y1 - width / 2}" width="${length + width}" height="${width}" rx="${width / 2}" transform="rotate(${angle} ${x1} ${y1})"/>`;
};
const limbs = (points, width = 3) =>
  points
    .slice(1)
    .map((p, i) => segment(...points[i], ...p, width))
    .join('');
const person = dot(12, 4, 3) + box(9.5, 8, 5, 8) + segment(12, 10, 4, 8) + segment(12, 10, 20, 8) + segment(11, 15, 7, 21) + segment(13, 15, 17, 21);
const check = shape('m2 11 3-3 5 5L19 3l3 3-12 14Z');
const cross = shape('m5 2 7 7 7-7 3 3-7 7 7 7-3 3-7-7-7 7-3-3 7-7-7-7Z');
const arrow = shape('M2 10h12l-4-4 3-3 9 9-9 9-3-3 4-4H2Z');
const book = shape('M2 3c4-1 7 0 9 2v17c-3-2-6-3-9-2Zm11 2c2-2 5-3 9-2v17c-3-1-6 0-9 2Z');
const calendar = shape(
  'M7 1a1.5 1.5 0 0 1 1.5 1.5V4h7V2.5a1.5 1.5 0 0 1 3 0V4H20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1.5V2.5A1.5 1.5 0 0 1 7 1ZM5 8v2h14V8Zm1 5v3h3v-3Zm5 0v3h3v-3Zm5 0v3h3v-3ZM6 18v2h3v-2Zm5 0v2h3v-2Z',
);
const pin = shape('M12 1a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z');
const heart = shape('M12 22S1 15 1 8a6 6 0 0 1 11-3A6 6 0 0 1 23 8c0 7-11 14-11 14Z');
const music = shape('M10 3 22 1v16c0 3-3 5-6 4-4-1-2-7 3-6V7l-6 1v11c0 3-3 5-6 4-4-1-2-7 3-6Z');
const ring = (cx, cy, outer, inner) =>
  shape(
    `M${cx - outer} ${cy}a${outer} ${outer} 0 1 0 ${outer * 2} 0 ${outer} ${outer} 0 1 0 ${-outer * 2} 0Zm${outer - inner} 0a${inner} ${inner} 0 1 1 ${inner * 2} 0 ${inner} ${inner} 0 1 1 ${-inner * 2} 0Z`,
  );

export const icons = {
  bars: box(2, 5, 20, 4, 2) + box(6, 15, 16, 4, 2),
  xmark: cross,
  'arrow-right': arrow,
  'arrow-left': turn(arrow, 180),
  'arrow-up': turn(arrow, -90),
  'arrow-down': turn(arrow, 90),
  'chevron-right': shape('m6 2 11 10L6 22l-3-3 8-7-8-7Z'),
  'chevron-left': shape('m18 2 3 3-8 7 8 7-3 3L7 12Z'),
  'chevron-down': shape('m2 6 3-3 7 8 7-8 3 3-10 11Z'),
  'arrow-up-right-from-square': shape('M13 2h9v9h-3V7l-8 8-3-3 8-7h-3ZM4 4h6v3H5v12h12v-5h3v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'),
  'arrows-left-right': shape('m7 3 3 3-4 4h12l-4-4 3-3 7 9-7 9-3-3 4-4H6l4 4-3 3-7-9Z'),
  'arrows-up-down-left-right': box(10, 4, 4, 16) + box(4, 10, 16, 4) + shape('m12 0 6 6H6ZM0 12l6-6v12Zm24 0-6 6V6ZM12 24l-6-6h12Z'),
  'arrow-trend-up': shape('M13 2h9v9h-3V7l-6 8-4-4-6 9-3-2L9 5l4 4 3-4h-3Z'),
  expand: shape('M2 2h8v3H5v5H2ZM14 2h8v8h-3V5h-5ZM2 14h3v5h5v3H2Zm17 0h3v8h-8v-3h5Z'),
  compress: shape('M7 1h3v9H1V7h6Zm7 0h3v6h6v3h-9ZM1 14h9v9H7v-6H1Zm13 0h9v3h-6v6h-3Z'),
  'arrows-rotate': shape('M12 2a10 10 0 0 1 8 4V2h3v9h-9V8h4a7 7 0 0 0-12-1L3 5a10 10 0 0 1 9-3ZM1 13h9v3H6a7 7 0 0 0 12 1l3 2a10 10 0 0 1-17-1v4H1Z'),
  'redo-alt': shape('M12 2a10 10 0 0 1 7 3V1h3v10h-10V8h5a7 7 0 1 0 1 8l3 2a10 10 0 1 1-9-16Z'),
  'rotate-left': shape('M12 2a10 10 0 0 0-7 3V1H2v10h10V8H7a7 7 0 1 1-1 8l-3 2a10 10 0 1 0 9-16Z'),
  shuffle: shape(
    'M17 1 24 6l-7 5V8h-1c-4 0-7 12-13 12H1v-4h2c4 0 7-12 13-12h1ZM1 4h2c3 0 5 2 7 5l-2 4C6 9 5 8 3 8H1Zm16 9 7 5-7 5v-3h-1c-3 0-5-2-7-5l2-4c2 4 3 5 5 5h1Z',
  ),
  check,
  'check-circle': shape('M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22ZM6 10l4 4 8-8 2 2-10 10-6-6Z'),
  'times-circle': shape('M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22ZM8 6l4 4 4-4 2 2-4 4 4 4-2 2-4-4-4 4-2-2 4-4-4-4Z'),
  'exclamation-circle': shape('M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm-1.5 5h3v8h-3Zm0 10h3v3h-3Z'),
  'exclamation-triangle': shape('M10 2a2.3 2.3 0 0 1 4 0l9 17a2 2 0 0 1-2 3H3a2 2 0 0 1-2-3Zm.5 5v7h3V7Zm0 10v3h3v-3Z'),
  circle: dot(12, 12, 8),
  plus: box(10, 2, 4, 20) + box(2, 10, 20, 4),
  star: shape('m12 1 3.4 7 7.6 1.1-5.5 5.3 1.3 7.6-6.8-3.6L5.2 22l1.3-7.6L1 9.1 8.6 8Z'),
  heart,
  phone: shape('m6 1 4 5c.5.6.5 1.3 0 2l-2 2a17 17 0 0 0 6 6l2-2c.7-.5 1.4-.5 2 0l5 4c-1 6-5 6-9 4A25 25 0 0 1 2 10C0 6 0 2 6 1Z'),
  envelope: shape('M4 3h16a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 3 8 7 8-7-2-1-6 5-6-5Z'),
  comments: shape('M12 1a10 10 0 0 0-9 15L1 23l7-2A10 10 0 1 0 12 1ZM6 7v3h12V7Zm0 6v3h9v-3Z'),
  'paper-plane': shape('M1 9 23 1l-8 22-4-9Zm11 3L20 4 8 11Z'),
  'share-alt': segment(7, 11, 17, 5, 3.5) + segment(7, 13, 17, 19, 3.5) + dot(18.5, 4.5, 3.5) + dot(5, 12, 4) + dot(18.5, 19.5, 3.5),
  'location-dot': pin,
  'map-location-dot':
    shape('m1 6 7-2v16l-7 3Zm9 3 4 3v11l-4-3Zm6 7 7-7v11l-7 3Z') +
    shape('M17 1a6 6 0 0 0-6 6c0 4 6 9 6 9s6-5 6-9a6 6 0 0 0-6-6Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z'),
  clock: shape('M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22ZM10.5 5h3v6l5 3-1.5 2.5-6.5-4Z'),
  'calendar-days': calendar,
  download: shape('M10 1h4v10h5l-7 8-7-8h5ZM1 17h4v4h14v-4h4v6H1Z'),
  'cloud-upload-alt': shape('M7 19H6a6 6 0 0 1-1-12A8 8 0 0 1 20 6a6.5 6.5 0 0 1-1 13h-2v-4h4l-9-9-9 9h4Z') + shape('m12 9 6 6h-4v8h-4v-8H6Z'),
  'file-pdf': shape(
    'M5 1h9l7 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Zm9 2v6h6ZM6 12v8h2v-3h1a2.5 2.5 0 0 0 0-5Zm2 2h1v1H8Zm4-2v8h3c4 0 4-8 0-8Zm2 2h1c1.5 0 1.5 4 0 4h-1Zm4-2v8h2v-3h2v-2h-2v-1h2v-2Z',
  ),
  lock: shape('M5 9V7a7 7 0 0 1 14 0v2h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Zm3 0h8V7a4 4 0 0 0-8 0Zm2.5 4v6h3v-6Z'),
  'sign-out-alt': shape('M3 1h9v4H5v14h7v4H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Zm13 4 8 7-8 7v-5H8v-4h8Z'),
  gear: shape('m9 1-1 3-2 1-3-1-3 5 3 2v2l-3 2 3 5 3-1 2 1 1 3h6l1-3 2-1 3 1 3-5-3-2v-2l3-2-3-5-3 1-2-1-1-3Zm3 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z'),
  pen: shape('m17 1 6 6-3 3-6-6ZM2 16 12 6l6 6L8 22l-7 1Z'),
  'trash-alt': shape('M8 1h8l1 3h6v3H1V4h6ZM3 9h18l-2 14H5Zm4 3 1 8h2l-1-8Zm8 0-1 8h2l1-8Z'),
  image: shape('M4 1h16a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Zm3 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM4 19h16l-5-8-5 5-3-3Z'),
  film: shape(
    'M3 2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v3h3V5Zm0 6v3h3v-3Zm0 6v3h3v-3ZM18 5v3h3V5Zm0 6v3h3v-3Zm0 6v3h3v-3ZM9 7v10l7-5Z',
  ),
  'magnifying-glass': ring(10, 10, 9, 5.5) + segment(16, 16, 21, 21, 4),
  eye: shape('M0 12S4 3 12 3s12 9 12 9-4 9-12 9S0 12 0 12Zm12-6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z') + dot(12, 12, 3.5),
  list: dot(3, 5, 2) + dot(3, 12, 2) + dot(3, 19, 2) + box(8, 3, 15, 4) + box(8, 10, 15, 4) + box(8, 17, 15, 4),
  'list-check':
    shape('m0 4 2-2 2 2 3-3 2 2-5 5Zm0 7 2-2 2 2 3-3 2 2-5 5Zm0 7 2-2 2 2 3-3 2 2-5 5Z') + box(11, 3, 12, 4) + box(11, 10, 12, 4) + box(11, 17, 12, 4),
  'grip-lines': box(3, 6, 18, 4, 2) + box(3, 14, 18, 4, 2),
  bold: shape('M5 1h9a6 6 0 0 1 4 10c6 3 4 12-3 12H5Zm4 4v5h5c3 0 3-5 0-5Zm0 9v5h6c3 0 3-5 0-5Z'),
  italic: shape('M10 1h13v4h-5l-7 14h5v4H3v-4h4l7-14h-4Z'),
  flask: shape('M7 1h10v3h-2v5l8 12a1.3 1.3 0 0 1-1 2H2a1.3 1.3 0 0 1-1-2L9 9V4H7Zm5 8-4 7h8Zm-5 10-1 2h3v-2Zm7-1v3h3v-3Z'),
  book,
  'book-open-reader': dot(12, 3, 3) + shape('M1 8c4-1 8 1 10 3v12c-3-2-6-3-10-2Zm12 3c2-2 6-4 10-3v13c-4-1-7 0-10 2Z'),
  music,
  'hand-holding-heart': shape('M15 13s-7-4-7-8a3.7 3.7 0 0 1 7-2 3.7 3.7 0 0 1 7 2c0 4-7 8-7 8ZM1 14h4v9H1Zm6 0h3l3 3h5c2 0 2 3 0 3h-6v1h6l4-4 2 2-5 5H7Z'),
  'hands-holding': shape('M0 9h3l2 8 3 3h8l3-3 2-8h3l-2 11-5 4H7l-5-4Zm6-1h3v6l3 2 3-2V8h3v8l-6 4-6-4Zm3-3 3-4 3 4-3 4Z'),
  handshake: shape('m0 7 4-3 4 8-4 6-4-3Zm20-3 4 3v8l-4 3-3-6ZM6 5l5-3h5l3 3-3 5-4-3-3 3-3-2Zm5 5 2-1 6 5-6 8-8-6 3-6 1 2Z'),
  person,
  child: dot(12, 4, 3.2) + box(9.5, 8, 5, 7) + segment(12, 10, 4, 7) + segment(12, 10, 20, 7) + segment(11, 14, 7, 21) + segment(13, 14, 17, 21),
  baby: shape(
    'M12 1a10 10 0 0 0-10 9c-3 0-3 6 0 6 3 10 17 10 20 0 3 0 3-6 0-6A10 10 0 0 0 12 1Zm-1 2c5-2 7 5 1 5V6c3 0 2-2 0-1ZM7 10v3h3v-3Zm7 0v3h3v-3Zm-7 6c2 6 8 6 10 0Z',
  ),
  users: dot(8, 5, 3.5) + dot(19, 6, 3) + shape('M1 22v-5a7 7 0 0 1 14 0v5Zm16-9a6 6 0 0 1 6 6v3h-6v-5c0-1.5-.2-2.5-.5-4Z'),
  'universal-access': shape(
    'M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-6 5 6 1 6-1 1 3-5 1 3 6-3 1-2-5-2 5-3-1 3-6-5-1Z',
  ),
  school: shape('m12 1 6 5v4h4v12H2V10h4V6Zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-1.5 11v5h3v-5ZM5 13v3h2v-3Zm12 0v3h2v-3Z'),
  'graduation-cap': shape('M0 7 12 1l12 6-12 6ZM4 12l8 4 8-4v7c-5 4-11 4-16 0ZM21 10h3v11h-3Z'),
  'chalkboard-user':
    shape('M9 1h12a2 2 0 0 1 2 2v13h-5v4h3v3H10v-3h5v-4h-4v-3h9V4H9Zm3 5h6v3h-6Z') +
    dot(4.5, 10, 3.3) +
    shape('M0 22v-4a4 4 0 0 1 4-4h3c3 0 4-3 6-5l3 2c-2 4-4 6-7 6v5Z'),
  'house-user': shape('m0 10 12-10 12 10-2 3-2-1v11H4V12l-2 1Zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 8a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Z'),
  'masks-theater': shape(
    'M1 2c5 2 10 2 15 0v8c0 5-7.5 9-7.5 9S1 15 1 10Zm3 5v2h3V7Zm6 0v2h3V7Zm-5 4a3.5 3.5 0 0 0 7 0ZM18 7l5-1v9c0 5-7 8-7 8l-4-2 3-3c2-2 3-4 3-7Zm0 10c2-2 3-2 4-1v-3c-1-1-2-1-3 0Z',
  ),
  'champagne-glasses': shape('M2 2h7v8a3.5 3.5 0 0 1-2 3v7h3v3H0v-3h4v-7a3.5 3.5 0 0 1-2-3Zm13 0h7v8a3.5 3.5 0 0 1-2 3v7h3v3H13v-3h4v-7a3.5 3.5 0 0 1-2-3Z'),
  'shoe-prints': shape('M8 1C2-1-1 8 2 13l7 2 3-9c1-3-1-5-4-5ZM2 16l7 2-2 6-7-2ZM18 3c6-1 8 8 4 13h-7L14 8c-.5-3 1-5 4-5Zm-3 16h7v5h-7Z'),
  dumbbell: box(8, 10, 8, 4) + box(0, 8, 3, 8) + box(4, 3, 5, 18) + box(15, 3, 5, 18) + box(21, 8, 3, 8),
  spa: shape('M12 0c-6 6-7 10 0 15 7-5 6-9 0-15ZM0 9c6 0 10 3 12 8 2-5 6-8 12-8 0 9-4 15-12 15S0 18 0 9Z'),
  seedling: shape('M0 2c10-1 14 4 11 12C3 15-1 9 0 2Zm24 0c-10-1-14 4-11 12 8 1 12-5 11-12ZM10 14h4v10h-4Z'),
  leaf: shape('M3 21C-1 9 8 2 22 2c0 14-7 22-19 19Zm1-2L18 7l-2-2L2 17Z'),
  feather: shape('M5 21C-3 10 9-1 21 1c5 12-5 23-14 18l-4 5-3-3L16 5l-2-2Z'),
  wind: shape('M15 1a5 5 0 1 1 0 10H1V7h14a1 1 0 1 0-1-1h-4a5 5 0 0 1 5-5Zm4 11a5 5 0 1 1-5 5h4a1 1 0 1 0 1-1H1v-4ZM1 18h8a3 3 0 1 1-3 3H1Z'),
  fire: shape('M13 0c4 5-2 8 0 11 2 1 3-2 3-4 5 4 7 8 5 12a10 10 0 0 1-18 0C0 13 4 8 8 4c-1 5 1 6 2 6-2-4 1-6 3-10ZM12 14c-6 6-4 9 0 9s6-3 0-9Z'),
  bolt: shape('m14 0-13 14h9l-1 10L23 9h-9Z'),
  lightbulb: shape('M12 0a9 9 0 0 0-6 16v4h12v-4a9 9 0 0 0-6-16Zm-2 9 2 2 2-2 2 2-3 3v4h-2v-4l-3-3ZM8 22h8v2H8Z'),
  brain: shape(
    'M10 1C7-1 4 2 4 5c-4 0-5 6-2 8-3 5 1 9 5 8 1 3 4 3 4 0V4c0-1 0-2-1-3Zm-5 8 4 1v3l-4-1Zm1 8 3-3v4l-2 2ZM14 1c3-2 6 1 6 4 4 0 5 6 2 8 3 5-1 9-5 8-1 3-4 3-4 0V4c0-1 0-2 1-3Zm1 9 4-1v3l-4 1Zm0 4 3 3-1 3-2-2Z',
  ),
  bullseye: ring(12, 12, 11, 8) + ring(12, 12, 5.5, 2.5) + dot(12, 12, 1),
  compass: shape('M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22ZM18 6l-4 8-8 4 4-8Zm-6 4-2 4 4-2Z'),
  route: dot(5, 5, 4) + dot(19, 19, 4) + shape('M10 3h7a6 6 0 0 1 0 12H7a2 2 0 0 0 0 4h6v4H7a6 6 0 0 1 0-12h10a2 2 0 0 0 0-4h-7Z'),
  'scale-balanced': shape(
    'M10 1h4v3h7v3h-7v14h7v3H3v-3h7V7H3V4h7ZM5 7l6 10H0Zm0 5-2 3h4Zm14-5 5 10H13Zm0 5-2 3h4ZM0 18h11a5.5 5.5 0 0 1-11 0Zm13 0h11a5.5 5.5 0 0 1-11 0Z',
  ),
  'ruler-combined': shape('M1 1h8v14h14v8H1Zm4 3v2h4V4Zm-1 5v2h5V9Zm1 5v2h4v-2Zm8 5v4h2v-4Zm5 0v4h2v-4Z'),
  'layer-group': shape('m12 0 12 7-12 7L0 7ZM0 12l3-2 9 6 9-6 3 2-12 7Zm0 5 3-2 9 6 9-6 3 2-12 7Z'),
  'puzzle-piece': shape('M1 2h7V1a3 3 0 1 1 6 0v1h8v7h-2a3 3 0 1 0 0 6h2v8h-8v-2a3 3 0 1 0-6 0v2H1v-8h2a3 3 0 1 0 0-6H1Z'),
  hand: shape('M6 11V4a2 2 0 0 1 3 0v7h1V2a2 2 0 0 1 3 0v9h1V3a2 2 0 0 1 3 0v8h1V6a2 2 0 0 1 3 0v10a8 8 0 0 1-14 5l-6-7a2 2 0 0 1 3-3l3 3Z'),
  'ear-listen': shape(
    'M11 1a9 9 0 0 0-9 9h4a5 5 0 0 1 10 0c0 4-5 4-5 8 0 3-4 3-4 0H3c0 8 12 8 12 0 0-2 5-3 5-8a9 9 0 0 0-9-9Zm0 6a3 3 0 0 0-3 3v5h3v-4h2V9a2 2 0 0 0-2-2ZM21 1c5 5 5 13 0 18l-2-3c3-3 3-9 0-12Z',
  ),
  headphones: shape('M12 1A11 11 0 0 0 1 12v7a4 4 0 0 0 4 4h3V12H5a7 7 0 0 1 14 0h-3v11h3a4 4 0 0 0 4-4v-7A11 11 0 0 0 12 1Z'),
  fingerprint: shape(
    'M12 0A11 11 0 0 0 1 11v5h3v-5a8 8 0 0 1 16 0v6h3v-6A11 11 0 0 0 12 0Zm0 5a6 6 0 0 0-6 6v6l-2 4 3 1 2-5v-6a3 3 0 0 1 6 0v6l3 6 3-2-3-4v-6a6 6 0 0 0-6-6Zm-1.5 5v8L8 23l3 1 2.5-5v-9Z',
  ),
  instagram:
    shape('M7 1h10a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6Zm5 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z') +
    dot(12, 12, 3),
  facebook: shape('M15 24V14h4l1-4h-5V7c0-2 1-2 3-2h2V1h-4c-4 0-6 3-6 7v2H6v4h4v10Z'),
  whatsapp: shape('M12 1A10 10 0 0 0 3 16l-2 7 7-2A10 10 0 1 0 12 1ZM8 6 6 8c0 5 4 9 9 10l3-3-4-3-2 2-3-3 2-2Z'),
  google: shape('M22 6 18 9A7 7 0 1 0 19 15h-7v-4h11c1 7-3 13-11 13A12 12 0 1 1 22 6Z'),
  apple: shape('M12 7C7 3 2 6 2 11c0 6 4 13 7 13l3-1 3 1c3 0 6-5 7-8-5-2-5-6 0-8-4-4-7-4-10-1Zm0-3c0-3 3-4 6-4 0 3-3 5-6 5Z'),
  paypal: shape('M6 1h9c11 0 8 13 0 13h-5l-2 9H2Zm4 4-1 6h5c4 0 5-6 1-6Zm9 8c4-1 6-4 6-4 2 8-3 12-9 12h-2l-1 3H9l2-7h5c2 0 3-2 3-4Z'),
  'yoga-pose':
    dot(12, 3.5, 3) +
    shape('m9 8 6 0 2 7-5 3-5-3Z') +
    limbs([
      [5, 10],
      [12, 12],
      [19, 10],
    ]) +
    shape('m6 14 5 5-7 2 8 1 8-1-7-2 5-5 5 5c3 4-1 5-4 5H5c-3 0-7-1-4-5Z'),
  'ballet-shoes': shape(
    'M7 1C3 1 0 9 1 16c0 5 3 7 6 6s5-5 5-10V5c0-3-2-5-5-4ZM6 5l3 1-1 7-4-1Zm12-2c-4-2-6 1-5 5l1 9c1 5 4 7 7 6s4-6 2-11c-1-4-2-8-5-9Zm-1 4 2-1 2 8-4 1Z',
  ),
  barre: box(1, 7, 22, 5) + box(4, 2, 4, 22) + box(16, 2, 4, 22),
  'body-posture':
    dot(9, 4, 3) +
    shape('M7 8h5l-1 7 3 7-4 2-4-10Z') +
    segment(5, 10, 14, 12, 3.5) +
    segment(9, 16, 6, 22, 3.5) +
    box(20, 1, 3, 4) +
    box(20, 7, 3, 4) +
    box(20, 13, 3, 4) +
    box(20, 19, 3, 4),
  floorwork:
    dot(4, 12, 3) +
    limbs(
      [
        [9, 13],
        [14, 13],
        [18, 6],
        [22, 10],
      ],
      3.5,
    ) +
    limbs(
      [
        [12, 14],
        [17, 19],
        [22, 19],
      ],
      3.5,
    ) +
    box(1, 22, 22, 2),
  balance:
    dot(12, 3, 3) +
    box(10, 7, 4, 8) +
    limbs(
      [
        [4, 7],
        [12, 10],
        [21, 5],
      ],
      3.5,
    ) +
    limbs(
      [
        [8, 22],
        [12, 14],
        [21, 12],
      ],
      3.5,
    ),
  'dance-turn':
    dot(12, 4, 3) +
    box(10, 8, 4, 8) +
    segment(6, 10, 18, 10, 3.5) +
    segment(12, 15, 8, 22, 3.5) +
    segment(12, 15, 16, 22, 3.5) +
    shape('M0 14V5h7v3H4v6Zm24-4v9h-7v-3h3v-6Z'),
  choreography:
    dot(3.5, 5, 3.5) + dot(20, 12, 3.5) + dot(3.5, 20, 3.5) + shape('M9 3h5a5.5 5.5 0 0 1 0 11h-2a2 2 0 0 0 0 4h10v4H12a6 6 0 0 1 0-12h2a1.5 1.5 0 0 0 0-3H9Z'),
  heels: shape('M6 1h6c-1 5 0 8 5 11l6 3v5H10c-2-4-4-6-5-7L4 24H1V10c0-4 3-7 5-9Z'),
  stage:
    shape('M0 1h24v5H0Zm1 5h5v13H1Zm17 0h5v13h-5ZM0 21h24v3H0Z') +
    dot(12, 9, 2.5) +
    box(10, 13, 4, 5) +
    segment(8, 13, 16, 13, 2.5) +
    segment(12, 17, 9, 20, 2.5) +
    segment(12, 17, 15, 20, 2.5),
  rhythm: box(1, 5, 6, 3) + box(1, 11, 4, 3) + box(1, 17, 6, 3) + shape('M13 4 23 1v7l-7 2v9c0 4-7 5-8 1-1-3 2-5 5-4Z'),
  'core-strength': shape('m5 1 7 2 7-2 5 6-6 4-1 13H7L6 11 0 7Zm5 9v4h4v-4Zm0 6v5h4v-5Z'),
  flexibility:
    dot(14, 3, 3) +
    shape('m11 7 4 3-6 6-7 6-2-3 7-7Z') +
    limbs(
      [
        [9, 14],
        [18, 21],
        [22, 21],
      ],
      3.5,
    ) +
    limbs(
      [
        [12, 8],
        [19, 12],
        [22, 10],
      ],
      3.5,
    ) +
    shape('M1 8V1h7v3H4v4Z'),
  breathing: shape('M10 0h4v7l3 3-2 2-3-3-3 3-2-2 3-3ZM9 8C4 7 1 14 1 20c0 4 7 5 10 1V10Zm6 0c5-1 8 6 8 12 0 4-7 5-10 1V10Z'),
  'partner-contact':
    dot(5, 3.5, 3) +
    dot(19, 3.5, 3) +
    limbs(
      [
        [3, 8],
        [8, 12],
        [12, 8],
        [16, 12],
        [21, 8],
      ],
      3.5,
    ) +
    limbs(
      [
        [4, 10],
        [7, 16],
        [3, 22],
      ],
      3.5,
    ) +
    segment(7, 16, 11, 22, 3.5) +
    limbs(
      [
        [20, 10],
        [17, 16],
        [21, 22],
      ],
      3.5,
    ) +
    segment(17, 16, 13, 22, 3.5),
  jump:
    dot(11, 3, 3) +
    limbs(
      [
        [3, 7],
        [11, 9],
        [19, 4],
      ],
      3.5,
    ) +
    limbs(
      [
        [11, 9],
        [15, 14],
        [6, 18],
      ],
      3.5,
    ) +
    segment(15, 14, 22, 18, 3.5) +
    box(2, 22, 20, 2),
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

export function svg(name) {
  const canonical = aliases[name] ?? name;
  if (!icons[canonical]) throw new Error(`Icona InBallet sconosciuta: ${name}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" stroke="none">${icons[canonical]}</svg>`;
}
