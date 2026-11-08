import type { Fuoco } from '../lib/images';

interface ImmaginePagina {
  src: string;
  alt: string;
  fuoco?: Fuoco;
}

export const immaginiPagine: Record<string, ImmaginePagina> = {
  'formazione-insegnanti': { src: 'gallery-7.jpg', alt: 'Le insegnanti di InBallet in sala' },
  'formazioni-personalizzate': { src: 'foto/bambini-insegnante.jpg', alt: "Un'insegnante guida un gioco di movimento con i bambini" },
  'spettacoli-eventi': { src: 'ballerina.jpg', alt: 'Gli allievi di InBallet insieme sul palco durante uno spettacolo' },
  'collaborazioni-scuole': { src: 'gallery-7.jpg', alt: 'Lo staff di InBallet in sala' },
  'sportello-psicologico': { src: 'foto/sportello-psicologico-img4.jpg', alt: 'Due mani si sfiorano con la punta delle dita', fuoco: { desktop: '50% 50%' } },
  'progetto-noiconvoi': { src: 'foto/bambini-mani.jpg', alt: 'Una mano adulta stringe quella di una bambina durante la lezione', fuoco: { desktop: '55% 50%' } },
  'classi-integrate': { src: 'gallery-4.jpg', alt: "Un'insegnante guida un'allieva durante la lezione" },
  sostenitori: { src: 'gallery-6.jpg', alt: 'Allievi in scena durante uno spettacolo' },
};

export function immaginePagina(href: string): ImmaginePagina {
  const pagina = href.replace(/^\//, '');
  const immagine = immaginiPagine[pagina];
  if (!immagine) throw new Error(`Fotografia della pagina non trovata: ${href}`);
  return immagine;
}
