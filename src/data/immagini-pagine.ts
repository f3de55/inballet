import type { Fuoco } from '../lib/images';

interface ImmaginePagina {
  src: string;
  alt: string;
  fuoco?: Fuoco;
}

export const immaginiPagine: Record<string, ImmaginePagina> = {
  'formazione-insegnanti': { src: 'percorsi/formazione-insegnanti.webp', alt: 'Le insegnanti di InBallet osservano e discutono un gesto didattico in sala', fuoco: { desktop: '50% 50%' } },
  'formazioni-personalizzate': { src: 'foto/bambini-insegnante.jpg', alt: "Un'insegnante guida un gioco di movimento con i bambini" },
  'spettacoli-eventi': { src: 'ballerina.jpg', alt: 'Gli allievi di InBallet insieme sul palco durante uno spettacolo' },
  'collaborazioni-scuole': { src: 'percorsi/collaborazioni-scuole.webp', alt: 'Un’insegnante accompagna due bambine in un gioco di passi coordinati', fuoco: { desktop: '50% 50%' } },
  'sportello-psicologico': { src: 'percorsi/sportello-psicologico.webp', alt: 'La mano di un adulto e quella di un bambino si incontrano con la punta delle dita', fuoco: { desktop: '50% 50%' } },
  'progetto-noiconvoi': { src: 'percorsi/progetto-noiconvoi.webp', alt: 'Un’insegnante e una bambina si tengono per mano durante un’attività di danza in gruppo', fuoco: { desktop: '50% 50%' } },
  'classi-integrate': { src: 'percorsi/classi-integrate.webp', alt: 'Un’insegnante accompagna il movimento espressivo delle braccia di un’allieva', fuoco: { desktop: '50% 50%' } },
  sostenitori: { src: 'percorsi/sostenitori.webp', alt: 'Danzatrici in scena con una sfera luminosa e fili rossi che uniscono il gruppo', fuoco: { desktop: '55% 50%' } },
};

export function immaginePagina(href: string): ImmaginePagina {
  const pagina = href.replace(/^\//, '');
  const immagine = immaginiPagine[pagina];
  if (!immagine) throw new Error(`Fotografia della pagina non trovata: ${href}`);
  return immagine;
}
