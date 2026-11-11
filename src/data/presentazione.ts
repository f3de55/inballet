export const SITO_ATTUALE = 'https://www.inballet.it';

type Dispositivo = 'pc' | 'telefono';

interface Riquadro {
  x: number;
  y: number;
  w: number;
  h: number;
  basso?: boolean;
}

export interface Schermata {
  nome: string;
  url: string;
  dispositivo: Dispositivo;
  evidenzia?: string;
  riquadro?: Riquadro;
  etichetta?: string;
}

export type Scena = { tipo: 'siti'; schermi: Schermata[] } | { tipo: 'pannello'; pannello: 'copertina' | 'mancano' | 'costo' | 'dopo' | 'fine' };

interface Punto {
  esito: 'si' | 'no';
  testo: string;
}

interface Scelta {
  etichetta: string;
  domanda: string;
  percorso: string;
}

interface Passo {
  capitolo: string;
  titolo: string;
  testo: string[];
  evidenzia?: string[];
  punti?: Punto[];
  scelte?: Scelta[];
  google?: boolean;
  scena: Scena;
}

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
    capitolo: 'Proposta',
    titolo: 'Restyling del sito InBallet',
    testo: ['Cosa non funziona oggi, il nuovo sito dal vivo, la dashboard e i prossimi passi.', 'Si avanza con le frecce, anche da tastiera.'],
    evidenzia: ['le frecce'],
    scena: { tipo: 'pannello', pannello: 'copertina' },
  },
  {
    capitolo: 'Il sito di oggi',
    titolo: 'Tutto in bianco e nero',
    testo: ['Il bianco e nero è elegante, ma una scuola di danza vive di colore.'],
    evidenzia: ['colore'],
    punti: [{ esito: 'no', testo: 'Tutte le foto misurate, homepage e 6 corsi, sono in bianco e nero.' }],
    scena: oggi('/modern.html#features2-1c', 'pc', { x: 124, y: 88, w: 1118, h: 260 }, 'Pagina Modern'),
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
    testo: ['Due righe, 9 tendine, 43 voci. «Danza integrativa», «Atelier», «Altri servizi» non orientano.'],
    evidenzia: ['9 tendine, 43 voci'],
    punti: [{ esito: 'no', testo: '8 voci principali non hanno una pagina.' }],
    scena: oggi('/', 'pc', { x: 292, y: 10, w: 1003, h: 93 }, '9 tendine'),
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
    scena: nuovo('/contatti', 'orari-segreteria', 'Orari segreteria'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Recensioni di Google',
    testo: ['Voto e ultime recensioni, aggiornati da soli.'],
    scena: nuovo('/', 'recensioni-google', 'Recensioni'),
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
    scena: nuovo('/', '.gallery-section', 'Galleria'),
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Nessun link perso',
    testo: ['Il vecchio indirizzo di Danza Classica ora porta al corso. Vale per tutte le vecchie pagine.'],
    evidenzia: ['tutte le vecchie pagine'],
    scena: nuovo('/danza_classica_accademica.html', '.corso-intro-meta', 'Età e frequenza'),
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
  {
    capitolo: 'Su Google',
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
    capitolo: 'Su Google',
    titolo: 'La mappa del sito',
    testo: ['L’elenco delle pagine da consegnare a Google: oggi non esiste, nel nuovo sito si aggiorna da sola.'],
    evidenzia: ['non esiste'],
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Sito di oggi', url: `${SITO_ATTUALE}/sitemap.xml`, dispositivo: 'pc' },
        { nome: 'Nuovo sito', url: '/sitemap-0.xml', dispositivo: 'pc' },
      ],
    },
  },
  {
    capitolo: 'Su Google',
    titolo: 'Le scuole della zona',
    testo: ['Le homepage delle scuole di Lainate e Rho, dal vivo, accanto a InBallet oggi.'],
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'InBallet oggi', url: `${SITO_ATTUALE}/`, dispositivo: 'pc' },
        { nome: 'Valentina Ponzone · Lainate', url: 'https://www.valentinaponzonedanceacademy.it/', dispositivo: 'pc' },
        { nome: 'Backstage · Lainate', url: 'https://www.backstage-danza.it/', dispositivo: 'pc' },
        { nome: 'Spazio Dance On · Rho', url: 'https://www.spaziodanceon.it/', dispositivo: 'pc' },
        { nome: 'City Dance Academy · Rho', url: 'https://www.citydanceacademy.club/', dispositivo: 'pc' },
        { nome: 'Accademia Balletto Classico · Rho', url: 'https://www.accademiaballettoclassico.it/', dispositivo: 'pc' },
      ],
    },
  },
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
