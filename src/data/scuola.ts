export const FONDAZIONE = 2007;
export const ANNI_ATTIVITA = new Date().getFullYear() - FONDAZIONE;

export const scuola = {
  nome: 'InBallet ASD',
  nomiAlternativi: ['I.N. Ballet', 'InBallet', 'ASD I.N. Ballet'],
  sito: 'https://www.inballet.it',
  telefono: '+39 393 780 2996',
  telefonoHref: 'tel:+393937802996',
  telefonoSchema: '+39-393-780-2996',
  email: 'info@inballet.it',
  whatsapp: 'https://wa.me/393937802996',
  fondatrice: 'Ilenia Nobile',
  ragioneSociale: 'Associazione Sportiva Dilettantistica I.N. Ballet',
  codiceFiscale: '93550490150',
  social: {
    instagram: 'https://www.instagram.com/i.n.ballet/',
    facebook: 'https://www.facebook.com/inballetasd/',
  },
} as const;

export interface Sede {
  id: string;
  titolo: string;
  citta: string;
  indirizzo: string;
  via: string;
  cap: string;
  provincia: string;
  maps: string;
  geo?: { lat: number; lng: number };
}

export const sedi: Sede[] = [
  {
    id: 'lainate',
    titolo: 'Sede centrale',
    citta: 'Lainate',
    indirizzo: 'Via Puccini, 14 - Lainate (MI)',
    via: 'Via Puccini, 14',
    cap: '20045',
    provincia: 'MI',
    maps: 'https://www.google.com/maps/search/?api=1&query=Via+Puccini+14+Lainate+MI',
    geo: { lat: 45.5722, lng: 9.0425 },
  },
  {
    id: 'rho',
    titolo: 'Sede di Rho',
    citta: 'Rho',
    indirizzo: 'Via Tevere, 19 - Rho (MI)',
    via: 'Via Tevere, 19',
    cap: '20017',
    provincia: 'MI',
    maps: 'https://www.google.com/maps/search/?api=1&query=Via+Tevere+19+Rho+MI',
  },
];

export const categorieCorsi = [
  {
    id: 'classica-moderna',
    nome: 'Danza Classica e Moderna',
    sintesi: 'La base di ogni stile: si comincia giocando a 3 anni e si arriva ai livelli avanzati.',
    immagine: { src: 'foto/tutu-classica.jpg', alt: 'Tutù rosa di danza classica', fuoco: { desktop: '60% 50%', mobile: '50% 45%' } },
    immagineHome: { src: 'grafica-corsi/classica-moderna-unica.webp', fuoco: { desktop: '50% 50%' } },
    descrizione: 'Si comincia giocando: a 3 anni con Avviamento alla Danza, a 4-5 anni con Educazione alla Danza. Dai 6 anni arrivano Danza Classica e Modern, fino ai livelli avanzati.',
    evidenzia: ['3 anni', '4-5 anni', 'dai 6 anni'],
    corsi: [
      { nome: 'Avviamento alla Danza', url: '/avviamento-danza' },
      { nome: 'Educazione alla Danza', url: '/educazione-danza' },
      { nome: 'Danza Classica', url: '/danza-classica' },
      { nome: 'Modern', url: '/modern' },
    ],
  },
  {
    id: 'contemporanea',
    nome: 'Danza Contemporanea',
    sintesi: "L'arte più libera del movimento, dai 10 anni in su. Per gli adulti, anche da zero.",
    immagine: { src: 'foto/contact-improvisation-img2.jpg', alt: 'Due danzatori a terra durante una sequenza di contact improvisation', fuoco: { desktop: '50% 50%' } },
    immagineHome: { src: 'grafica-corsi/contemporanea-unica.webp', fuoco: { desktop: '50% 50%' } },
    descrizione: "L'arte più libera del movimento: Danza Contemporanea dai 10 anni, Contemporanea Adulti dai 40 anni, anche partendo da zero, Contact Improvisation e Movimento Creativo, aperto dai 18 anni anche a chi non ha mai danzato.",
    evidenzia: ['dai 10 anni', 'dai 40 anni', 'dai 18 anni'],
    corsi: [
      { nome: 'Danza Contemporanea', url: '/danza-contemporanea' },
      { nome: 'Contemporanea Adulti', url: '/contemporanea-adulti' },
      { nome: 'Contact Improvisation', url: '/contact-improvisation' },
      { nome: 'Movimento Creativo', url: '/movimento-creativo' },
    ],
  },
  {
    id: 'urban',
    nome: 'Urban Dance',
    sintesi: 'Gli stili urbani tra energia, tecnica e cultura Hip-Hop, dai 6 anni.',
    immagine: { src: 'foto/breaking-img2.jpg', alt: 'Allievi di breaking in freeze sul parquet della sala', fuoco: { desktop: '50% 50%', mobile: '50% 60%' } },
    immagineHome: { src: 'grafica-corsi/urban-unica.webp', fuoco: { desktop: '50% 50%' } },
    descrizione: 'Hip-Hop e Breaking dai 6 anni, Heels, Danza Acrobatica e, dai 16 anni, il Contaminato: gli stili urbani tra energia, tecnica e cultura Hip-Hop.',
    evidenzia: ['dai 6 anni', 'dai 16 anni'],
    corsi: [
      { nome: 'Hip-Hop', url: '/hip-hop' },
      { nome: 'Heels', url: '/heels' },
      { nome: 'Breaking', url: '/breaking' },
      { nome: 'Danza Acrobatica', url: '/danza-acrobatica' },
      { nome: 'Contaminato', url: '/contaminato' },
    ],
  },
  {
    id: 'benessere',
    nome: 'Benessere e Movimento',
    sintesi: 'Tempo per il corpo e per la mente, da solo o accanto a un corso di danza.',
    immagine: { src: 'foto/yoga-img2.jpg', alt: 'Lezione di yoga in sala, con le mani giunte sopra la testa', fuoco: { desktop: '55% 50%', mobile: '50% 35%' } },
    immagineHome: { src: 'grafica-corsi/benessere-unica.webp', fuoco: { desktop: '50% 50%' } },
    descrizione: "Hatha Yoga, Pilates per livelli e lezioni individuali: tempo per il corpo e per la mente, da solo o accanto a un corso di danza.",
    evidenzia: ['Hatha Yoga', 'Pilates', 'lezioni individuali'],
    corsi: [
      { nome: 'Yoga', url: '/yoga' },
      { nome: 'Pilates', url: '/pilates' },
      { nome: 'Classi di Gruppo', url: '/classi' },
      { nome: 'Lezioni Individuali', url: '/lezioni-individuali' },
    ],
  },
  {
    id: 'eta',
    nome: 'Percorsi per Età',
    sintesi: "Quali corsi scegliere in ogni fase della crescita, anche per chi inizia da grande.",
    immagine: { src: 'foto/bambini-gioco.jpg', alt: 'Bambine piccole giocano a danzare in sala', fuoco: { desktop: '50% 50%', mobile: '50% 35%' } },
    descrizione: "Non sai da dove partire? Ecco quali corsi scegliere in ogni fase della crescita, dai 3 anni all'età adulta, anche per chi inizia da grande.",
    evidenzia: ["dai 3 anni all'età adulta", 'anche per chi inizia da grande'],
    corsi: [
      { nome: 'Prima Infanzia (3-5 anni)', url: '/prima-infanzia' },
      { nome: 'Seconda Infanzia (6-8 anni)', url: '/seconda-infanzia' },
      { nome: 'Bambini (9-11 anni)', url: '/bambini' },
      { nome: 'Ragazzi (12-16 anni)', url: '/ragazzi' },
      { nome: 'Adulti', url: '/adulti' },
    ],
  },
];

export const iscrizioni = {
  anno: '2026/2027',
  quota: 30,
  rate: [
    { scadenza: '1 settembre 2026', periodo: 'settembre - dicembre' },
    { scadenza: '16 dicembre 2026', periodo: 'gennaio - marzo' },
    { scadenza: '17 marzo 2027', periodo: 'aprile - giugno' },
  ],
};

export const faq = [
  {
    home: true,
    domanda: 'Da che età si può iniziare a danzare a InBallet?',
    risposta: 'Dai 3 anni compiuti con Avviamento alla Danza, a 4-5 anni con Educazione alla Danza. Dai 6 anni si sceglie tra classica, modern, hip-hop e breaking; ragazzi e adulti possono iniziare anche da zero.',
    evidenzia: ['Dai 3 anni compiuti', '4-5 anni', 'Dai 6 anni', 'anche da zero'],
  },
  {
    home: true,
    domanda: 'Dove si trovano le sedi?',
    risposta: `A nord-ovest di Milano: la sede centrale in ${sedi[0].via} a ${sedi[0].citta} e la sede di ${sedi[1].citta} in ${sedi[1].via}.`,
    evidenzia: [sedi[0].citta, sedi[1].citta],
  },
  {
    domanda: 'Come posso scegliere il corso giusto?',
    risposta: `Lo scegliamo insieme: chiamaci al ${scuola.telefono}, scrivici su WhatsApp o a ${scuola.email}. Ti aiutiamo a trovare il corso adatto a età e livello, con orari, sedi e iscrizione.`,
    evidenzia: [scuola.telefono, scuola.email, 'età e livello'],
  },
  {
    domanda: 'Quali corsi di danza proponete?',
    risposta: "Avviamento alla Danza dai 3 anni ed Educazione alla Danza a 4-5 anni; dai 6 anni danza classica, modern, hip-hop e breaking, dai 10 contemporanea e dai 16, con esperienza, il Contaminato. Poi heels, danza acrobatica e contact improvisation; per gli adulti contemporanea adulti (dai 40 anni), movimento creativo (dai 18), hatha yoga, pilates e lezioni individuali.",
    evidenzia: ['dai 3 anni', '4-5 anni', 'dai 6 anni'],
  },
  {
    home: true,
    domanda: 'Ci sono corsi di danza per adulti principianti?',
    risposta: 'Sì. Danza Contemporanea Adulti è dai 40 anni, anche da zero o dopo anni di stop; Movimento Creativo è aperto dai 18 anni, anche a chi non ha mai danzato. Ci sono anche yoga e pilates.',
    evidenzia: ['Danza Contemporanea Adulti', 'dai 40 anni', 'Movimento Creativo', 'dai 18 anni'],
  },
  {
    home: true,
    domanda: 'InBallet accoglie bambini e ragazzi con disabilità?',
    risposta: 'Sì. Quasi tutte le classi accolgono allievi con bisogni speciali, dopo un colloquio con la famiglia. Dal 2013 il progetto NoiConVoi accoglie il lunedì sera ragazzi con disabilità, con supporto psicomotorio e volontari.',
    evidenzia: ['bisogni speciali', 'progetto NoiConVoi', 'lunedì sera'],
  },
  {
    domanda: 'InBallet forma anche insegnanti di danza?',
    risposta: "Sì. Dal 2023 InBallet è ente formativo riconosciuto per il titolo di Insegnante di Danza, valido CSEN e CONI a livello nazionale: un corso biennale con specializzazione Modern e la possibilità di proseguire con sei master. Propone anche formazioni su misura per educatori, terapeuti, scuole ed enti.",
    evidenzia: ['Dal 2023', 'CSEN e CONI', 'corso biennale'],
  },
  {
    home: true,
    domanda: 'Come ci si iscrive?',
    risposta: "Si consegna in segreteria il modulo di iscrizione, che trovi in Documenti, con il certificato medico non agonistico in originale, obbligatorio dai 6 anni. Sotto i 6 anni basta l'autocertificazione firmata da entrambi i genitori.",
    evidenzia: ['modulo di iscrizione', 'certificato medico non agonistico', 'dai 6 anni', 'entrambi i genitori'],
  },
  {
    home: true,
    domanda: 'Quanto costa e come si paga?',
    risposta: `La quota associativa è di ${iscrizioni.quota} € l'anno. Il corso, che varia per disciplina e frequenza, si paga in tre rate (settembre, dicembre, marzo), in contanti in sede o con bonifico. Per i figli minorenni la spesa è detraibile fino a 210 €.`,
    evidenzia: [`${iscrizioni.quota} €`, 'tre rate', 'detraibile fino a 210 €'],
  },
  {
    domanda: 'Gli allievi si esibiscono in spettacoli?',
    risposta: "Sì. Ogni anno la scuola porta in teatro uno spettacolo con gli allievi, nato dal lavoro dell'anno e aperto ai ragazzi di NoiConVoi e delle classi integrate. Partecipa anche a eventi celebrativi e nelle scuole del territorio.",
    evidenzia: ['in teatro uno spettacolo'],
  },
  {
    home: true,
    domanda: 'La danza è anche per ragazzi e papà?',
    risposta: "Certo. Molti ragazzi studiano hip-hop e breaking, che si iniziano dai 6 anni. E c'è Only for Dad, il gruppo dei papà delle allieve che propone coreografie.",
    evidenzia: ['hip-hop e breaking', 'dai 6 anni', 'Only for Dad'],
  },
  {
    domanda: 'InBallet assegna borse di studio?',
    risposta: "Sì. Ogni anno la scuola premia l'impegno degli allievi e le borse di studio tengono conto anche dell'andamento scolastico. Una di queste ha offerto a due allieve una settimana di lezioni in cinque scuole di New York, tra cui Alvin Ailey e Martha Graham.",
    evidenzia: ['borse di studio', "andamento scolastico"],
  },
  {
    domanda: 'Chi è Ilenia Nobile?',
    risposta: `${scuola.fondatrice} è la fondatrice e Direttrice Artistica di InBallet: professoressa di danza, psicomotricista, formatrice, operatrice per l'educazione speciale e insegnante certificata ContaKids World. Nel ${FONDAZIONE} ha fondato la scuola e nel 2013 ha creato il progetto NoiConVoi.`,
    evidenzia: [scuola.fondatrice, 'Direttrice Artistica'],
  },
];

export const faqHome = faq.filter((f) => f.home);
