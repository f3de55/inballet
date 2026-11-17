import { randomUUID } from 'node:crypto';
import { GOOGLE_REVISIONE_CHIAVE, GOOGLE_REVISIONE_URL } from 'astro:env/server';
import { emailConfigurata, inviaEmail } from './email';
import { idCartella, idFoglio, indirizziEmail, leggiImpostazioni } from './impostazioni';
import { MAX_FILE_REVISIONE } from './revisione-comune';
import { paths, readJson, serialized, writeJson } from './storage';
import { escapeHtml } from './text';
import { romeIso } from './time';

export class ErroreRevisione extends Error {}

export const PEZZO = 8 * 1024 * 1024;
const DURATA_CARICAMENTO = 24 * 60 * 60 * 1000;
const ATTESA_GOOGLE = 90_000;
const VERSIONE_SCRIPT = 2;
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

export interface Proposta {
  id: string;
  data: string;
  pagina: string;
  indirizzo: string;
  sezioneTesto: string;
  testo: string;
  sezioneFile: string;
  file: FileDrive[];
  foglio: string;
  email: string;
}

const MAX_PROPOSTE = 2000;

const caricamenti = new Map<string, Caricamento>();

export const leggiProposte = () => readJson<Proposta[]>(paths.revisioni, []);

function salvaProposta(proposta: Proposta) {
  return serialized(async () => {
    const tutte = (await leggiProposte()).filter((p) => p.id !== proposta.id);
    await writeJson(paths.revisioni, [...tutte, proposta].slice(-MAX_PROPOSTE));
  });
}

const motivo = (e: unknown) => (e instanceof Error ? e.message : String(e));

function messaggio(p: Proposta, a: string[]) {
  const righe: [string, string][] = [['Pagina', `${p.pagina} (${p.indirizzo})`]];
  if (p.testo) righe.push(['Sezione del testo', p.sezioneTesto], ['Testo', p.testo]);
  if (p.file.length) righe.push(['Sezione di immagini e video', p.sezioneFile], ['Immagini e video', p.file.map((f) => `${f.nome}: ${f.url}`).join('\n')]);
  return {
    a,
    oggetto: `Revisione · ${p.pagina}`,
    testo: righe.map(([k, v]) => `${k}:\n${v}`).join('\n\n'),
    html: righe.map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, '<br>')}</p>`).join(''),
  };
}

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
  let json: T & { errore?: string; versione?: number };
  try {
    json = JSON.parse(testo);
  } catch {
    throw new ErroreRevisione('Lo script Google non risponde come previsto: deve essere pubblicato come app web, eseguito come te e accessibile a «Chiunque»');
  }
  if (json.versione !== VERSIONE_SCRIPT) {
    throw new ErroreRevisione(
      'Lo script Google è una versione vecchia: su script.google.com incolla di nuovo google/revisione.gs, salva e pubblica una nuova versione (Gestisci deployment › modifica › Nuova versione)',
    );
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
  const proposta: Proposta = {
    id: randomUUID(),
    data: romeIso(),
    pagina: input.pagina,
    indirizzo: input.indirizzo,
    sezioneTesto: testo ? input.sezioneTesto.trim() : '',
    testo,
    sezioneFile: file.length ? input.sezioneFile.trim() : '',
    file: file as FileDrive[],
    foglio: 'in corso',
    email: '',
  };
  await salvaProposta(proposta);
  const destinatari = indirizziEmail(imp.email);
  const [riga, posta] = await Promise.allSettled([
    google({
      azione: 'riga',
      foglio: idFoglio(imp.foglio),
      colonne: COLONNE,
      valori: [
        {},
        { collegamenti: [{ nome: proposta.pagina, url: proposta.indirizzo }] },
        { testo: proposta.sezioneTesto },
        { testo },
        { testo: proposta.sezioneFile },
        { collegamenti: proposta.file },
        {},
      ],
    }),
    !destinatari.length
      ? Promise.reject(new Error('nessun destinatario nelle impostazioni'))
      : emailConfigurata()
        ? inviaEmail(messaggio(proposta, destinatari))
        : Promise.reject(new Error('SMTP_URL non configurato')),
  ]);
  proposta.foglio = riga.status === 'fulfilled' ? 'inserita' : `non inserita: ${motivo(riga.reason)}`;
  proposta.email = posta.status === 'fulfilled' ? `inviata a ${destinatari.join(', ')}` : `non inviata: ${motivo(posta.reason)}`;
  await salvaProposta(proposta);
  for (const id of input.caricamenti) caricamenti.delete(id);
}
