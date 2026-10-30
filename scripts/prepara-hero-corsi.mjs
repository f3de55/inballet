/** Preparazione dei banner: le persone provengono sempre dalla foto originale.
 * Imagegen completa soltanto l'ambiente esterno al rettangolo fotografico.
 * Intermedi e prompt sono in output/hero-banners; i PNG finali in src/assets/images/hero-corsi.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const work = path.join(root, 'output/hero-banners');
const dest = path.join(root, 'src/assets/images/hero-corsi');
const manifestPath = path.join(work, 'manifest.json');
const dataPath = path.join(root, 'src/data/corsi.json');
const [mode, slug, generated] = process.argv.slice(2);

if (mode === 'prepare') {
  if (await fs.stat(manifestPath).catch(() => null)) throw new Error('Manifesto già presente: usa finish, verify, review o apply per conservare il lavoro esistente.');
  await fs.mkdir(work, { recursive: true });
  await fs.mkdir(dest, { recursive: true });
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const tasks = [];
  for (const [course, item] of Object.entries(data)) {
    if (typeof item.heroImage !== 'string') continue;
    const shared = tasks.filter((t) => t.original === item.heroImage);
    if (shared.length) { shared.forEach((t) => t.courses.push(course)); continue; }
    const original = item.heroImage;
    const source = path.join(root, 'src', original);
    const tabletOnly = course === 'danza-contemporanea';
    for (const format of (tabletOnly ? ['tablet'] : ['desktop', 'tablet'])) {
    let photograph = sharp(source);
    // Questo desktop è già pronto: per il tablet conserviamo tutto il gruppo,
    // eliminando soltanto una parte del fondale vuoto a sinistra.
    if (tabletOnly) photograph = photograph.extract({ left: 1500, top: 0, width: 2340, height: 1200 });
    const resize = format === 'desktop' ? { height: 800 } : { width: 1120, height: 900, fit: 'inside' };
    const photo = await photograph.resize(resize).png().toBuffer();
    const meta = await sharp(photo).metadata();
    const canvas = format === 'desktop' ? { width: 2560, height: 800 } : { width: 1600, height: 1000 };
    const left = canvas.width - meta.width;
    const top = Math.round((canvas.height - meta.height) / 2);
    const input = path.join(work, `${course}-${format}-canvas.png`);
    await sharp({ create: { ...canvas, channels: 3, background: '#e5e5e5' } })
      .composite([{ input: photo, left, top }]).png().toFile(input);
    const prompt = `Use case: identity-preserve. Photographic OUTPAINT ONLY. Edit target: the supplied ${canvas.width}x${canvas.height} ${format} hero banner. There is one ORIGINAL real photograph at the right, occupying x=${left}..${canvas.width}, y=${top}..${top + meta.height}; the rest is flat light gray EMPTY CANVAS TO FILL. This photograph is already placed at exactly the correct size and coordinates. Keep the entire existing photograph UNCHANGED: do not move it, resize it, zoom it, crop it, redraw it or alter its perspective. Generate ONLY the missing gray area by extending the empty room, stage, backdrop, mirror wall, ceiling and floor visible in the photograph. Preserve ALL existing faces, identities, expressions, bodies, limbs, hands, poses and clothing exactly; no added people or duplicated human silhouettes or reflections. Keep the original people fully visible in the right portion and leave the left portion empty for website text. Extend original light, texture, color and perspective seamlessly, without inventing distracting objects. No text, graphics, borders, blur, gradients, or gray placeholder. Deliver the full supplied canvas aspect ratio ${canvas.width / canvas.height}:1 with the photograph at exactly its current placement. This is blank-area restoration, not generating a new photo. ${format === 'desktop' ? 'The photograph already covers the FULL HEIGHT: extend ONLY to the LEFT, never zoom or add above or below.' : 'Keep the existing photo at its current size; extend its environment above, below and to the left, without enlarging or moving the people.'}`;
    tasks.push({ slug: `${course}-${format}`, course, format, courses: [course], original, source, input, canvas, resize, patch: { left, top, width: meta.width, height: meta.height }, tabletOnly, prompt });
    }
  }
  await fs.writeFile(manifestPath, JSON.stringify(tasks, null, 2) + '\n');
  console.log(tasks.map(({ slug, courses, input, tabletOnly }) => ({ slug, courses, input, tabletOnly })));
} else if (mode === 'finish') {
  const tasks = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const task = tasks.find((t) => t.slug === slug);
  if (!task) throw new Error(`Corso sconosciuto: ${slug}`);
  let photograph = sharp(task.source);
  if (task.tabletOnly) photograph = photograph.extract({ left: 1500, top: 0, width: 2340, height: 1200 });
  const photo = await photograph.resize(task.resize).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Sfumatura sul solo margine sinistro del fondale; il resto della foto,
  // comprese le persone, viene ripreso dall'originale ridimensionato.
  const feather = task.course === 'ragazzi' ? 8 : Math.min(100, Math.round(task.patch.width * .08));
  const topFade = task.format === 'tablet' ? ({ adulti: 35, bambini: 20, breaking: 25, classi: 30, 'contact-improvisation': 70, contaminato: 25, 'danza-contemporanea': 70, heels: 60, 'hip-hop': 35, 'lezioni-individuali': 8, 'movimento-creativo': 60, pilates: 25, 'prima-infanzia': 60, ragazzi: 40 }[task.course] ?? 0) : 0;
  const bottomFade = task.format === 'tablet' ? ({ breaking: 8, classi: 60, 'contact-improvisation': 55, contaminato: 25, 'danza-acrobatica': 25, 'danza-contemporanea': 40, heels: 40, 'movimento-creativo': 12, 'prima-infanzia': 12, ragazzi: 5, yoga: 50 }[task.course] ?? 0) : 0;
  const rightFade = task.patch.left + task.patch.width < task.canvas.width ? 24 : 0;
  for (let y = 0; y < photo.info.height; y++) {
    for (let x = 0; x < photo.info.width; x++) {
      let alpha = Math.min(1, x / feather);
      if (topFade) alpha = Math.min(alpha, y / topFade);
      if (bottomFade) alpha = Math.min(alpha, (photo.info.height - 1 - y) / bottomFade);
      if (rightFade) alpha = Math.min(alpha, (photo.info.width - 1 - x) / rightFade);
      photo.data[(y * photo.info.width + x) * 4 + 3] = Math.round(255 * Math.max(0, alpha));
    }
  }
  const patch = await sharp(photo.data, { raw: photo.info }).png().toBuffer();
  const background = task.backgroundPlate ? sharp(generated).trim({ background: '#000', threshold: 5 }) : sharp(generated);
  const normalized = await background.resize(task.canvas.width, task.canvas.height, { fit: 'fill' }).png().toBuffer();
  await sharp(normalized).composite([{ input: patch, left: task.patch.left, top: task.patch.top }]).png().toFile(path.join(dest, `${slug}.png`));
  task.generated = generated;
  task.output = path.join(dest, `${slug}.png`);
  task.generator = 'imagegen (built-in), con ricomposizione della foto originale';
  task.blend = { left: feather, right: rightFade, top: topFade, bottom: bottomFade };
  task.finished = true;
  await fs.writeFile(manifestPath, JSON.stringify(tasks, null, 2) + '\n');
  console.log(`${slug}: ${task.canvas.width}x${task.canvas.height} pronto`);
} else if (mode === 'apply') {
  const tasks = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (tasks.some((t) => !t.finished)) throw new Error('Alcuni banner non sono ancora completati');
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  for (const task of tasks) {
    for (const course of task.courses) {
      const item = data[course];
      item.heroImage = {
        desktop: task.tabletOnly ? task.original : `assets/images/hero-corsi/${task.course}-desktop.png`,
        tablet: `assets/images/hero-corsi/${task.course}-tablet.png`,
        mobile: task.original,
      };
      item.heroFuoco = { desktop: task.tabletOnly ? item.heroFuoco?.desktop ?? '50% 50%' : '100% 50%', tablet: '100% 50%', ...(item.heroFuoco?.mobile ? { mobile: item.heroFuoco.mobile } : {}) };
    }
  }
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2) + '\n');
  console.log('Banner collegati ai corsi; coppie già pronte conservate.');
} else if (mode === 'verify') {
  const tasks = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  let pixels = 0;
  for (const task of tasks) {
    if (!task.finished) throw new Error(`Banner mancante: ${task.slug}`);
    const target = path.join(dest, `${task.slug}.png`);
    const meta = await sharp(target).metadata();
    if (meta.width !== task.canvas.width || meta.height !== task.canvas.height) throw new Error(`Formato errato: ${task.slug}`);
    const feather = Math.min(100, Math.round(task.patch.width * .08));
    let original = sharp(task.source);
    if (task.tabletOnly) original = original.extract({ left: 1500, top: 0, width: 2340, height: 1200 });
    const photo = await original.resize(task.resize).png().toBuffer();
    const blend = task.blend ?? { left: feather, right: 0, top: 0, bottom: 0 };
    const crop = { left: blend.left, top: blend.top, width: task.patch.width - blend.left - blend.right, height: task.patch.height - blend.top - blend.bottom };
    const expected = await sharp(photo).extract(crop).removeAlpha().raw().toBuffer();
    const actual = await sharp(target).extract({ ...crop, left: task.patch.left + blend.left, top: task.patch.top + blend.top }).removeAlpha().raw().toBuffer();
    if (!expected.equals(actual)) throw new Error(`Pixel originali alterati: ${task.slug}`);
    pixels += expected.length / 3;
  }
  console.log(`${tasks.length} banner: dimensioni corrette; ${pixels} pixel della foto originale verificati, escluso il margine sfumato del fondale.`);
} else if (mode === 'review') {
  const tasks = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const courses = [...new Set(tasks.map((t) => t.course))];
  for (let page = 0; page < Math.ceil(courses.length / 4); page++) {
    const group = courses.slice(page * 4, page * 4 + 4);
    const layers = [];
    for (let row = 0; row < group.length; row++) {
      const course = group[row];
      const label = Buffer.from(`<svg width="1120" height="28"><rect width="1120" height="28" fill="white"/><text x="8" y="21" font-family="Arial" font-size="17">${course}: desktop / tablet</text></svg>`);
      layers.push({ input: label, left: 0, top: row * 278 });
      for (const [format, left, width, height] of [['desktop', 0, 720, 225], ['tablet', 720, 400, 250]]) {
        const task = tasks.find((t) => t.course === course && t.format === format);
        const source = task?.finished ? path.join(dest, `${task.slug}.png`) : course === 'danza-contemporanea' && format === 'desktop' ? path.join(root, 'src/assets/images/hero-danza-contemporanea.jpg') : null;
        if (source) layers.push({ input: await sharp(source).resize(width, height, { fit: 'contain', background: '#eee' }).png().toBuffer(), left, top: row * 278 + 28 });
      }
    }
    await sharp({ create: { width: 1120, height: group.length * 278, channels: 3, background: '#eee' } }).composite(layers).png().toFile(path.join(work, `revisione-${page + 1}.png`));
  }
  console.log('Tavole di controllo generate.');
} else {
  throw new Error('Uso: node scripts/prepara-hero-corsi.mjs prepare | finish <slug-formato> <output-imagegen> | verify | review | apply');
}
