import { randomUUID } from 'node:crypto';
import { GOOGLE_REVISIONE_CHIAVE, GOOGLE_REVISIONE_URL } from 'astro:env/server';
import { idCartella, idFoglio, leggiImpostazioni } from './impostazioni';
import { MAX_FILE_REVISIONE } from './revisione-comune';

export class ErroreRevisione extends Error {}

export const PEZZO = 8 * 1024 * 1024;
const DURATA_CARICAMENTO = 24 * 60 * 60 * 1000;
const ATTESA_GOOGLE = 90_000;
const SESSIONE_DRIVE = /^https:\/\/www\.googleapis\.com\//;

const COLONNE = [
  { nome: 'Data', tipo: 'data', larghezza: 130 },
  { nome: 'Pagina', tipo: 'testo', larghezza: 200 },
  { nome: 'Sezione del testo', tipo: 'testo', larghezza: 240 },
  { nome: 'Testo', tipo: 'testo', larghezza: 480 },
  { nome: 'Sezione di immagini e video', tipo: 'testo', larghezza: 240 },
  { nome: 'Immagini e video', tipo: 'testo', larghezza: 280 },
  { nome: 'Inserito', tipo: 'casella', larghezza: 90 },
];

interface FileDrive {
  nome: string;
  url: string;
}

interface Caricamento {
  sessione: string;
  peso: number;
  ricevuti: number;
  scade: number;
  file?: FileDrive;
}

const caricamenti = new Map<string, Caricamento>();

export const revisioneCollegata = () => Boolean(GOOGLE_REVISIONE_URL && GOOGLE_REVISIONE_CHIAVE);

async function google<T>(dati: Record<string, unknown>): Promise<T> {
  if (!GOOGLE_REVISIONE_URL || !GOOGLE_REVISIONE_CHIAVE) {
    throw new ErroreRevisione('Collegamento a Google non configurato: mancano GOOGLE_REVISIONE_URL e GOOGLE_REVISIONE_CHIAVE');
  }
  let testo: string;
  try {
    const risposta = await fetch(GOOGLE_REVISIONE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dati, chiave: GOOGLE_REVISIONE_CHIAVE }),
      signal: AbortSignal.timeout(ATTESA_GOOGLE),
    });
    testo = await risposta.text();
  } catch {
    throw new ErroreRevisione('Google non risponde: riprova tra poco');
  }
  let json: T & { errore?: string };
  try {
    json = JSON.parse(testo);
  } catch {
    throw new ErroreRevisione('Lo script Google non risponde come previsto: deve essere pubblicato come app web, eseguito come te e accessibile a «Chiunque»');
  }
  if (json.errore) throw new ErroreRevisione(json.errore);
  return json;
}

async function impostazioniAttive() {
  const imp = await leggiImpostazioni();
  if (!imp.revisione) throw new ErroreRevisione('La modalità revisione è spenta: riattivala da Impostazioni nella dashboard');
  return imp;
}

export function preparaTabella(foglio: string, cartella: string) {
  return google<{ foglio: string; cartella?: string }>({ azione: 'prepara', foglio: idFoglio(foglio), cartella: idCartella(cartella), colonne: COLONNE });
}

function pulisci() {
  const ora = Date.now();
  for (const [id, c] of caricamenti) if (c.scade < ora) caricamenti.delete(id);
}

export async function iniziaCaricamento(input: { pagina: string; nome: string; tipo: string; peso: number }) {
  const imp = await impostazioniAttive();
  if (!idCartella(imp.cartella)) throw new ErroreRevisione('Manca la cartella di Google Drive: aggiungila da Impostazioni nella dashboard');
  if (!/^(image|video)\//.test(input.tipo)) throw new ErroreRevisione(`«${input.nome}» non è un’immagine né un video`);
  if (input.peso < 1 || input.peso > MAX_FILE_REVISIONE) throw new ErroreRevisione(`«${input.nome}» è vuoto o supera 50 MB`);
  const { sessione } = await google<{ sessione: string }>({
    azione: 'sessione',
    cartella: idCartella(imp.cartella),
    pagina: input.pagina,
    nome: input.nome,
    tipo: input.tipo,
    peso: input.peso,
  });
  if (!SESSIONE_DRIVE.test(sessione ?? '')) throw new ErroreRevisione('Google Drive non ha aperto il caricamento');
  pulisci();
  const id = randomUUID();
  caricamenti.set(id, { sessione, peso: input.peso, ricevuti: 0, scade: Date.now() + DURATA_CARICAMENTO });
  return { id, pezzo: PEZZO };
}

export async function caricaPezzo(id: string, inizio: number, pezzo: File) {
  const c = caricamenti.get(id);
  if (!c) throw new ErroreRevisione('Caricamento scaduto: riprova');
  if (c.file) return { fatto: true };
  const fine = inizio + pezzo.size;
  const ultimo = fine === c.peso;
  if (inizio !== c.ricevuti || fine > c.peso || (!ultimo && pezzo.size !== PEZZO)) throw new ErroreRevisione('Pezzo del file fuori ordine: riprova');
  let risposta: Response;
  try {
    risposta = await fetch(c.sessione, {
      method: 'PUT',
      headers: { 'Content-Range': `bytes ${inizio}-${fine - 1}/${c.peso}` },
      body: pezzo,
      redirect: 'manual',
      signal: AbortSignal.timeout(ATTESA_GOOGLE),
    });
  } catch {
    throw new ErroreRevisione('Google Drive non risponde: riprova');
  }
  if (risposta.status === 308) {
    c.ricevuti = fine;
    return { fatto: false };
  }
  if (!risposta.ok) throw new ErroreRevisione(`Google Drive ha rifiutato il file (${risposta.status})`);
  const file = (await risposta.json()) as { id: string; name: string };
  c.ricevuti = fine;
  c.file = { nome: file.name, url: `https://drive.google.com/file/d/${file.id}/view` };
  return { fatto: true };
}

export async function inviaRevisione(input: {
  pagina: string;
  indirizzo: string;
  testo: string;
  sezioneTesto: string;
  sezioneFile: string;
  caricamenti: string[];
}) {
  const imp = await impostazioniAttive();
  const file = input.caricamenti.map((id) => caricamenti.get(id)?.file);
  if (file.some((f) => !f)) throw new ErroreRevisione('Un file non è arrivato su Google Drive: riprova');
  const testo = input.testo.trim();
  if (!testo && !file.length) throw new ErroreRevisione('Scrivi un testo o aggiungi un’immagine o un video');
  if (testo && !input.sezioneTesto.trim()) throw new ErroreRevisione('Scegli in che sezione va inserito il testo');
  if (file.length && !input.sezioneFile.trim()) throw new ErroreRevisione('Scegli dove vanno inseriti immagini e video');
  await google({
    azione: 'riga',
    foglio: idFoglio(imp.foglio),
    colonne: COLONNE,
    valori: [
      {},
      { collegamenti: [{ nome: input.pagina, url: input.indirizzo }] },
      { testo: testo ? input.sezioneTesto.trim() : '' },
      { testo },
      { testo: file.length ? input.sezioneFile.trim() : '' },
      { collegamenti: file },
      {},
    ],
  });
  for (const id of input.caricamenti) caricamenti.delete(id);
}
