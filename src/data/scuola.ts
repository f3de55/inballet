/**
 * Dati ufficiali della scuola: unica fonte per pagine, dati strutturati
 * (Schema.org), chatbot e llms.txt. Modificare qui, non nelle pagine.
 */
export const FONDAZIONE = 2008;
/** Anni di attività (aggiornati automaticamente a ogni build). */
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
  /** Dati legali dell'associazione (modulo di iscrizione). */
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

/** Orari di apertura (come da scheda Google della scuola). */
export const orari: { giorni: string[]; etichetta: string; apre: string; chiude: string }[] = [
  { giorni: ['Monday', 'Tuesday', 'Friday'], etichetta: 'Lun, Mar, Ven', apre: '15:00', chiude: '23:00' },
  { giorni: ['Wednesday'], etichetta: 'Mer', apre: '16:00', chiude: '23:30' },
  { giorni: ['Thursday'], etichetta: 'Gio', apre: '15:00', chiude: '23:30' },
  { giorni: ['Saturday'], etichetta: 'Sab', apre: '10:30', chiude: '19:00' },
];

/** Corsi con la loro pagina, per categoria (usati in homepage e nei dati strutturati). */
export const categorieCorsi = [
  {
    id: 'classica-moderna',
    /** Icona Font Awesome della categoria (classe completa, così `npm run icons` la include) */
    icona: 'fa-feather',
    nome: 'Danza Classica e Moderna',
    sintesi: 'La base tecnica di ogni stile: si comincia a 3 anni e si arriva ai livelli avanzati.',
    immagine: { src: 'foto/tutu-classica.jpg', alt: 'Tutù rosa di danza classica', fuoco: { desktop: '60% 50%', mobile: '50% 45%' } },
    descrizione: 'Si comincia a 3 anni con Avviamento alla Danza, a 4-5 anni con Educazione alla Danza; dai 6 anni Danza Classica e Modern, fino ai livelli avanzati.',
    corsi: [
      { nome: 'Avviamento alla Danza', url: '/avviamento-danza' },
      { nome: 'Educazione alla Danza', url: '/educazione-danza' },
      { nome: 'Danza Classica', url: '/danza-classica' },
      { nome: 'Modern', url: '/modern' },
    ],
  },
  {
    id: 'contemporanea',
    icona: 'fa-wind',
    nome: 'Danza Contemporanea',
    sintesi: "L'arte più libera del movimento, dai 10 anni all'età adulta.",
    immagine: { src: 'foto/contact-improvisation-img2.jpg', alt: 'Due danzatori a terra durante una sequenza di contact improvisation', fuoco: { desktop: '50% 50%' } },
    descrizione: "L'arte più libera del movimento: Danza Contemporanea dai 10 anni, Contemporanea Adulti dai 40 anni, Contact Improvisation e Movimento Creativo, aperto dai 18 anni anche a chi non ha mai danzato.",
    corsi: [
      { nome: 'Danza Contemporanea', url: '/danza-contemporanea' },
      { nome: 'Contemporanea Adulti', url: '/contemporanea-adulti' },
      { nome: 'Contact Improvisation', url: '/contact-improvisation' },
      { nome: 'Movimento Creativo', url: '/movimento-creativo' },
    ],
  },
  {
    id: 'urban',
    icona: 'fa-headphones',
    nome: 'Urban Dance',
    sintesi: 'Gli stili urbani tra energia, tecnica e cultura Hip-Hop, dai 6 anni.',
    immagine: { src: 'foto/breaking-img2.jpg', alt: 'Allievi di breaking in freeze sul parquet della sala', fuoco: { desktop: '50% 50%', mobile: '50% 60%' } },
    descrizione: 'Hip-Hop e Breaking dai 6 anni, Heels, Danza Acrobatica e, dai 16 anni, il Contaminato: gli stili urbani tra energia, tecnica e cultura Hip-Hop.',
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
    icona: 'fa-spa',
    nome: 'Benessere e Movimento',
    sintesi: 'Per il benessere di corpo e mente, da soli o accanto a un corso di danza.',
    immagine: { src: 'foto/yoga-img2.jpg', alt: 'Lezione di yoga in sala, con le mani giunte sopra la testa', fuoco: { desktop: '55% 50%', mobile: '50% 35%' } },
    descrizione: "Hatha Yoga, Pilates per livelli e lezioni individuali: per il benessere di corpo e mente, da soli o accanto a un corso di danza.",
    corsi: [
      { nome: 'Yoga', url: '/yoga' },
      { nome: 'Pilates', url: '/pilates' },
      { nome: 'Classi di Gruppo', url: '/classi' },
      { nome: 'Lezioni Individuali', url: '/lezioni-individuali' },
    ],
  },
  {
    id: 'eta',
    icona: 'fa-child',
    nome: 'Percorsi per Età',
    sintesi: "Quali corsi scegliere in ogni fase della crescita, anche per chi inizia da grande.",
    immagine: { src: 'foto/bambini-gioco.jpg', alt: 'Bambine piccole giocano a danzare in sala', fuoco: { desktop: '50% 50%', mobile: '50% 35%' } },
    descrizione: "Quali corsi scegliere in ogni fase della crescita, dai 3 anni all'età adulta: una guida per fascia d'età, anche per chi inizia da grande.",
    corsi: [
      { nome: 'Prima Infanzia (3-5 anni)', url: '/prima-infanzia' },
      { nome: 'Seconda Infanzia (6-8 anni)', url: '/seconda-infanzia' },
      { nome: 'Bambini (9-11 anni)', url: '/bambini' },
      { nome: 'Ragazzi (12-16 anni)', url: '/ragazzi' },
      { nome: 'Adulti', url: '/adulti' },
    ],
  },
];

/** Iscrizioni all'anno in corso (dal modulo ufficiale): aggiornare a ogni anno. */
export const iscrizioni = {
  anno: '2026/2027',
  quota: 30,
  rate: [
    { scadenza: '1 settembre 2026', periodo: 'settembre - dicembre' },
    { scadenza: '16 dicembre 2026', periodo: 'gennaio - marzo' },
    { scadenza: '17 marzo 2027', periodo: 'aprile - giugno' },
  ],
};

/** Domande frequenti (tutte per chatbot e /llms.txt; quelle con `home` in homepage e nel FAQPage). */
export const faq = [
  {
    home: true,
    domanda: 'Da che età si può iniziare a danzare a InBallet?',
    risposta: "Dai 3 anni compiuti con Avviamento alla Danza; a 4-5 anni c'è Educazione alla Danza e dai 6 anni danza classica, modern, hip-hop e breaking. Ragazzi e adulti trovano corsi anche per principianti assoluti: non c'è un limite di età.",
  },
  {
    home: true,
    domanda: 'Dove si trovano le sedi?',
    risposta: `Due sedi a nord-ovest di Milano: la sede centrale in ${sedi[0].via} a ${sedi[0].citta} e la sede di ${sedi[1].via} a ${sedi[1].citta}.`,
  },
  {
    domanda: 'Come posso scegliere il corso giusto?',
    risposta: `Chiamaci al ${scuola.telefono}, scrivici su WhatsApp o a ${scuola.email}: ti aiutiamo a scegliere il corso adatto a età e livello, con orari, sedi e iscrizione.`,
  },
  {
    domanda: 'Quali corsi di danza proponete?',
    risposta: "Avviamento alla Danza dai 3 anni ed Educazione alla Danza a 4-5 anni; dai 6 anni danza classica, modern, hip-hop e breaking, dai 10 contemporanea e dai 16, con esperienza, il Contaminato. Poi heels, danza acrobatica e contact improvisation; per gli adulti contemporanea adulti (dai 40 anni), movimento creativo (dai 18), hatha yoga, pilates e lezioni individuali.",
  },
  {
    home: true,
    domanda: 'Ci sono corsi di danza per adulti principianti?',
    risposta: "Sì, a qualsiasi età. Danza Contemporanea Adulti è per chi ha dai 40 anni in su, anche partendo da zero o dopo anni di stop; Movimento Creativo è aperto dai 18 anni, a danzatori e non. Ci sono anche danza classica per livelli, hatha yoga e pilates.",
  },
  {
    home: true,
    domanda: 'InBallet accoglie bambini e ragazzi con disabilità?',
    risposta: "Sì. Quasi tutte le classi accolgono allievi con bisogni speciali, dopo un colloquio con la famiglia per scegliere il gruppo più adatto. Dal 2013, inoltre, il progetto NoiConVoi accoglie il lunedì sera ragazzi con disabilità, con supporto psicomotorio e un team di volontari.",
  },
  {
    domanda: 'InBallet forma anche insegnanti di danza?',
    risposta: "Sì. Dal 2023 InBallet è ente formativo riconosciuto CSEN e CONI: corso biennale per insegnanti di danza Modern con titolo a valenza nazionale e sei master, più formazioni su misura per educatori, terapeuti, scuole ed enti.",
  },
  {
    home: true,
    domanda: 'Come ci si iscrive e quanto costano i corsi?',
    risposta: `Si consegna in segreteria il modulo di iscrizione (pagina Documenti) con il certificato medico non agonistico, obbligatorio dai 6 anni; sotto i 6 anni basta l'autocertificazione dei genitori. La quota associativa è di ${iscrizioni.quota} € l'anno; il costo dei corsi dipende da disciplina e frequenza: per un preventivo chiama il ${scuola.telefono} o scrivi a ${scuola.email}.`,
  },
  {
    domanda: 'Gli allievi si esibiscono in spettacoli?',
    risposta: "Sì. Ogni anno la scuola porta in teatro uno spettacolo con gli allievi, nato dal lavoro dell'anno, e partecipa a eventi celebrativi e nelle scuole del territorio.",
  },
];

/** Le domande mostrate in homepage (e pubblicate come FAQPage). */
export const faqHome = faq.filter((f) => f.home);
