import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const work = path.join(root, 'output/hero-pagine');
const dest = path.join(root, 'src/assets/images/hero-pagine');
const manifest = path.join(work, 'manifest.json');
const [mode, slug, generated] = process.argv.slice(2);
const sources = {
  'chi-siamo': 'gallery-7.jpg',
  corsi: 'gallery-3.jpg',
  contatti: 'foto/sede-lainate.jpg',
  'classi-integrate': 'gallery-9.jpg',
  'formazioni-personalizzate': 'foto/bambini-insegnante.jpg',
  'spettacoli-eventi': 'ballerina.jpg',
  'sportello-psicologico': 'foto/sportellopsicologico-adulti.jpg',
  documenti: null,
};

if (mode === 'prepare') {
  if (await fs.stat(manifest).catch(() => null)) throw new Error('Manifesto già presente');
  await fs.mkdir(work, { recursive: true });
  await fs.mkdir(dest, { recursive: true });
  const tasks = [];
  for (const [page, original] of Object.entries(sources)) {
    for (const format of ['desktop', 'tablet']) {
      const canvas = format === 'desktop' ? { width: 2560, height: 800 } : { width: 1600, height: 1000 };
      const task = { slug: `${page}-${format}`, page, format, original, canvas };
      if (original) {
        task.source = path.join(root, 'src/assets/images', original);
        task.resize = format === 'desktop' ? { height: 800 } : { width: 1120, height: 1000, fit: 'inside' };
        const photo = await sharp(task.source).resize(task.resize).png().toBuffer();
        const meta = await sharp(photo).metadata();
        task.patch = { left: canvas.width - meta.width, top: canvas.height - meta.height, width: meta.width, height: meta.height };
        task.input = path.join(work, `${task.slug}-canvas.png`);
        await sharp({ create: { ...canvas, channels: 3, background: '#e5e5e5' } }).composite([{ input: photo, left: task.patch.left, top: task.patch.top }]).png().toFile(task.input);
        task.prompt = `Use case: identity-preserve. Edit target: this ${canvas.width}x${canvas.height} website hero canvas. OUTPAINT ONLY THE LIGHT GRAY EMPTY AREA. The original image occupies x=${task.patch.left}..${canvas.width}, y=${task.patch.top}..${canvas.height}, at the RIGHT. Preserve its exact scale, location, perspective and every pixel. Extend its background seamlessly into the gray area with consistent light, colors and perspective. Keep all original people, faces, bodies, hands, clothing and poses absolutely unchanged, no duplication, no extra people, no human silhouettes or reflected people. Leave the entire left side empty for website text. Do not move, crop, enlarge or redraw the existing image. No text, borders, blur, gradients or placeholders. Deliver the full ${canvas.width / canvas.height}:1 canvas. ${page === 'sportello-psicologico' ? 'This is an illustration: extend ONLY its flat pale cream background, preserve the head and tree illustration exactly.' : 'Extend ONLY the unoccupied environment, never populate it. Where the original photo has partially visible people on its boundary, do not extend them or invent their bodies in the new area.'}`;
      } else {
        task.prompt = `Create a sophisticated photorealistic website hero banner for the documents and enrollment forms page of an Italian dance school. Canvas ${canvas.width}x${canvas.height}, exact aspect ${canvas.width / canvas.height}:1. On the RIGHT THIRD: a neat ivory paper folder with two clean unprinted sheets and a slim black pen, resting on a warm wooden reception desk. Understated ballet studio context in the background with a softly defocused pale blue wall and a wooden ballet barre. Left sixty percent quiet dark desaturated blue, natural photographic falloff and room depth, generous empty space for white website headline. Warm side light on the paper, elegant editorial still life, physically plausible objects. No people, no faces, no hands, no logos, no typography, no readable writing, no watermarks. Keep the folder fully visible and entirely at the right, with comfortable margins. Real photograph, not illustration. ${format === 'tablet' ? 'Use a taller composition, props at lower right, upper left quiet.' : 'Extra wide composition, all visual interest at right.'}`;
      }
      tasks.push(task);
    }
  }
  await fs.writeFile(manifest, JSON.stringify(tasks, null, 2) + '\n');
  console.log(tasks.map(({ slug, input }) => ({ slug, input })));
} else {
  const tasks = JSON.parse(await fs.readFile(manifest, 'utf8'));
  if (mode === 'finish') {
    const task = tasks.find((t) => t.slug === slug);
    if (!task) throw new Error('Banner sconosciuto');
    let background = await sharp(generated).resize(task.canvas.width, task.canvas.height, { fit: 'fill' }).png().toBuffer();
    if (task.source && !task.objectRemoval) {
      const photo = await sharp(task.source).resize(task.resize).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      task.blend = {
        left: task.slug === 'corsi-desktop' ? 0 : Math.min(32, Math.round(task.patch.width * .03)),
        // Queste fasce contengono solo il fondale sopra le teste, mai le persone.
        top: task.patch.top ? ({ corsi: 160, 'spettacoli-eventi': 140, 'sportello-psicologico': 100 }[task.page] ?? 12) : 0,
      };
      // La campitura dell'illustrazione è uniforme: riprendiamo il colore esatto
      // dell'originale per evitare un riquadro di una diversa tonalità di crema.
      if (task.page === 'sportello-psicologico') {
        const rgb = [...photo.data.subarray(0, 3)];
        background = await sharp({ create: { ...task.canvas, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toBuffer();
      }
      if (task.slug === 'corsi-desktop') {
        // Riallinea la giunzione palco/fondale dell'estensione alla foto.
        // La sottile striscia originale usata qui contiene solo fondale vuoto.
        const w = task.patch.left;
        const upper = await sharp(background).extract({ left: 0, top: 0, width: w, height: 700 }).resize(w, 758, { fit: 'fill' }).png().toBuffer();
        const floor = await sharp(background).extract({ left: 0, top: 700, width: w, height: 100 }).resize(w, 42, { fit: 'fill' }).png().toBuffer();
        const strip = await sharp(photo.data, { raw: photo.info }).extract({ left: 0, top: 0, width: 28, height: 800 }).resize(480, 800, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        for (let y = 0; y < 800; y++) for (let x = 0; x < 480; x++) strip.data[(y * 480 + x) * 4 + 3] = Math.round(255 * x / 479);
        const edge = await sharp(strip.data, { raw: strip.info }).png().toBuffer();
        background = await sharp(background).composite([{ input: upper, left: 0, top: 0 }, { input: floor, left: 0, top: 758 }, { input: edge, left: w - 480, top: 0 }]).png().toBuffer();
      }
      if (task.slug === 'classi-integrate-desktop') {
        const emptyFloor = await sharp(background).extract({ left: 0, top: 0, width: task.patch.left, height: 800 }).extend({ right: task.blend.left, extendWith: 'copy' }).png().toBuffer();
        background = await sharp(background).composite([{ input: emptyFloor, left: 0, top: 0 }]).png().toBuffer();
      }
      for (let y = 0; y < photo.info.height; y++) for (let x = 0; x < photo.info.width; x++) {
        const protectFeet = task.slug === 'classi-integrate-desktop' && y > 650;
        const alpha = Math.min(1, task.blend.left && !protectFeet ? x / task.blend.left : 1, task.blend.top ? y / task.blend.top : 1);
        photo.data[(y * photo.info.width + x) * 4 + 3] = Math.round(255 * alpha);
      }
      const patch = await sharp(photo.data, { raw: photo.info }).png().toBuffer();
      background = await sharp(background).composite([{ input: patch, left: task.patch.left, top: task.patch.top }]).png().toBuffer();
    }
    task.output = path.join(dest, `${task.slug}.png`);
    await fs.writeFile(task.output, background);
    task.generated = generated;
    task.finished = true;
    await fs.writeFile(manifest, JSON.stringify(tasks, null, 2) + '\n');
    console.log(`${task.slug}: pronto`);
  } else if (mode === 'verify') {
    let pixels = 0;
    for (const t of tasks) {
      if (!t.finished) throw new Error(`Manca ${t.slug}`);
      const meta = await sharp(t.output).metadata();
      if (meta.width !== t.canvas.width || meta.height !== t.canvas.height) throw new Error(`Formato errato ${t.slug}`);
      // Le rimozioni richieste dopo la prima composizione sostituiscono anche
      // parti della foto: per queste si verificano formato e dimensioni.
      if (!t.source || t.objectRemoval) continue;
      const crop = { left: t.blend.left, top: t.blend.top, width: t.patch.width - t.blend.left, height: t.patch.height - t.blend.top };
      const original = await sharp(t.source).resize(t.resize).png().toBuffer();
      const expected = await sharp(original).extract(crop).removeAlpha().raw().toBuffer();
      const actual = await sharp(t.output).extract({ ...crop, left: t.patch.left + crop.left, top: t.patch.top + crop.top }).removeAlpha().raw().toBuffer();
      if (!expected.equals(actual)) throw new Error(`Foto alterata ${t.slug}`);
      pixels += expected.length / 3;
    }
    console.log(`${tasks.length} banner verificati; ${pixels} pixel originali identici.`);
  } else if (mode === 'review') {
    const pages = Object.keys(sources);
    for (let start = 0; start < pages.length; start += 4) {
      const group = pages.slice(start, start + 4);
      const layers = [];
      for (let i = 0; i < group.length; i++) {
        const label = Buffer.from(`<svg width="1120" height="28"><rect width="1120" height="28" fill="white"/><text x="8" y="21" font-family="Arial" font-size="17">${group[i]}: desktop / tablet</text></svg>`);
        layers.push({ input: label, left: 0, top: i * 278 });
        for (const [format, left, width, height] of [['desktop', 0, 720, 225], ['tablet', 720, 400, 250]]) {
          const t = tasks.find((t) => t.page === group[i] && t.format === format);
          if (t.finished) layers.push({ input: await sharp(t.output).resize(width, height).png().toBuffer(), left, top: i * 278 + 28 });
        }
      }
      await sharp({ create: { width: 1120, height: group.length * 278, channels: 3, background: '#eee' } }).composite(layers).png().toFile(path.join(work, `revisione-${start / 4 + 1}.png`));
    }
    console.log('Tavole generate');
  } else throw new Error('Uso: prepare | finish <slug> <immagine> | verify | review');
}
