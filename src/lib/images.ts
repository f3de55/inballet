import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

/** Risolve "gallery-1.jpg" o "assets/images/gallery-1.jpg" nell'immagine importata. */
export function getAsset(name: string): ImageMetadata {
  const clean = name.replace(/^\.?\/?(assets\/images\/)?/, '');
  const mod = modules[`../assets/images/${clean}`];
  if (!mod) throw new Error(`Immagine non trovata: ${name}`);
  return mod.default;
}

/** URL WebP ottimizzato (larghezza massima `width`, mai oltre l'originale). */
export async function webp(name: string, width = 1280): Promise<string> {
  const src = getAsset(name);
  const img = await getImage({ src, width: Math.min(width, src.width), format: 'webp' });
  return img.src;
}

/** srcset WebP per le larghezze richieste (limitate alla larghezza originale). */
export async function webpSrcset(name: string, widths: number[]) {
  const src = getAsset(name);
  const ws = [...new Set(widths.map((w) => Math.min(w, src.width)))].sort((a, b) => a - b);
  const imgs = await Promise.all(ws.map((width) => getImage({ src, width, format: 'webp' })));
  return {
    srcset: imgs.map((img, i) => `${img.src} ${ws[i]}w`).join(', '),
    src: imgs[imgs.length - 1].src,
    widths: ws,
    urls: imgs.map((img) => img.src),
  };
}
