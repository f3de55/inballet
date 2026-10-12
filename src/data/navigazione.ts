/**
* Struttura della navigazione: usata dalla navbar (desktop e mobile) e dai
* breadcrumb delle pagine interne. Modificare qui per aggiungere una pagina.
*/
/** `breve`: nome corto usato nel footer, dove lo spazio è minore. */
export interface Voce { nome: string; href: string; breve?: string }
export interface Menu { id: string; label: string; href?: string; compatto: boolean; sezioni: { titolo: string; voci: Voce[] }[] }

/** Voci della navigazione (desktop e mobile). Corsi apre la sua pagina al clic. */
export const menu: Menu[] = [
  {
    id: 'corsi', label: 'Corsi', href: '/corsi', compatto: false,
    sezioni: [
      { titolo: 'Danza Classica e Moderna', voci: [
        { nome: 'Avviamento alla Danza', href: '/avviamento-danza' },
        { nome: 'Educazione alla Danza', href: '/educazione-danza' },
        { nome: 'Danza Classica', href: '/danza-classica' },
        { nome: 'Modern', href: '/modern' },
      ] },
      { titolo: 'Danza Contemporanea', voci: [
        { nome: 'Danza Contemporanea', href: '/danza-contemporanea' },
        { nome: 'Danza Contemporanea Adulti', href: '/contemporanea-adulti' },
        { nome: 'Contact Improvisation', href: '/contact-improvisation' },
        { nome: 'Movimento Creativo', href: '/movimento-creativo' },
      ] },
      { titolo: 'Urban Dance', voci: [
        { nome: 'Hip-Hop', href: '/hip-hop' },
        { nome: 'Heels', href: '/heels' },
        { nome: 'Breaking', href: '/breaking' },
        { nome: 'Danza Acrobatica', href: '/danza-acrobatica' },
        { nome: 'Contaminato', href: '/contaminato' },
      ] },
      { titolo: 'Benessere e Movimento', voci: [
        { nome: 'Yoga', href: '/yoga' },
        { nome: 'Pilates', href: '/pilates' },
        { nome: 'Classi', href: '/classi' },
        { nome: 'Lezioni Individuali', href: '/lezioni-individuali' },
      ] },
      { titolo: 'Percorsi per Età', voci: [
        { nome: 'Prima Infanzia', href: '/prima-infanzia' },
        { nome: 'Seconda Infanzia', href: '/seconda-infanzia' },
        { nome: 'Bambini', href: '/bambini' },
        { nome: 'Ragazzi', href: '/ragazzi' },
        { nome: 'Adulti', href: '/adulti' },
      ] },
    ],
  },
  {
    id: 'scuola', label: 'La Scuola', compatto: true,
    sezioni: [{ titolo: 'La Scuola', voci: [
      { nome: 'Chi Siamo', href: '/chi-siamo' },
      { nome: 'Spettacoli ed Eventi', href: '/spettacoli-eventi' },
      { nome: 'Collaborazioni con Scuole', href: '/collaborazioni-scuole', breve: 'Collaborazioni con le scuole' },
      { nome: 'Sportello Psicologico', href: '/sportello-psicologico' },
      { nome: 'Documenti', href: '/documenti' },
    ] }],
  },
  {
    id: 'progetti', label: 'Progetti', compatto: true,
    sezioni: [{ titolo: 'Danza Integrativa', voci: [
      { nome: 'Classi Multidisciplinari Integrate', href: '/classi-integrate', breve: 'Classi Integrate' },
      { nome: 'Progetto NoiConVoi', href: '/progetto-noiconvoi' },
      { nome: 'Sostenitori Progetti Sociali', href: '/sostenitori', breve: 'Sostenitori' },
    ] }],
  },
  {
    id: 'formazione', label: 'Formazione', compatto: true,
    sezioni: [{ titolo: 'Percorsi Professionali', voci: [
      { nome: 'Corso di Formazione per Insegnanti di Danza', href: '/formazione-insegnanti', breve: 'Formazione Insegnanti' },
      { nome: 'Formazioni Personalizzate', href: '/formazioni-personalizzate' },
    ] }],
  },
];

/** Pagine fuori dal menu: nome mostrato nei breadcrumb. */
export const altrePagine: Record<string, string> = {
  '/contatti': 'Contatti',
};
