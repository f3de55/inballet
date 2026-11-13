export const SITO_ATTUALE = 'https://www.inballet.it';
export const SITO_OGGI = '/sito-oggi';
export const DOMANDA_AI = 'Mi consigli una scuola di danza a Lainate?';
export const RICERCA_GOOGLE = `https://www.google.com/search?igu=1&hl=it&gl=it&q=${encodeURIComponent(DOMANDA_AI)}`;

interface RispostaAI {
  nome: string;
  modello: string;
  chiesta: string;
  testo: string;
  fonti: { titolo: string; url: string }[];
}

export const ASSISTENTI: Record<'google' | 'chatgpt' | 'claude', RispostaAI> = {
  google: {
    nome: 'Google AI',
    modello: 'Overview dell’AI di Google',
    chiesta: '2026-11-14',
    testo: `A Lainate sono presenti diverse scuole di danza e accademie con proposte per tutte le età e discipline:

## Principali Scuole di Danza a Lainate

**Valentina Ponzone Dance Academy**
- Corsi: Danza classica, danza moderna, hip hop, propedeutica alla danza, danza gioco, danza aerea sul cerchio, pilates e sbarra per adulti.
- Sito ufficiale: Valentina Ponzone Dance Academy

**Movin'up Progetto Danza ASD**
- Corsi: Attiva da oltre 30 anni, offre danza classica, modern, contemporaneo, giocodanza, acrodance, hip hop, dance tone up e pilates.
- Dettagli: Comune di Lainate - Movin'up Progetto Danza

**DSP | School of Dance & Performing Arts (Studio Pro)**
- Indirizzo: Spaziolabs60, Via E. Caldara 18A, Lainate (MI)
- Corsi: Classical Ballet, Modern Jazz, Musical, Hip Hop, Contemporaneo, Breakdance, Commercial, Heels, Pilates, Country e Yoga.
- Instagram: DSP Studio Pro

**Be Art Studio**
- Corsi: Discipline aeree (pole dance, tessuti e cerchi aerei), arti circensi, danza classica e moderna.
- Sito ufficiale: Be Art Studio

**Wanna Dance Asd**
- Indirizzo: Via Campania 6, Lainate (MI)
- Corsi: Hip hop, danza moderna, danza classica, gioco danza dai 3 anni e fitness.
- Pagina social: Wanna Dance Asd

**Alma y Giada**
- Corsi: Scuola specializzata in liscio da sala e balli di coppia.
- Sito ufficiale: Alma y Giada

Se mi indichi quale genere di danza ti interessa (es. classica, hip hop, aerea, balli di coppia) o per chi è il corso (bambini, ragazzi o adulti), posso darti informazioni più specifiche su orari o lezioni di prova.`,
    fonti: [
      { titolo: 'Be Art Studio', url: 'https://www.beartstudio.eu/' },
      { titolo: 'Valentina Ponzone', url: 'https://www.valentinaponzonedanceacademy.it/' },
      { titolo: 'DSP Studio Pro su Instagram', url: 'https://www.instagram.com/studiopro.lainate/' },
    ],
  },
  chatgpt: {
    nome: 'ChatGPT',
    modello: 'ChatGPT con ricerca sul web',
    chiesta: '2026-11-14',
    testo: `A Lainate ci sono diverse scuole di danza interessanti. Ho confrontato l'offerta formativa, le recensioni e le informazioni disponibili sui siti ufficiali.

La mia prima scelta sarebbe **I.N. Ballet**, soprattutto se cerchi una scuola con diversi stili di danza, percorsi per bambini e adulti e attenzione sia alla tecnica sia all'espressione artistica.

## Le 4 scuole che ti consiglio

**1. I.N. Ballet**
Via Puccini, Lainate
Danza classica, moderna, contemporanea, urban e benessere. Dai 3 anni, con corsi anche per adulti e un progetto dedicato all'inclusione.

**2. A.S.D. Backstage Arte in Movimento**
Viale De Gasperi 1, Lainate
Interessante per modern jazz, contemporaneo e percorsi tecnici. Organizza lezioni a numero chiuso, differenziate per età e livello.

**3. Valentina Ponzone dance academy**
Via Puccini 13, Lainate
Ottima candidata per chi cerca classica, propedeutica, moderna e hip-hop. Offre anche danza aerea sul cerchio e Pilates.

**4. Studio Pro - School of Dance & Performing Arts**
Via Caldara 18A, Lainate
Particolarmente interessante per chi vuole combinare danza, musical, formazione artistica e spettacoli.

## Dove si trovano

- I.N. Ballet · 4,9
- A.S.D. Backstage Arte in Movimento · 5,0
- Valentina Ponzone dance academy · 4,9
- Studio Pro - School of Dance & Performing Arts · 5,0

La mia scelta dipenderebbe soprattutto dall'obiettivo: **I.N. Ballet** per un percorso multidisciplinare, **Backstage** per modern e contemporaneo, **Valentina Ponzone** per classica e propedeutica, **Studio Pro** per musical e spettacolo.

**Ti chiedo una cosa:** stai cercando una scuola di danza per te, per un bambino o per un ragazzo? E quale stile ti interessa? Così posso consigliarti quella più adatta, non semplicemente la più conosciuta.`,
    fonti: [
      { titolo: 'inballet.it', url: 'https://www.inballet.it/' },
      { titolo: 'backstage-danza.it', url: 'https://www.backstage-danza.it/' },
      { titolo: 'valentinaponzonedanceacademy.it', url: 'https://www.valentinaponzonedanceacademy.it/' },
      { titolo: 'Comune di Lainate', url: 'https://comune.lainate.mi.it/associazioni/associazioni-sportive/danzarte-asd/' },
    ],
  },
  claude: {
    nome: 'Claude',
    modello: 'Claude Sonnet 5.5 con ricerca sul web',
    chiesta: '2026-11-14',
    testo: `## Scuole di danza a Lainate

- **I.N. Ballet** · 4,9 (31) · Scuola multidisciplinare, Via Puccini 13
- **Valentina Ponzone dance academy** · 4,9 (15) · Via Puccini 13
- **Wanna Dance** · 4,6 (47) · Danza per bambini e adulti, Via Campania 6
- **A.S.D. Backstage Arte in Movimento** · 5,0 (25) · Classica, contemporaneo, modern jazz, hip hop
- **Studio Pro - School of Dance & Performing Arts** · 5,0 (27) · Via Caldara 18A, anche corsi per adulti
- **SCHOOL OF DANCE Almalatina A.S.D.** · 4,7 (21) · Ballo (latino/coppia), Via Rubicone 16
- **Scuola di ballo - GDS Giada / Alma Y Giada** · 4,8 (19) · Ballo latino-americano, Via Milano 23

Non posso dirti qual è “la migliore” senza sapere per chi è (bambino, adulto) e che stile cerchi. Ti dico quali scuole ci sono e per cosa si distinguono. Le informazioni vengono da Google Maps e dalle sue recensioni, non da siti ufficiali delle scuole. Le valutazioni sono alte per tutte, tra 4,6 e 5 su 5.

**Danza classica, moderna, contemporanea (bambini e ragazzi)**

- **A.S.D. Backstage Arte in Movimento** (Viale De Gasperi 1, tel. 347 841 1541): classica, contemporanea, modern jazz e hip hop. Le recensioni parlano di corsi dai 3 anni in su e di un gruppo di modern jazz per adulte.
- **I.N. Ballet** (Via Puccini 13, tel. 393 780 2996): scuola multidisciplinare, con direzione artistica di Ilenia Nobile. Ha 31 recensioni e tiene aperto anche il sabato.
- **Wanna Dance** (Via Campania 6): corsi per bambini e adulti. Propone anche gioco danza per i più piccoli e corsi di TRX e Pilates. Ha il maggior numero di recensioni (47). Su Google non risultano orari né telefono.
- **Valentina Ponzone dance academy** (Via Puccini 13, tel. 02 9392 0039): ha orari ampi, dal lunedì al venerdì dalle 9 alle 21 e il sabato mattina.

**Adulti, anche principianti**

- **Studio Pro – School of Dance & Performing Arts** (Via Caldara 18A, tel. 339 813 2329): le recensioni citano corsi per bambini e per adulti.

**Ballo di coppia / latino-americano**

- **Almalatina A.S.D.** (Via Rubicone 16, tel. 333 607 0669)
- **GDS Giada / Alma Y Giada** (Via Milano 23, tel. 339 471 2581)

**Da verificare**

- I.N. Ballet e Valentina Ponzone risultano allo stesso indirizzo (Via Puccini 13). Un elenco online (Virgilio) riporta allo stesso civico anche l’ASD Champion’s Touch. Chiama per capire se sono realtà separate.
- Orari, prezzi e disponibilità di posti non li ho trovati su fonti ufficiali. Per iscrizione e prova gratuita contatta direttamente la scuola.

Se mi dici età e stile (classica, hip hop, adulti, ballo di coppia), ti restringo la scelta.

Fonti: Google Maps (schede e recensioni delle scuole); Virgilio Aziende – Champion’s Touch`,
    fonti: [],
  },
};
export type Assistente = keyof typeof ASSISTENTI;

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
    titolo: 'Google, ChatGPT e Claude',
    senzaNota: true,
    scena: {
      tipo: 'siti',
      schermi: [
        { nome: 'Google', url: RICERCA_GOOGLE, dispositivo: 'pc' },
        { nome: 'Google AI', url: '/presentazione/google', dispositivo: 'pc' },
        { nome: 'ChatGPT', url: '/presentazione/chatgpt', dispositivo: 'pc' },
        { nome: 'Claude', url: '/presentazione/claude', dispositivo: 'pc' },
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
        { nome: 'Sito di oggi', url: '/presentazione/mappa/oggi', dispositivo: 'pc' },
        { nome: 'Nuovo sito', url: '/presentazione/mappa/nuovo', dispositivo: 'pc' },
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
