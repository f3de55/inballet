import { SINONIMI } from '../../data/chatbot';

export interface Passaggio {
  percorso: string;
  titolo: string;
  sezione: string;
  testo: string;
}

interface Voce extends Passaggio {
  termini: Map<string, number>;
  lunghezza: number;
}

export interface Indice {
  voci: Voce[];
  df: Map<string, number>;
  media: number;
}

export interface Trovato extends Passaggio {
  punti: number;
  comuni: number;
}

export interface Parte {
  testo: string;
  peso: number;
}

const VUOTE = new Set(
  `a ad agli ai al alla alle allo anche ancora avete abbiamo c che chi ci ciao come con cosa cui da dagli dai dal dalla dalle dei del della delle dello di dove e ed era essere fa fare fate gia gli grazie ha hai hanno ho i il in info informazioni io la le li lo loro ma me mi mio mia mie miei molto ne nei nel nella nelle negli no noi non o per perche piu po posso potete puo qual quale quali quando quanta quante quanti quanto quella quelle quello questa queste questi questo salve se sei si sia sono su sua sue sui sul sulla suo suoi te ti tra tu tua tuo un una uno vi voi vorrei voglio sapere buongiorno buonasera the and of to is are do you`.split(' '),
);

export const normalizza = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const radice = (p: string) => {
  if (p.length < 5) return p;
  if (p.length > 6 && /(?:are|ere|ire|ano|ono|ando|endo)$/.test(p)) return p.replace(/(?:ando|endo|are|ere|ire|ano|ono)$/, '');
  return p.replace(/(?:h[eio]|[aeiou])$/, '');
};

const parole = (testo: string) =>
  normalizza(testo)
    .split(' ')
    .filter((p) => (p.length > 1 || /\d/.test(p)) && !VUOTE.has(p));

export const termini = (testo: string) => parole(testo).map(radice);

const ETA_MAX = 99;
const eta = (n: number) => `eta${n}`;

function terminiEta(testo: string): string[] {
  const t = normalizza(testo);
  const anni = new Set<number>();
  for (const [, da, a] of t.matchAll(/\b(\d{1,2}) (?:a |ai |agli )?(\d{1,2}) anni\b/g)) for (let n = +da; n <= +a && n <= ETA_MAX; n++) anni.add(n);
  for (const [, da] of t.matchAll(/\b(?:dai|dagli|da) (\d{1,2}) anni\b(?! ?\d)/g)) for (let n = +da; n <= ETA_MAX; n++) anni.add(n);
  return [...anni].map(eta);
}

const etaRichiesta = (testo: string) => [...normalizza(testo).matchAll(/\b(\d{1,2}) ann[io]\b/g)].map(([, n]) => eta(+n));

const ESPANSIONI = new Map(Object.entries(SINONIMI).map(([parola, altre]) => [radice(normalizza(parola)), termini(altre)]));

export function creaIndice(passaggi: Passaggio[]): Indice {
  const df = new Map<string, number>();
  const voci = passaggi.map((p) => {
    const intestazione = termini(`${p.titolo} ${p.sezione} ${p.percorso.replace(/[/-]/g, ' ')}`);
    const tutti = [...termini(p.testo), ...intestazione, ...intestazione];
    const conta = new Map<string, number>();
    for (const t of tutti) conta.set(t, (conta.get(t) ?? 0) + 1);
    for (const t of conta.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return { ...p, termini: conta, lunghezza: tutti.length };
  });
  return { voci, df, media: voci.reduce((s, v) => s + v.lunghezza, 0) / (voci.length || 1) };
}

function pesiRichiesta(parti: Parte[]): { pesi: Map<string, number>; principali: Set<string> } {
  const pesi = new Map<string, number>();
  const aggiungi = (t: string, w: number) => pesi.set(t, Math.max(pesi.get(t) ?? 0, w));
  const principali = new Set(termini(parti[0]?.testo ?? ''));
  for (const { testo, peso } of parti) {
    for (const t of termini(testo)) {
      aggiungi(t, peso);
      for (const e of ESPANSIONI.get(t) ?? []) aggiungi(e, peso * 0.6);
    }
  }
  return { pesi, principali };
}

const K1 = 1.2;
const B = 0.75;

export function cerca(indice: Indice, parti: Parte[], opzioni: { massimo?: number; caratteri?: number; perPagina?: number; pagine?: Set<string> } = {}): Trovato[] {
  const { massimo = 6, caratteri = 5500, perPagina = 3, pagine = new Set() } = opzioni;
  const { pesi, principali } = pesiRichiesta(parti);
  if (!pesi.size) return [];
  const n = indice.voci.length;
  const punteggi = indice.voci
    .map((v) => {
      let punti = 0;
      let comuni = 0;
      for (const [t, w] of pesi) {
        const tf = v.termini.get(t);
        if (!tf) continue;
        const df = indice.df.get(t) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        punti += w * idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * v.lunghezza) / indice.media)));
        if (principali.has(t)) comuni++;
      }
      return { ...v, punti: pagine.has(v.percorso) ? punti * 1.25 : punti, comuni };
    })
    .filter((v) => v.punti > 0)
    .sort((a, b) => b.punti - a.punti);
  const soglia = (punteggi[0]?.punti ?? 0) * 0.35;
  const scelti: Trovato[] = [];
  const perOgniPagina = new Map<string, number>();
  let usati = 0;
  for (const v of punteggi) {
    if (v.punti < soglia || scelti.length >= massimo) break;
    if ((perOgniPagina.get(v.percorso) ?? 0) >= perPagina || usati + v.testo.length > caratteri) continue;
    perOgniPagina.set(v.percorso, (perOgniPagina.get(v.percorso) ?? 0) + 1);
    usati += v.testo.length;
    scelti.push({ percorso: v.percorso, titolo: v.titolo, sezione: v.sezione, testo: v.testo, punti: v.punti, comuni: v.comuni });
  }
  return scelti;
}

const MAX_PASSAGGIO = 1200;
const MIN_PASSAGGIO = 200;

export function dividi(pagina: { percorso: string; titolo: string; testo: string }): Passaggio[] {
  const sezioni: { sezione: string; righe: string[] }[] = [];
  for (const riga of pagina.testo.split('\n')) {
    if (riga.startsWith('## ')) sezioni.push({ sezione: riga.slice(3), righe: [] });
    else if (sezioni.length) sezioni[sezioni.length - 1].righe.push(riga);
    else sezioni.push({ sezione: pagina.titolo, righe: [riga] });
  }
  const passaggi: Passaggio[] = [];
  for (const { sezione, righe } of sezioni) {
    let corrente: string[] = [];
    const chiudi = () => {
      const testo = corrente.join('\n');
      corrente = [];
      if (!testo.replace(/^#+ .*$/gm, '').trim()) return;
      const prima = passaggi.at(-1);
      if (prima && prima.testo.length < MIN_PASSAGGIO && prima.testo.length + testo.length < MAX_PASSAGGIO) {
        prima.testo += `\n## ${sezione}\n${testo}`;
        return;
      }
      passaggi.push({ percorso: pagina.percorso, titolo: pagina.titolo, sezione, testo });
    };
    for (const riga of righe) {
      if (corrente.length && corrente.join('\n').length + riga.length > MAX_PASSAGGIO) chiudi();
      corrente.push(riga);
    }
    chiudi();
  }
  return passaggi;
}
