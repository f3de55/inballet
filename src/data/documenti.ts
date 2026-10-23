/**
 * Pagina /documenti: contenuti predefiniti. Sono quelli che il sito mostra
 * finché non vengono modificati dalla dashboard (che li salva in
 * DATA_DIR/documenti.json, vedi src/lib/documenti.ts).
 */

export interface Documento {
  id: string;
  titolo: string;
  /** Riga sotto il titolo (es. «Per bambini sotto i 6 anni») */
  nota: string;
  /** Percorso pubblico del PDF */
  file: string;
  /** Peso già formattato (es. «PDF, 730 KB») */
  peso: string;
}

export interface PaginaDocumenti {
  hero: { titolo: string; testo: string };
  sezione: {
    eyebrow: string;
    titolo: string;
    /** Parte finale del titolo, in corsivo azzurro (facoltativa) */
    accento: string;
    intro: string;
  };
  documenti: Documento[];
}

export const documentiPredefiniti: PaginaDocumenti = {
  hero: {
    titolo: 'Iscrizioni e documenti',
    testo: "Modulo di iscrizione, autocertificazione e scadenze per l'anno 2026/2027.",
  },
  sezione: {
    eyebrow: 'Iscrizioni 2026/2027',
    titolo: 'Moduli da',
    accento: 'scaricare',
    intro:
      "Compila il modulo e consegnalo firmato in segreteria. Dai 6 anni serve anche il certificato medico non agonistico; sotto i 6 anni basta l'autocertificazione dei genitori.",
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
