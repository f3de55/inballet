import { sfondo } from './images';

/** Coppie già composte: desktop 16:5 e tablet 8:5, soggetto a destra. */
const banner = {
  'chi-siamo': 'hero-pagine/chi-siamo',
  corsi: 'hero-pagine/corsi',
  contatti: 'hero-pagine/contatti',
  documenti: 'hero-pagine/documenti',
  'formazione-insegnanti': 'hero-corsi/lezioni-individuali',
  'formazioni-personalizzate': 'hero-pagine/formazioni-personalizzate',
  'collaborazioni-scuole': 'hero-corsi/bambini',
  'classi-integrate': 'hero-pagine/classi-integrate',
  'progetto-noiconvoi': 'hero-corsi/prima-infanzia',
  sostenitori: 'hero-corsi/prima-infanzia',
  'sportello-psicologico': 'hero-pagine/sportello-psicologico',
  'spettacoli-eventi': 'hero-pagine/spettacoli-eventi',
} as const;

export async function heroPagina(pagina: keyof typeof banner) {
  const base = banner[pagina];
  const hero = await sfondo({ desktop: `${base}-desktop.png`, tablet: `${base}-tablet.png` }, { desktop: '100% 50%', tablet: '100% 50%' });
  return {
    ...hero,
    preload: [
      { href: hero.preload[0].href, media: '(min-width: 1025px)' },
      { href: hero.preload[1].href, media: '(min-width: 769px) and (max-width: 1024px)' },
      { href: '/assets/images/hero-mobile.webp', media: '(max-width: 768px)' },
    ],
  };
}
