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

/**
 * Punto focale (CSS position, es. "50% 30%") per desktop (>900px), tablet
 * (601-900px) e mobile (<=600px): decide quale parte della foto resta visibile
 * quando viene ritagliata dal riquadro. Se manca, vale quello del formato più grande.
 */
export interface Fuoco {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

/** Variabili CSS del punto focale (lette dalle regole responsive in global.css). */
export function varFuoco(fuoco: Fuoco = {}): string {
  const lg = fuoco.desktop ?? '50% 50%';
  const md = fuoco.tablet ?? lg;
  const sm = fuoco.mobile ?? md;
  return `--fuoco-lg:${lg};--fuoco-md:${md};--fuoco-sm:${sm};`;
}

/** Foto diverse per formato (es. un banner largo solo su desktop). */
export type Sorgenti = string | { desktop: string; tablet?: string; mobile?: string };

/**
 * Sfondo responsive: WebP della giusta larghezza per desktop, tablet e mobile
 * con il suo punto focale. `style` va sull'elemento con l'immagine di sfondo;
 * `preload` serve per l'immagine principale della pagina (hero).
 */
export async function sfondo(sorgenti: Sorgenti, fuoco: Fuoco = {}) {
  const s = typeof sorgenti === 'string' ? { desktop: sorgenti } : sorgenti;
  const tablet = s.tablet ?? s.desktop;
  const mobile = s.mobile ?? tablet;
  // Mobile e tablet ritagliano in altezza: servono comunque ~1400-1600px per gli schermi retina
  const [lg, md, sm] = await Promise.all([webp(s.desktop, 2560), webp(tablet, 1600), webp(mobile, 1400)]);
  return {
    style: `--sfondo-lg:url('${lg}');--sfondo-md:url('${md}');--sfondo-sm:url('${sm}');${varFuoco(fuoco)}background-image:var(--sfondo);background-position:var(--fuoco);`,
    preload: [
      { href: lg, media: '(min-width: 901px)' },
      { href: md, media: '(min-width: 601px) and (max-width: 900px)' },
      { href: sm, media: '(max-width: 600px)' },
    ],
  };
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
