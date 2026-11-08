export interface Documento {
  id: string;
  titolo: string;
  nota: string;
  file: string;
  peso: string;
  categoria?: 'modulo' | 'statuto';
}

export interface PaginaDocumenti {
  hero: { titolo: string; testo: string };
  sezione: {
    eyebrow: string;
    titolo: string;
    accento: string;
    intro: string;
  };
  documenti: Documento[];
}

export const documentiPredefiniti: PaginaDocumenti = {
  hero: {
    titolo: 'Iscrizioni e documenti',
    testo: "Modulo di iscrizione, autocertificazione e scadenze **2026/2027**: tutto per iscriversi a InBallet.",
  },
  sezione: {
    eyebrow: 'Iscrizioni 2026/2027',
    titolo: 'Moduli da',
    accento: 'scaricare',
    intro:
      "Compila il modulo e consegnalo firmato in segreteria: per qualsiasi dubbio, ti aiutiamo noi. **Dai 6 anni** serve anche il **certificato medico non agonistico**; sotto i 6 anni basta l'**autocertificazione** dei genitori.",
  },
  documenti: [
    {
      id: 'doc_modulo',
      titolo: 'Modulo di iscrizione 2026/2027',
      nota: 'Con regolamento e informativa privacy',
      file: '/assets/files/modulo_iscrizione_2026_2027.pdf',
      peso: 'PDF, 730 KB',
    },
    {
      id: 'doc_autocertificazione',
      titolo: 'Autocertificazione di buona salute',
      nota: 'Per bambini sotto i 6 anni',
      file: '/assets/files/autocertificazione_minore_6_anni.pdf',
      peso: 'PDF, 38 KB',
    },
  ],
};
