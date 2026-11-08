export interface Insegnante {
  id: string;
  nome: string;
  ruolo: string;
  bio: string;
  competenze: string[];
  foto: string;
  demo?: boolean;
}

export interface SezioneInsegnanti {
  sezione: {
    eyebrow: string;
    titolo: string;
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
