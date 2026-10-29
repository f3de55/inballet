/**
 * Sezione «Insegnanti» della pagina Chi siamo: contenuti predefiniti. Valgono finché
 * non vengono modificati dalla dashboard (che li salva in DATA_DIR/insegnanti.json,
 * vedi src/lib/insegnanti.ts). Nessun insegnante predefinito: solo persone reali,
 * inserite dalla scuola. Senza insegnanti la sezione non compare.
 */

export interface Insegnante {
  id: string;
  nome: string;
  /** Disciplina o ruolo (es. «Danza Classica e Modern») */
  ruolo: string;
  /** Breve presentazione; «**parola**» diventa grassetto */
  bio: string;
  /** Percorso pubblico della foto, '' se non caricata */
  foto: string;
}

export interface SezioneInsegnanti {
  sezione: {
    eyebrow: string;
    titolo: string;
    /** Parte finale del titolo, in corsivo azzurro (facoltativa) */
    accento: string;
    intro: string;
  };
  insegnanti: Insegnante[];
}

export const insegnantiPredefiniti: SezioneInsegnanti = {
  sezione: {
    eyebrow: 'Il nostro team',
    titolo: 'I nostri',
    accento: 'insegnanti',
    intro: 'Insegnanti **qualificati**, uniti dalla passione per la danza.',
  },
  insegnanti: [],
};
