export const SITO_ATTUALE = 'https://www.inballet.it';
export const SITO_OGGI = '/sito-oggi';
export const QUERY_GOOGLE = 'inballet lainate';
export const PAGINA_GOOGLE = '/presentazione/google';

type Dispositivo = 'pc' | 'telefono';

export interface Schermata {
  nome: string;
  url: string;
  dispositivo: Dispositivo;
  evidenzia?: string;
  frase?: [string, string];
  fermo?: boolean;
}

export type Apertura = 'copertina' | 'sito-oggi' | 'nuovo-sito' | 'google' | 'scuole' | 'dashboard' | 'prossimi';

export type Scena =
  | { tipo: 'siti' | 'confronto'; schermi: Schermata[] }
  | { tipo: 'apertura'; immagine: Apertura }
  | { tipo: 'pannello'; pannello: 'mancano' | 'costo' | 'dopo' };

interface Scelta {
  etichetta: string;
  domanda: string;
  percorso: string;
}

interface Passo {
  capitolo: string;
  titolo: string;
  testo?: string;
  evidenzia?: string[];
  scelte?: Scelta[];
  senzaNota?: boolean;
  difetti?: string[];
  scena: Scena;
}

const scuola = (nome: string, url: string, difetti: string[]): Passo => ({
  capitolo: 'Le scuole della zona',
  titolo: nome,
  difetti,
  scena: { tipo: 'confronto', schermi: [{ nome, url, dispositivo: 'pc' }] },
});

let capitoli = 0;
const apertura = (immagine: Apertura, titolo: string, testo: string): Passo => ({
  capitolo: `Capitolo ${++capitoli}`,
  titolo,
  testo,
  scena: { tipo: 'apertura', immagine },
});


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
  apertura('sito-oggi', 'Il sito di oggi', 'Cosa non funziona nel sito attuale.'),
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
    testo: 'Loghi piccoli, larghi appena 150 pixel.',
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
    testo: 'Risponde a ogni ora su corsi, età, sedi e orari. Ricorda la conversazione, filtra le parolacce e parla solo di InBallet, con i contenuti del sito sempre aggiornati.',
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
    testo: 'Il confronto tra il sito di oggi e il nuovo, pensato prima di tutto per il telefono.',
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
    titolo: 'Il sito su Google',
    senzaNota: true,
    scena: { tipo: 'siti', schermi: [{ nome: 'Google', url: PAGINA_GOOGLE, dispositivo: 'pc' }] },
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
  apertura('scuole', 'Le scuole della zona', 'I siti delle altre scuole di Lainate e Rho, uno per uno.'),
  scuola('Valentina Ponzone · Lainate', 'https://www.valentinaponzonedanceacademy.it/', [
    'Non ottimizzato per i motori di ricerca',
    'Design banale',
    'Nessuna pagina di approfondimento per i corsi',
    'Due voci di contatto nel menu, senza senso',
    'Nessuna pagina degli eventi della scuola',
  ]),
  scuola('Backstage · Lainate', 'https://www.backstage-danza.it/', [
    'Non ottimizzato per i motori di ricerca',
    'Design banale e poco curato',
    'Troppo testo',
    'Nessun evento: solo una piccola foto del giornale, a evento finito',
  ]),
  scuola('Spazio Dance On · Rho', 'https://www.spaziodanceon.it/', [
    'Quasi ottimizzato per i motori di ricerca',
    'Design ricercato, ma confusionario al massimo',
    'Quasi tutto in bianco e nero',
    'Animazioni messe a caso',
    'Nessun evento',
    'Menu disordinato',
    'Pochissimo testo nelle pagine',
  ]),
  scuola('City Dance Academy · Rho', 'https://www.citydanceacademy.club/', [
    'Design da sito di 15 anni fa',
    'Testi piccolissimi',
    'Pagine dei corsi incomplete',
    'Menu con voci a caso, poco intuitive',
    'Eventi con un’interfaccia pessima',
    'Il calendario dei corsi è un’immagine',
    'Non ottimizzato per il telefono',
  ]),
  scuola('Accademia Balletto Classico · Rho', 'https://www.accademiaballettoclassico.it/', [
    'Design carino, ma impaginazione pessima',
    'Non ottimizzato per il telefono',
    'Recensioni fatte male',
    'News non aggiornate',
  ]),
  apertura('dashboard', 'La dashboard', 'L’area riservata per aggiornare il sito da sola, senza codice.'),
  {
    capitolo: 'La dashboard',
    titolo: 'La tua area riservata',
    testo: 'Con una password aggiorni il sito da sola, senza codice.',
    evidenzia: ['da sola'],
    scena: nuovo('/dashboard', '.topbar-nav'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Eventi',
    testo: 'Crei l’evento, carichi la locandina, scegli lo stato. Compare subito sul sito.',
    evidenzia: ['locandina'],
    scena: nuovo('/dashboard', '.pagina-azioni [data-nuovo-evento]'),
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
  apertura('prossimi', 'Prossimi passi', 'Cosa manca, quanto costa e cosa succede dopo.'),
  { capitolo: 'Prossimi passi', titolo: 'Cosa manca', scena: { tipo: 'pannello', pannello: 'mancano' } },
  { capitolo: 'Prossimi passi', titolo: 'Un costo unico', scena: { tipo: 'pannello', pannello: 'costo' } },
  { capitolo: 'Prossimi passi', titolo: 'Dopo la pubblicazione', scena: { tipo: 'pannello', pannello: 'dopo' } },
];
