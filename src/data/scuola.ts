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
    titolo: 'Altre sedi',
    citta: 'Rho',
    indirizzo: 'Via Tevere 19, Rho (MI)',
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
    nome: 'Danza Classica e Moderna',
    immagine: { src: 'hero-bg.jpg', alt: 'Tutù di danza classica in sala' },
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
    nome: 'Danza Contemporanea',
    immagine: { src: 'gallery-6.jpg', alt: 'Coreografia di danza contemporanea sul palco' },
    descrizione: "L'arte più libera del movimento: Danza Contemporanea dai 10 anni, un corso per adulti over 40, Contact Improvisation e Movimento Creativo dai 18 anni.",
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
    immagine: { src: 'gallery-2.jpg', alt: 'Gruppo di ballerini sul palco con luci blu' },
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
    nome: 'Benessere e Movimento',
    immagine: { src: 'gallery-5.jpg', alt: 'Allieve in allungamento sul parquet della sala' },
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
    nome: 'Percorsi per Età',
    immagine: { src: 'gallery-8.jpg', alt: 'Insegnante abbraccia una piccola allieva in sala' },
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
  documenti: [
    {
      titolo: 'Modulo di iscrizione 2026/2027',
      nota: 'Con regolamento e informativa privacy',
      file: '/assets/files/modulo_iscrizione_2026_2027.pdf',
      peso: 'PDF, 730 KB',
    },
    {
      titolo: 'Autocertificazione di buona salute',
      nota: 'Per bambini sotto i 6 anni',
      file: '/assets/files/autocertificazione_minore_6_anni.pdf',
      peso: 'PDF, 38 KB',
    },
  ],
};

/** Domande frequenti: mostrate in homepage e pubblicate come FAQPage. */
export const faq = [
  {
    domanda: 'Da che età si può iniziare a danzare a InBallet?',
    risposta: `Si comincia dai 3 anni con i percorsi di Prima Infanzia (3-5 anni) e Seconda Infanzia (6-8 anni). Seguono i corsi per Bambini (9-11 anni), Ragazzi (12-16 anni) e Adulti, anche principianti assoluti: non c'è un limite di età per iniziare.`,
  },
  {
    domanda: 'Dove si trovano le sedi?',
    risposta: `La sede centrale è in ${sedi[0].indirizzo}. L'altra sede è in ${sedi[1].indirizzo}. Entrambe si trovano nell'area nord-ovest di Milano.`,
  },
  {
    domanda: 'Posso fare una lezione di prova?',
    risposta: `Sì: la prima lezione è di prova e senza impegno. Per prenotarla basta chiamare il ${scuola.telefono}, scrivere su WhatsApp o inviare un'e-mail a ${scuola.email}.`,
  },
  {
    domanda: 'Quali corsi di danza proponete?',
    risposta: 'Avviamento alla Danza (dai 3 anni) ed Educazione alla Danza (4-5 anni) per i più piccoli, poi danza classica, modern (dai 6 anni), contemporanea (dai 10 anni), contact improvisation, movimento creativo, hip-hop e breaking (dai 6 anni), heels, danza acrobatica, contaminato (dai 16 anni), hatha yoga e pilates, oltre a lezioni individuali e percorsi specifici per età.',
  },
  {
    domanda: 'Ci sono corsi di danza per adulti principianti?',
    risposta: 'Sì. Danza Contemporanea Adulti è dedicata a chi ha dai 40 anni in su, senza limiti di età, anche per chi ricomincia dopo anni di stop o parte da zero. Movimento Creativo è aperto agli adulti dai 18 anni, danzatori e non. Per il benessere ci sono Hatha Yoga e Pilates.',
  },
  {
    domanda: 'InBallet accoglie bambini e ragazzi con disabilità?',
    risposta: "Sì. Quasi tutte le classi sono predisposte per accogliere casi speciali: dopo un consulto con la Direzione si fissa un colloquio con la famiglia per scegliere il gruppo classe più adatto. Dal 2013, inoltre, il progetto NoiConVoi accoglie il lunedì sera ragazzi con disabilità in esperienze di danza con supporto psicomotorio, insieme a un team di volontari.",
  },
  {
    domanda: 'InBallet forma anche insegnanti di danza?',
    risposta: 'Sì. InBallet è Ente Formativo riconosciuto CSEN e CONI: propone un corso biennale di formazione per insegnanti di danza Modern e formazioni personalizzate per insegnanti, scuole ed enti.',
  },
  {
    domanda: 'Come ci si iscrive e quanto costano i corsi?',
    risposta: `Basta compilare il modulo di iscrizione (scaricabile dalla pagina Documenti) e consegnarlo in segreteria con il certificato medico per l'attività sportiva non agonistica, obbligatorio dai 6 anni; per i più piccoli basta l'autocertificazione dei genitori. La quota associativa annuale è di ${iscrizioni.quota} €, mentre il costo dei corsi dipende dalla disciplina e dalla frequenza: chiama il ${scuola.telefono} o scrivi a ${scuola.email} per il preventivo.`,
  },
];
