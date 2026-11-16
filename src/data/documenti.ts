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
  documenti: Documento[];
}

export const documentiPredefiniti: PaginaDocumenti = {
  hero: {
    titolo: 'Iscrizioni e documenti',
    testo: "Modulo di iscrizione, autocertificazione e scadenze **2026/2027**: tutto per iscriversi a InBallet.",
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
