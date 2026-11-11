export const SITO_ATTUALE = 'https://www.inballet.it';

type Dispositivo = 'pc' | 'telefono';

interface Segno {
  x: number;
  y: number;
  testo: string;
}

interface Scelta {
  etichetta: string;
  domanda: string;
  percorso: string;
  evidenzia?: string;
}

export type Scena =
  | { tipo: 'sito'; sito: 'attuale' | 'nuovo'; percorso: string; dispositivo: Dispositivo; evidenzia?: string; etichetta?: string; segni?: Segno[] }
  | { tipo: 'confronto'; attuale: string; nuovo: string; dispositivo: Dispositivo }
  | { tipo: 'pannello'; pannello: 'google' | 'zona' | 'mancano' | 'costo' | 'dopo' | 'fine' };

interface Punto {
  esito: 'si' | 'no';
  testo: string;
}

interface Passo {
  capitolo: string;
  titolo: string;
  testo: string[];
  evidenzia?: string[];
  punti?: Punto[];
  scelte?: Scelta[];
  scena: Scena;
}

export const passi: Passo[] = [
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Il nuovo sito, dal vivo',
    testo: [
      'Questa è la homepage del nuovo sito, caricata adesso. Al primo sguardo si capisce cosa siete, dove siete e per chi.',
      'Si avanza con le frecce, anche da tastiera. Il sito si può usare: cliccare, scorrere, aprire le pagine.',
    ],
    evidenzia: ['caricata adesso', 'le frecce'],
    punti: [
      { esito: 'si', testo: 'Cosa: una scuola di danza.' },
      { esito: 'si', testo: 'Dove: Lainate e Rho.' },
      { esito: 'si', testo: 'Per chi: dai 3 anni all’età adulta, anche senza esperienza.' },
      { esito: 'si', testo: 'Cosa fare: Scopri i corsi o Contattaci.' },
    ],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: '.hero-content', etichetta: 'Apertura della homepage' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Il prossimo evento è sempre in vista',
    testo: [
      'La fascia in alto annuncia il prossimo appuntamento su ogni pagina. Cambia da sola quando pubblichi un evento dalla dashboard, e se in un giorno ce ne sono più di uno li raccoglie insieme.',
    ],
    evidenzia: ['prossimo appuntamento'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: '.event-banner', etichetta: 'Prossimo evento' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Quattro voci al posto di nove tendine',
    testo: [
      'Corsi, La Scuola, Progetti e Formazione, con il pulsante Contattaci sempre visibile. Aprendo Corsi compaiono i 22 corsi, divisi per stile e per età.',
    ],
    evidenzia: ['Contattaci', '22 corsi'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: '.nav-menu', etichetta: 'Menu' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Una strada per ogni visitatore',
    testo: ['Il sito parla a quattro tipi di persone. Scegline una: si apre la pagina che troverebbe.'],
    scelte: [
      { etichetta: 'Famiglie', domanda: 'C’è un corso per mio figlio, vicino a casa?', percorso: '/prima-infanzia' },
      { etichetta: 'Adulti', domanda: 'Posso iniziare anche adesso?', percorso: '/contemporanea-adulti' },
      { etichetta: 'Insegnanti', domanda: 'Cerco una formazione riconosciuta.', percorso: '/formazione-insegnanti' },
      { etichetta: 'Scuole e aziende', domanda: 'Cerchiamo un partner sul territorio.', percorso: '/collaborazioni-scuole' },
    ],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/prima-infanzia', dispositivo: 'pc' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Il calendario degli eventi',
    testo: [
      'Gli appuntamenti si vedono nel calendario del mese. Ogni evento si apre con locandina e dettagli: con un tocco si aggiunge al calendario del telefono e, condiviso su WhatsApp, mostra la locandina.',
    ],
    evidenzia: ['calendario del telefono', 'WhatsApp'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/spettacoli-eventi', dispositivo: 'pc', evidenzia: '#vistaCalendario', etichetta: 'Calendario' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Gli orari arrivano da Google Maps',
    testo: [
      'Gli orari della segreteria sono quelli della scheda Google Maps della scuola, e il sito indica da solo se in questo momento è aperta o chiusa.',
      'Per cambiarli si aggiornano su Google: il sito li riprende in automatico.',
    ],
    evidenzia: ['scheda Google Maps', 'in automatico'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/contatti', dispositivo: 'pc', evidenzia: 'orari-segreteria', etichetta: 'Orari segreteria' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Le recensioni sono quelle di Google',
    testo: ['Voto, numero di recensioni e ultimi commenti arrivano dalla scheda Google della scuola e si aggiornano da soli.'],
    evidenzia: ['si aggiornano da soli'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: 'recensioni-google', etichetta: 'Recensioni Google' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Étoile, l’assistente del sito',
    testo: [
      'Risponde a ogni ora su corsi, età, sedi, orari e iscrizioni, usando i contenuti del sito. Si può aprire qui e fare una domanda.',
      'È l’ultima parte che stiamo completando.',
    ],
    evidenzia: ['a ogni ora'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: '#cb-toggle', etichetta: 'Apri la chat' },
  },
  {
    capitolo: 'Il nuovo sito',
    titolo: 'Foto e video della scuola',
    testo: ['Video in apertura e gallerie di lezioni, spettacoli e dietro le quinte, che scorrono da sole e si aprono a tutto schermo.'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/', dispositivo: 'pc', evidenzia: '.gallery-section', etichetta: 'Galleria' },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Il sito di oggi: non si capisce dove cliccare',
    testo: ['Questa è la homepage di inballet.it di oggi, caricata adesso su uno schermo da computer.'],
    evidenzia: ['inballet.it di oggi'],
    punti: [
      { esito: 'no', testo: 'Il nome I.N. BALLET finisce sotto il menu.' },
      { esito: 'no', testo: 'Il menu occupa due righe, con 9 tendine.' },
      { esito: 'no', testo: 'Età, sedi e corsi sono dentro un unico blocco di testo.' },
      { esito: 'no', testo: 'Nessun pulsante per contattarvi: i recapiti sono in fondo alla pagina.' },
    ],
    scena: {
      tipo: 'sito',
      sito: 'attuale',
      percorso: '/',
      dispositivo: 'pc',
      segni: [
        { x: 150, y: 128, testo: 'Nome coperto' },
        { x: 1200, y: 56, testo: '9 tendine' },
        { x: 1200, y: 420, testo: 'Solo testo' },
        { x: 683, y: 740, testo: 'Contatti in fondo' },
      ],
    },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Sei voci del menu riportano alla homepage',
    testo: [
      'Le voci di Atelier (Prima infanzia, Seconda infanzia, Bambini, Ragazzi, Adulti) e la voce Classi riaprono la homepage. Si può provare qui.',
      'Abbiamo controllato tutti i link del menu uno per uno il 5 novembre.',
    ],
    evidenzia: ['Atelier', 'Classi'],
    punti: [
      { esito: 'no', testo: '6 voci riportano alla homepage.' },
      { esito: 'no', testo: '8 voci del menu principale non hanno una pagina: aprono solo una tendina.' },
    ],
    scena: { tipo: 'sito', sito: 'attuale', percorso: '/', dispositivo: 'pc', segni: [{ x: 350, y: 75, testo: 'Atelier' }] },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Danza Classica porta a una pagina che non esiste',
    testo: ['Nel menu Danza, la voce Danza Classica apre questo indirizzo. È quello che trova oggi un genitore che cerca il corso.'],
    evidenzia: ['Danza Classica'],
    punti: [{ esito: 'no', testo: 'Errore 404: la pagina non esiste più.' }],
    scena: { tipo: 'sito', sito: 'attuale', percorso: '/danza_classica_accademica.html', dispositivo: 'pc' },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Sul nuovo sito lo stesso indirizzo porta al corso',
    testo: [
      'Lo stesso indirizzo che oggi dà errore, sul nuovo sito porta da solo alla pagina di Danza Classica.',
      'Vale per tutte le vecchie pagine: chi ha salvato un link o arriva da Google trova la pagina giusta, e la posizione su Google non si perde.',
    ],
    evidenzia: ['Lo stesso indirizzo', 'tutte le vecchie pagine'],
    punti: [{ esito: 'si', testo: 'Età, frequenza e sedi in apertura della pagina.' }],
    scena: {
      tipo: 'sito',
      sito: 'nuovo',
      percorso: '/danza_classica_accademica.html',
      dispositivo: 'pc',
      evidenzia: '.corso-intro-meta',
      etichetta: 'Le informazioni essenziali',
    },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Lo stesso telefono, due siti',
    testo: ['A sinistra inballet.it di oggi, a destra il nuovo sito, tutti e due alla misura di uno smartphone. Il nuovo sito è pensato prima di tutto per il telefono.'],
    evidenzia: ['per il telefono'],
    scena: { tipo: 'confronto', attuale: '/', nuovo: '/', dispositivo: 'telefono' },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Su Google la homepage si chiama “Home”',
    testo: [
      'Nei risultati di ricerca Google mostra il titolo e la descrizione che il sito gli fornisce. Quello del nuovo sito è letto adesso dalle sue pagine: se cambiamo un testo, cambia anche qui.',
    ],
    evidenzia: ['titolo', 'descrizione'],
    scena: { tipo: 'pannello', pannello: 'google' },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'La mappa del sito per Google',
    testo: [
      'La mappa del sito è l’elenco delle pagine che il sito consegna a Google. A sinistra il sito di oggi, a destra il nuovo, aperti adesso allo stesso indirizzo.',
    ],
    evidenzia: ['mappa del sito'],
    punti: [
      { esito: 'no', testo: 'Sito di oggi: la mappa non esiste.' },
      { esito: 'si', testo: 'Nuovo sito: tutte le pagine pubbliche elencate.' },
    ],
    scena: { tipo: 'confronto', attuale: '/sitemap.xml', nuovo: '/sitemap-0.xml', dispositivo: 'telefono' },
  },
  {
    capitolo: 'Prima e dopo',
    titolo: 'Le scuole qui intorno',
    testo: ['Abbiamo guardato come si presentano online le scuole di danza della zona. Molte hanno già un sito curato: oggi InBallet parte indietro.'],
    evidenzia: ['parte indietro'],
    scena: { tipo: 'pannello', pannello: 'zona' },
  },
  {
    capitolo: 'La dashboard',
    titolo: 'La tua area riservata',
    testo: ['Con una password entri nella dashboard: da qui aggiorni il sito da sola, senza scrivere codice. Quella che vedi è la dashboard vera.'],
    evidenzia: ['da sola', 'dashboard vera'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/dashboard', dispositivo: 'pc', evidenzia: '.topbar-nav', etichetta: 'Le quattro sezioni' },
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Eventi',
    testo: [
      'Crei un evento, carichi la locandina e scegli lo stato: pubblicato, bozza, annullato o esaurito. Appena pubblicato compare nella fascia in alto e nel calendario.',
    ],
    evidenzia: ['locandina'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/dashboard', dispositivo: 'pc', evidenzia: '[data-nuovo-evento]', etichetta: 'Nuovo evento' },
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Documenti',
    testo: ['Modulo di iscrizione, autocertificazioni, regolamenti: carichi i PDF e modifichi i testi della pagina Documenti.'],
    evidenzia: ['PDF'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/dashboard?s=documenti', dispositivo: 'pc', evidenzia: '#docLista', etichetta: 'I tuoi documenti' },
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Insegnanti',
    testo: [
      'Per ogni insegnante aggiungi foto, ruolo, biografia e competenze. La foto si ritaglia da sola e la sezione compare in Chi siamo dal primo nome inserito.',
    ],
    evidenzia: ['Chi siamo'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/dashboard?s=insegnanti', dispositivo: 'pc', evidenzia: '#insLista', etichetta: 'Il team' },
  },
  {
    capitolo: 'La dashboard',
    titolo: 'Le domande delle famiglie',
    testo: [
      'Vedi quante domande riceve Étoile, in che giorni e orari, le ultime conversazioni e la spesa del servizio. Dicono anche cosa cercano le famiglie.',
    ],
    evidenzia: ['cosa cercano le famiglie'],
    scena: { tipo: 'sito', sito: 'nuovo', percorso: '/dashboard?s=bot', dispositivo: 'pc', evidenzia: '#chartDaily', etichetta: 'Domande al giorno' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Cosa manca, da fare insieme',
    testo: ['Il sito che hai visto è una versione di lavoro. Prima di pubblicarlo restano questi punti: i primi tre dipendono dalla scuola, gli ultimi due da noi.'],
    evidenzia: ['versione di lavoro'],
    scena: { tipo: 'pannello', pannello: 'mancano' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Un costo unico',
    testo: ['Il compenso copre il sito completo e le modifiche concordate fino alla pubblicazione.'],
    scena: { tipo: 'pannello', pannello: 'costo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Dopo la pubblicazione',
    testo: ['Cosa puoi fare da sola, cosa possiamo fare noi e i nostri limiti, detti con chiarezza.'],
    scena: { tipo: 'pannello', pannello: 'dopo' },
  },
  {
    capitolo: 'Prossimi passi',
    titolo: 'Ora proviamolo insieme',
    testo: ['Apriamo il nuovo sito da computer e da telefono, poi la dashboard passo per passo, così puoi gestirla in autonomia.'],
    evidenzia: ['in autonomia'],
    scena: { tipo: 'pannello', pannello: 'fine' },
  },
];
