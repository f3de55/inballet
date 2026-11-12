export const SITO_ATTUALE = 'https://www.inballet.it';
export const SITO_OGGI = '/sito-oggi';
const LARGHEZZA_GOOGLE = 1864;

type Dispositivo = 'pc' | 'telefono';

interface Riquadro {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Schermata {
  nome: string;
  url: string;
  dispositivo: Dispositivo;
  evidenzia?: string;
  frase?: [string, string];
  fermo?: boolean;
  larghezza?: number;
  barrato?: Riquadro;
  snippet?: { x: number; y: number };
}

export type Apertura = 'copertina' | 'sito-oggi' | 'nuovo-sito' | 'google' | 'scuole' | 'dashboard' | 'prossimi';

export type Scena =
  | { tipo: 'siti' | 'confronto'; schermi: Schermata[] }
  | { tipo: 'apertura'; immagine: Apertura }
  | { tipo: 'pannello'; pannello: 'mancano' | 'costo' | 'dopo' | 'fine' };

interface Scelta {
  etichetta: string;
  domanda: string;
  percorso: string;
}

interface Riga {
  loro: string;
  noi: string;
}

interface Passo {
  capitolo: string;
  titolo: string;
  testo: string;
  evidenzia?: string[];
  scelte?: Scelta[];
  google?: boolean;
  confronto?: Riga[];
  scena: Scena;
}

const scuola = (nome: string, url: string, confronto: Riga[]): Passo => ({
  capitolo: 'Le scuole della zona',
  titolo: nome,
  testo: '',
  confronto,
  scena: { tipo: 'confronto', schermi: [{ nome, url, dispositivo: 'pc' }] },
});

let capitoli = 0;
const apertura = (immagine: Apertura, titolo: string, testo: string): Passo => ({
  capitolo: `Capitolo ${++capitoli}`,
  titolo,
  testo,
  scena: { tipo: 'apertura', immagine },
});

const SOTTO_1_MB = 'Homepage sotto 1 MB';
const ORARI_RECENSIONI = 'Orari e recensioni da Google';

const oggi = (percorso: string, evidenzia?: string, altro: Partial<Schermata> = {}): Scena => ({
  tipo: 'siti',
  schermi: [{ nome: 'Sito di oggi', url: `${SITO_OGGI}${percorso}`, dispositivo: 'pc', evidenzia, ...altro }],
});

const nuovo = (percorso: string, evidenzia?: string): Scena => ({
  tipo: 'siti',
  schermi: [{ nome: 'Nuovo sito', url: percorso, dispositivo: 'pc', evidenzia }],
});

export const passi: Passo[] = [
  {
    capitolo: 'Proposta per InBallet',
    titolo: 'Restyling del sito',
    testo: 'di Federico Capuzzi e Samuele Max',
    scena: { tipo: 'apertura', immagine: 'copertina' },
  },
  apertura('sito-oggi', 'Il sito di oggi', 'Cosa non funziona nel sito attuale, guardato dal vivo.'),
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Tutto in bianco e nero',
    testo: 'La pagina Modern, come la homepage e altri 6 corsi: solo foto in bianco e nero. Una scuola di danza vive di colore.',
    evidenzia: ['colore'],
    scena: oggi('/modern.html', '#features2-1c .card-img'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Nessun pulsante',
    testo: 'La homepage finisce senza un «Contattaci» o un «Prenota una prova», e nei corsi mancano orari, giorni e costi.',
    evidenzia: ['orari, giorni e costi'],
    scena: oggi('', '#clients01-7m, #footer1-6i'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Tutti nello stesso paragrafo',
    testo: 'Famiglie, adulti, professionisti e scuole cercano cose diverse, ma non c’è una strada per ciascuno.',
    evidenzia: ['una strada per ciascuno'],
    scena: oggi('', '#header9-7b .mbr-text', { frase: ['La scuola', 'esigenze professionali.'] }),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: '9 tendine, 43 voci',
    testo: '«Danza integrativa», «Atelier», «Altri servizi» non orientano, e 8 voci principali non hanno una pagina.',
    evidenzia: ['8 voci principali'],
    scena: oggi('', '#menu1-4k .navbar-nav'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Un paragrafo di 286 parole',
    testo: 'Racconta la filosofia, ma non dice quale corso, dove, quando e quanto costa.',
    evidenzia: ['quanto costa'],
    scena: oggi('', '#header9-7b .mbr-text'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Pagine in errore',
    testo: 'Danza Classica, dal menu, porta a un errore 404; altre 6 voci riaprono la homepage.',
    evidenzia: ['errore 404'],
    scena: oggi('/danza_classica_accademica.html'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Dal telefono si legge male',
    testo: 'Il nome finisce sotto il menu, poi più di due schermate di solo testo.',
    evidenzia: ['sotto il menu'],
    scena: oggi('', '#header9-7b h1', { dispositivo: 'telefono', fermo: true }),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Foto non valorizzate',
    testo: 'Avviamento alla danza, per i più piccoli: tre foto piccole, in fondo, in bianco e nero.',
    evidenzia: ['tre foto piccole'],
    scena: oggi('/avviamento_alla_danza.html', '#features2-l .card-img'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Sostenitori quasi invisibili',
    testo: 'Loghi larghi 150 pixel, ritagliati da screenshot.',
    evidenzia: ['150 pixel'],
    scena: oggi('', '#clients01-7m'),
  },
  apertura('nuovo-sito', 'Il nuovo sito', 'Lo stesso sito, pensato per chi cerca una scuola di danza.'),
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Si capisce subito',
    testo: 'Scuola di danza a Lainate e Rho, dai 3 anni all’età adulta, con «Scopri i corsi» e «Contattaci» subito a portata.',
    evidenzia: ['Lainate e Rho'],
    scena: nuovo('/', '.hero-content'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Il prossimo evento in vista',
    testo: 'Una fascia su ogni pagina annuncia il prossimo appuntamento e si aggiorna da sola.',
    evidenzia: ['si aggiorna da sola'],
    scena: nuovo('/', '.event-banner'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: '4 voci al posto di 9 tendine',
    testo: 'Corsi, La Scuola, Progetti, Formazione. Contattaci sempre visibile.',
    evidenzia: ['Contattaci'],
    scena: nuovo('/', '.nav-menu'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Una porta per ogni visitatore',
    testo: 'Scegline una:',
    scelte: [
      { etichetta: 'Famiglie', domanda: 'Un corso per mio figlio?', percorso: '/prima-infanzia' },
      { etichetta: 'Adulti', domanda: 'Posso iniziare adesso?', percorso: '/contemporanea-adulti' },
      { etichetta: 'Insegnanti', domanda: 'Una formazione riconosciuta?', percorso: '/formazione-insegnanti' },
      { etichetta: 'Scuole e aziende', domanda: 'Un partner sul territorio?', percorso: '/collaborazioni-scuole' },
    ],
    scena: nuovo('/prima-infanzia'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Calendario degli eventi',
    testo: 'Ogni evento ha locandina e dettagli, va nel calendario del telefono e si condivide su WhatsApp.',
    evidenzia: ['WhatsApp'],
    scena: nuovo('/spettacoli-eventi', '#vistaCalendario'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Orari da Google Maps',
    testo: 'Gli orari arrivano dalla scheda Google e il sito dice se la segreteria è aperta adesso.',
    evidenzia: ['aperta adesso'],
    scena: nuovo('/contatti', '.info-blocco:has(orari-segreteria)'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Recensioni di Google',
    testo: 'Voto e ultime recensioni, aggiornati da soli.',
    scena: nuovo('/', '.recensioni-layout'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Étoile, l’assistente',
    testo: 'Risponde a ogni ora su corsi, età, sedi e orari. Provalo.',
    evidenzia: ['a ogni ora'],
    scena: nuovo('/', '#cb-toggle'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Foto della scuola',
    testo: 'Gallerie di lezioni e spettacoli, a tutto schermo con un tocco.',
    scena: nuovo('/', '.gallery-infinite'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Stesso telefono, due siti',
    testo: 'A sinistra oggi, a destra il nuovo sito, pensato prima di tutto per il telefono.',
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Sito di oggi', url: SITO_OGGI, dispositivo: 'telefono' },
        { nome: 'Nuovo sito', url: '/', dispositivo: 'telefono' },
      ],
    },
  },
  apertura('google', 'Motori di ricerca e AI', 'Come il sito si presenta a chi lo cerca su Google o lo chiede a un assistente AI.'),
  {
    capitolo: 'Motori di ricerca e AI',
    titolo: 'Google, dal vivo',
    testo: 'Oggi il sito non dà a Google né titolo né descrizione: Google li ricava da solo dalla pagina.',
    evidenzia: ['né titolo né descrizione'],
    google: true,
    scena: {
      tipo: 'siti',
      schermi: [
        {
          nome: 'Google',
          url: 'https://www.google.com/search?igu=1&hl=it&gl=it&q=inballet+lainate',
          dispositivo: 'pc',
          larghezza: LARGHEZZA_GOOGLE,
          barrato: { x: 280, y: 213, w: 76, h: 26 },
          snippet: { x: 256, y: 292 },
        },
      ],
    },
  },
  {
    capitolo: 'Motori di ricerca e AI',
    titolo: 'La mappa del sito',
    testo: 'L’elenco delle pagine da consegnare a Google: oggi non esiste, nel nuovo sito si aggiorna da sola.',
    evidenzia: ['non esiste'],
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Sito di oggi', url: `${SITO_OGGI}/sitemap.xml`, dispositivo: 'pc' },
        { nome: 'Nuovo sito', url: '/sitemap.xml', dispositivo: 'pc' },
      ],
    },
  },
  apertura('scuole', 'Le scuole della zona', 'I siti delle altre scuole di Lainate e Rho, accanto al nuovo sito InBallet.'),
  scuola('Valentina Ponzone · Lainate', 'https://www.valentinaponzonedanceacademy.it/', [
    { loro: 'Su Google: «Home», senza descrizione', noi: 'Titolo e descrizione per Google' },
    { loro: 'Non dice dove né per chi', noi: 'Lainate e Rho, dai 3 anni' },
    { loro: 'Homepage da 4,2 MB', noi: SOTTO_1_MB },
  ]),
  scuola('Backstage · Lainate', 'https://www.backstage-danza.it/', [
    { loro: 'Pagina senza titolo', noi: 'Titolo e descrizione per Google' },
    { loro: 'Telefoni non cliccabili', noi: 'Si chiama con un tocco' },
    { loro: 'Niente orari né recensioni', noi: ORARI_RECENSIONI },
  ]),
  scuola('Spazio Dance On · Rho', 'https://www.spaziodanceon.it/', [
    { loro: 'Homepage da 8,5 MB', noi: SOTTO_1_MB },
    { loro: 'Foto in bianco e nero', noi: 'Foto a colori' },
    { loro: 'Titolo principale «homepage»', noi: 'Titolo con cosa e dove' },
  ]),
  scuola('City Dance Academy · Rho', 'https://www.citydanceacademy.club/', [
    { loro: 'In homepage un evento del 2021', noi: 'Eventi passati chiusi da soli' },
    { loro: 'Menu con la voce «Altro»', noi: '4 voci chiare' },
    { loro: 'Niente orari né recensioni', noi: ORARI_RECENSIONI },
  ]),
  scuola('Accademia Balletto Classico · Rho', 'https://www.accademiaballettoclassico.it/', [
    { loro: 'Nessuna descrizione per Google', noi: 'Titolo e descrizione per Google' },
    { loro: '«Home» nel menu quasi invisibile', noi: 'Menu leggibile' },
    { loro: 'Niente calendario eventi né orari', noi: 'Calendario eventi e orari' },
  ]),
  apertura('dashboard', 'La dashboard', 'L’area riservata per aggiornare il sito da sola, senza codice.'),
  {
    capitolo: 'La dashboard',
    titolo: 'La tua area riservata',
    testo: 'Con una password aggiorni il sito da sola, senza codice. Questa è la dashboard vera.',
    evidenzia: ['da sola'],
    scena: nuovo('/dashboard', '.topbar-nav'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Eventi',
    testo: 'Crei l’evento, carichi la locandina, scegli lo stato. Compare subito sul sito.',
    evidenzia: ['locandina'],
    scena: nuovo('/dashboard', '[data-nuovo-evento]'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Documenti',
    testo: 'Moduli e regolamenti in PDF, con i testi della pagina Documenti.',
    evidenzia: ['PDF'],
    scena: nuovo('/dashboard?s=documenti', '#docLista'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Insegnanti',
    testo: 'Foto, ruolo, biografia e competenze: compaiono in Chi siamo.',
    evidenzia: ['Chi siamo'],
    scena: nuovo('/dashboard?s=insegnanti', '#insLista'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Le domande delle famiglie',
    testo: 'Quante domande riceve Étoile, quando, e cosa cercano le famiglie.',
    evidenzia: ['cosa cercano le famiglie'],
    scena: nuovo('/dashboard?s=bot', '#chartDaily'),
  },
  apertura('prossimi', 'Prossimi passi', 'Cosa manca, quanto costa e come si va online.'),
  {
    capitolo: 'Prossimi passi',
    titolo: 'Cosa manca',
    testo: 'Una versione di lavoro: tre punti dipendono dalla scuola, due da noi.',
    scena: { tipo: 'pannello', pannello: 'mancano' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Un costo unico',
    testo: 'Sito completo e modifiche fino alla pubblicazione.',
    scena: { tipo: 'pannello', pannello: 'costo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Dopo la pubblicazione',
    testo: 'Cosa fai da sola, cosa facciamo noi e i nostri limiti.',
    scena: { tipo: 'pannello', pannello: 'dopo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Proviamolo insieme',
    testo: 'Sito da computer e da telefono, poi la dashboard passo per passo.',
    scena: { tipo: 'pannello', pannello: 'fine' },
  },
];
