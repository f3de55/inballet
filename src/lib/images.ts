import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

export function getAsset(name: string): ImageMetadata {
  const clean = name.replace(/^\.?\/?(assets\/images\/)?/, '');
  const mod = modules[`../assets/images/${clean}`];
  if (!mod) throw new Error(`Immagine non trovata: ${name}`);
  return mod.default;
}

export async function webp(name: string, width = 1280): Promise<string> {
  const src = getAsset(name);
  const img = await getImage({ src, width: Math.min(width, src.width), format: 'webp' });
  return img.src;
}

export interface Fuoco {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

export function varFuoco(fuoco: Fuoco = {}): string {
  const lg = fuoco.desktop ?? '50% 50%';
  const md = fuoco.tablet ?? lg;
  const sm = fuoco.mobile ?? md;
  return `--fuoco-lg:${lg};--fuoco-md:${md};--fuoco-sm:${sm};`;
}

type Sorgenti = string | { desktop: string; tablet?: string; mobile?: string };

export async function sfondo(sorgenti: Sorgenti, fuoco: Fuoco = {}) {
  const s = typeof sorgenti === 'string' ? { desktop: sorgenti } : sorgenti;
  const tablet = s.tablet ?? s.desktop;
  const mobile = s.mobile ?? tablet;
  const [lg, md, sm] = await Promise.all([webp(s.desktop, 2560), webp(tablet, 1600), webp(mobile, 1400)]);
  return {
    style: `--sfondo-lg:url('${lg}');--sfondo-md:url('${md}');--sfondo-sm:url('${sm}');${varFuoco(fuoco)}`,
    preload: [
      { href: lg, media: '(min-width: 901px)' },
      { href: md, media: '(min-width: 601px) and (max-width: 900px)' },
      { href: sm, media: '(max-width: 600px)' },
    ],
  };
}

const TEMI_CTA = ['danza', 'urban', 'bambini', 'benessere', 'formazione', 'comunita', 'ascolto'] as const;
type TemaCta = (typeof TEMI_CTA)[number];

export function sfondoCta(tema: TemaCta = 'danza') {
  return sfondo(
    {
      desktop: `cta/${tema}-desktop.webp`,
      tablet: `cta/${tema}-tablet.webp`,
      mobile: `cta/${tema}-mobile.webp`,
    },
    { desktop: tema === 'danza' ? '50% 100%' : '50% 50%', tablet: '50% 50%', mobile: '50% 100%' },
  );
}

export async function webpSrcset(name: string, widths: number[], rapporto?: number) {
  const src = getAsset(name);
  const max = rapporto ? Math.min(src.width, Math.floor(src.height / rapporto)) : src.width;
  const ws = [...new Set(widths.map((w) => Math.min(w, max)))].sort((a, b) => a - b);
  const ritaglio = (width: number) => (rapporto ? { height: Math.round(width * rapporto), fit: 'cover' as const } : {});
  const imgs = await Promise.all(ws.map((width) => getImage({ src, width, format: 'webp', ...ritaglio(width) })));
  return {
    srcset: imgs.map((img, i) => `${img.src} ${ws[i]}w`).join(', '),
    src: imgs[imgs.length - 1].src,
    widths: ws,
    urls: imgs.map((img) => img.src),
  };
}
