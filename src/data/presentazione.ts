export const SITO_ATTUALE = 'https://www.inballet.it';

type Dispositivo = 'pc' | 'telefono';

interface Riquadro {
  x: number;
  y: number;
  w: number;
  h: number;
  basso?: boolean;
  destra?: boolean;
}

export interface Schermata {
  nome: string;
  url: string;
  dispositivo: Dispositivo;
  evidenzia?: string;
  riquadro?: Riquadro;
  etichetta?: string;
}

export type Apertura = 'copertina' | 'sito-oggi' | 'nuovo-sito' | 'google' | 'scuole' | 'dashboard' | 'prossimi';

export type Scena =
  | { tipo: 'siti' | 'confronto'; schermi: Schermata[] }
  | { tipo: 'apertura'; immagine: Apertura }
  | { tipo: 'pannello'; pannello: 'mancano' | 'costo' | 'dopo' | 'fine' };

interface Punto {
  esito: 'si' | 'no';
  testo: string;
}

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
  testo: string[];
  evidenzia?: string[];
  punti?: Punto[];
  scelte?: Scelta[];
  google?: boolean;
  confronto?: Riga[];
  scena: Scena;
}

const scuola = (nome: string, url: string, confronto: Riga[]): Passo => ({
  capitolo: 'Le scuole della zona',
  titolo: nome,
  testo: [],
  confronto,
  scena: { tipo: 'confronto', schermi: [{ nome, url, dispositivo: 'pc' }] },
});

let capitoli = 0;
const apertura = (immagine: Apertura, titolo: string, testo: string): Passo => ({
  capitolo: `Capitolo ${++capitoli}`,
  titolo,
  testo: [testo],
  scena: { tipo: 'apertura', immagine },
});

const SOTTO_1_MB = 'Homepage sotto 1 MB';
const ORARI_RECENSIONI = 'Orari e recensioni da Google';

const oggi = (percorso: string, dispositivo: Dispositivo, riquadro?: Riquadro, etichetta?: string): Scena => ({
  tipo: 'siti',
  schermi: [{ nome: 'Sito di oggi', url: `${SITO_ATTUALE}${percorso}`, dispositivo, riquadro, etichetta }],
});

const nuovo = (percorso: string, evidenzia?: string, etichetta?: string, dispositivo: Dispositivo = 'pc'): Scena => ({
  tipo: 'siti',
  schermi: [{ nome: 'Nuovo sito', url: percorso, dispositivo, evidenzia, etichetta }],
});

export const passi: Passo[] = [
  {
    capitolo: 'Proposta per InBallet',
    titolo: 'Restyling del sito',
    testo: ['di Federico Capuzzi e Samuele Max'],
    scena: { tipo: 'apertura', immagine: 'copertina' },
  },
  apertura('sito-oggi', 'Il sito di oggi', 'Cosa non funziona nel sito attuale, guardato dal vivo.'),
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Tutto in bianco e nero',
    testo: ['Il bianco e nero è elegante, ma una scuola di danza vive di colore.'],
    evidenzia: ['colore'],
    punti: [{ esito: 'no', testo: 'Tutte le foto misurate, homepage e 6 corsi, sono in bianco e nero.' }],
    scena: oggi('/modern.html#features2-1c', 'pc', { x: 124, y: 88, w: 1118, h: 260 }, 'Modern'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Nessuna CTA',
    testo: ['La CTA («call to action») è il pulsante che dice cosa fare: «Contattaci», «Prenota una prova».'],
    evidenzia: ['call to action'],
    punti: [
      { esito: 'no', testo: 'In homepage non ce n’è nessuna.' },
      { esito: 'no', testo: 'Nei corsi mancano orari, giorni e costi.' },
    ],
    scena: oggi('/#footer1-6i', 'pc', { x: 24, y: 480, w: 1318, h: 468, basso: true }, 'Fine della homepage: nessun pulsante'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Nessuna strada per chi cerca',
    testo: ['Famiglie, ragazzi, adulti, professionisti e scuole cercano cose diverse. Qui stanno in un solo paragrafo.'],
    evidenzia: ['un solo paragrafo'],
    punti: [{ esito: 'no', testo: 'Le voci per età di Atelier riaprono la homepage.' }],
    scena: oggi('/', 'pc', { x: 112, y: 424, w: 1142, h: 186 }, 'Tutti nello stesso paragrafo'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Menu troppo lungo',
    testo: ['9 tendine, 43 voci. «Danza integrativa», «Atelier», «Altri servizi» non orientano.'],
    evidenzia: ['9 tendine, 43 voci'],
    punti: [{ esito: 'no', testo: '8 voci principali non hanno una pagina.' }],
    scena: oggi('/', 'pc', { x: 292, y: 10, w: 1003, h: 93, destra: true }, '9 tendine'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Testi che non convincono',
    testo: ['Un paragrafo di 286 parole. Racconta la filosofia, ma non dice quale corso, dove, quando e quanto costa.'],
    evidenzia: ['286 parole'],
    scena: oggi('/', 'pc', { x: 112, y: 140, w: 1142, h: 640 }, 'Un solo paragrafo'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Pagine in errore',
    testo: ['Danza Classica, dal menu, porta qui.'],
    evidenzia: ['Danza Classica'],
    punti: [
      { esito: 'no', testo: 'Errore 404.' },
      { esito: 'no', testo: 'Altre 6 voci riaprono la homepage.' },
    ],
    scena: oggi('/danza_classica_accademica.html', 'pc'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Dal telefono si legge male',
    testo: ['Il nome finisce sotto il menu, poi più di due schermate di solo testo.'],
    evidenzia: ['sotto il menu'],
    scena: oggi('/', 'telefono', { x: 6, y: 38, w: 378, h: 92 }, 'Titolo coperto'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Foto non valorizzate',
    testo: ['Nella pagina per i più piccoli: tre foto piccole, in fondo, in bianco e nero.'],
    evidenzia: ['tre foto piccole'],
    punti: [{ esito: 'no', testo: 'Descritte con parole astratte: «coinvolgimento», «educazione».' }],
    scena: oggi('/avviamento_alla_danza.html#features2-l', 'pc', { x: 124, y: 88, w: 1118, h: 372 }, 'Avviamento alla danza'),
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Sostenitori quasi invisibili',
    testo: ['Loghi larghi 150 pixel, ritagliati da screenshot.'],
    evidenzia: ['150 pixel'],
    scena: oggi('/#footer1-6i', 'pc', { x: 24, y: 480, w: 1318, h: 179, basso: true }, 'I nostri sostenitori'),
  },
  apertura('nuovo-sito', 'Il nuovo sito', 'Lo stesso sito, pensato per chi cerca una scuola di danza.'),
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Si capisce subito',
    testo: ['Al primo sguardo: cosa, dove, per chi e cosa fare.'],
    punti: [
      { esito: 'si', testo: 'Scuola di danza a Lainate e Rho.' },
      { esito: 'si', testo: 'Dai 3 anni all’età adulta.' },
      { esito: 'si', testo: 'Scopri i corsi · Contattaci.' },
    ],
    scena: nuovo('/', '.hero-content', 'Apertura'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Il prossimo evento in vista',
    testo: ['Una fascia su ogni pagina annuncia il prossimo appuntamento e si aggiorna da sola.'],
    evidenzia: ['si aggiorna da sola'],
    scena: nuovo('/', '.event-banner', 'Prossimo evento'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: '4 voci al posto di 9 tendine',
    testo: ['Corsi, La Scuola, Progetti, Formazione. Contattaci sempre visibile.'],
    evidenzia: ['Contattaci'],
    scena: nuovo('/', '.nav-menu', 'Menu'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Una porta per ogni visitatore',
    testo: ['Scegline una:'],
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
    testo: ['Ogni evento ha locandina e dettagli, si aggiunge al calendario del telefono e si condivide su WhatsApp.'],
    evidenzia: ['WhatsApp'],
    scena: nuovo('/spettacoli-eventi', '#vistaCalendario', 'Calendario'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Orari da Google Maps',
    testo: ['Gli orari arrivano dalla scheda Google e il sito dice se la segreteria è aperta adesso.'],
    evidenzia: ['aperta adesso'],
    scena: nuovo('/contatti', '.info-blocco:has(orari-segreteria)', 'Orari segreteria'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Recensioni di Google',
    testo: ['Voto e ultime recensioni, aggiornati da soli.'],
    scena: nuovo('/', '.recensioni-layout', 'Recensioni'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Étoile, l’assistente',
    testo: ['Risponde a ogni ora su corsi, età, sedi e orari. Provalo.'],
    evidenzia: ['a ogni ora'],
    scena: nuovo('/', '#cb-toggle', 'Apri la chat'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Foto della scuola',
    testo: ['Gallerie di lezioni e spettacoli, a tutto schermo con un tocco.'],
    scena: nuovo('/', '.gallery-infinite', 'Galleria'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Stesso telefono, due siti',
    testo: ['A sinistra oggi, a destra il nuovo sito, pensato prima di tutto per il telefono.'],
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Sito di oggi', url: `${SITO_ATTUALE}/`, dispositivo: 'telefono' },
        { nome: 'Nuovo sito', url: '/', dispositivo: 'telefono' },
      ],
    },
  },
  apertura('google', 'Motori di ricerca e AI', 'Come il sito si presenta a chi lo cerca su Google o lo chiede a un assistente AI.'),
  {
    capitolo: 'Motori di ricerca e AI',
    titolo: 'Google, dal vivo',
    testo: ['La ricerca vera, adesso. Oggi la homepage si presenta a Google come «Home», senza descrizione.'],
    evidenzia: ['«Home»'],
    google: true,
    scena: {
      tipo: 'siti',
      schermi: [{ nome: 'Google', url: 'https://www.google.com/search?igu=1&hl=it&gl=it&q=inballet+lainate', dispositivo: 'pc' }],
    },
  },
  {
    capitolo: 'Motori di ricerca e AI',
    titolo: 'La mappa del sito',
    testo: ['L’elenco delle pagine da consegnare a Google: oggi non esiste, nel nuovo sito si aggiorna da sola.'],
    evidenzia: ['non esiste'],
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Sito di oggi', url: `${SITO_ATTUALE}/sitemap.xml`, dispositivo: 'pc' },
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
    testo: ['Con una password aggiorni il sito da sola, senza codice. Questa è la dashboard vera.'],
    evidenzia: ['da sola'],
    scena: nuovo('/dashboard', '.topbar-nav', 'Quattro sezioni'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Eventi',
    testo: ['Crei l’evento, carichi la locandina, scegli lo stato. Compare subito sul sito.'],
    evidenzia: ['locandina'],
    scena: nuovo('/dashboard', '[data-nuovo-evento]', 'Nuovo evento'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Documenti',
    testo: ['Moduli e regolamenti in PDF, con i testi della pagina Documenti.'],
    evidenzia: ['PDF'],
    scena: nuovo('/dashboard?s=documenti', '#docLista', 'I tuoi documenti'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Insegnanti',
    testo: ['Foto, ruolo, biografia e competenze: compaiono in Chi siamo.'],
    evidenzia: ['Chi siamo'],
    scena: nuovo('/dashboard?s=insegnanti', '#insLista', 'Il team'),
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Le domande delle famiglie',
    testo: ['Quante domande riceve Étoile, quando, e cosa cercano le famiglie.'],
    evidenzia: ['cosa cercano le famiglie'],
    scena: nuovo('/dashboard?s=bot', '#chartDaily', 'Domande al giorno'),
  },
  apertura('prossimi', 'Prossimi passi', 'Cosa manca, quanto costa e come si va online.'),
  {
    capitolo: 'Prossimi passi',
    titolo: 'Cosa manca',
    testo: ['Una versione di lavoro: tre punti dipendono dalla scuola, due da noi.'],
    scena: { tipo: 'pannello', pannello: 'mancano' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Un costo unico',
    testo: ['Sito completo e modifiche fino alla pubblicazione.'],
    scena: { tipo: 'pannello', pannello: 'costo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Dopo la pubblicazione',
    testo: ['Cosa fai da sola, cosa facciamo noi e i nostri limiti.'],
    scena: { tipo: 'pannello', pannello: 'dopo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Proviamolo insieme',
    testo: ['Sito da computer e da telefono, poi la dashboard passo per passo.'],
    scena: { tipo: 'pannello', pannello: 'fine' },
  },
];
