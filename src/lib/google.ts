import { PUBLIC_GOOGLE_PLACE_ID } from 'astro:env/client';
import { GOOGLE_PLACES_API_KEY } from 'astro:env/server';
import { paths, readJson, writeJson } from './storage';

export const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const GIORNI_SCHEMA = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface Recensione {
  autore: string;
  voto: number;
  testo: string;
  data: string;
}

export interface Fascia {
  apre: string;
  chiude: string;
}

export interface DatiGoogle {
  aggiornato: string;
  voto: number;
  totale: number;
  recensioni: Recensione[];
  orari: Fascia[][];
}

const DURATA = 30 * 86400_000;
const RIPROVA = 3600_000;
const RIPROVA_MAX = 86400_000;
const MAX_RECENSIONI = 5;
const CAMPI = 'rating,userRatingCount,reviews,regularOpeningHours';

interface Momento {
  day: number;
  hour?: number;
  minute?: number;
}

interface RispostaPlaces {
  rating?: number;
  userRatingCount?: number;
  reviews?: {
    rating?: number;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string };
  }[];
  regularOpeningHours?: { periods?: { open?: Momento; close?: Momento }[] };
}

const orario = (m: Momento) => `${String(m.hour ?? 0).padStart(2, '0')}:${String(m.minute ?? 0).padStart(2, '0')}`;

function converti(r: RispostaPlaces): DatiGoogle {
  const orari: Fascia[][] = GIORNI.map(() => []);
  for (const { open, close } of r.regularOpeningHours?.periods ?? []) {
    if (!open) continue;
    orari[(open.day + 6) % 7].push({ apre: orario(open), chiude: close && close.day === open.day ? orario(close) : '24:00' });
  }
  for (const fasce of orari) fasce.sort((a, b) => a.apre.localeCompare(b.apre));
  const recensioni = (r.reviews ?? [])
    .map((x) => ({
      autore: x.authorAttribution?.displayName?.trim() || 'Anonimo',
      voto: Math.round(x.rating ?? 0),
      testo: (x.text?.text ?? x.originalText?.text ?? '').trim(),
      data: x.publishTime ?? '',
    }))
    .filter((x) => x.testo)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, MAX_RECENSIONI);
  return { aggiornato: new Date().toISOString(), voto: r.rating ?? 0, totale: r.userRatingCount ?? 0, recensioni, orari };
}

async function scarica(): Promise<DatiGoogle> {
  if (!GOOGLE_PLACES_API_KEY) throw new Error('GOOGLE_PLACES_API_KEY non impostata');
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(PUBLIC_GOOGLE_PLACE_ID)}?languageCode=it`, {
    headers: { 'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': CAMPI },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).replace(/\s+/g, ' ').slice(0, 200)}`);
  const dati = converti(await res.json());
  if (!dati.orari.some((f) => f.length) && !dati.recensioni.length) throw new Error('risposta senza orari né recensioni');
  return dati;
}

function validi(d: unknown): d is DatiGoogle {
  const x = d as Partial<DatiGoogle> | null;
  return (
    !!x &&
    Number.isFinite(Date.parse(x.aggiornato ?? '')) &&
    Array.isArray(x.recensioni) &&
    Array.isArray(x.orari) &&
    x.orari.length === GIORNI.length &&
    x.orari.every(Array.isArray)
  );
}

let dati: DatiGoogle | null = null;
let lettura: Promise<void> | null = null;
let aggiornamento: Promise<void> | null = null;
let fallimenti = 0;
let prossimoTentativo = 0;

function aggiorna(): Promise<void> {
  aggiornamento ??= scarica()
    .then((nuovi) => {
      dati = nuovi;
      fallimenti = 0;
      return writeJson(paths.google, nuovi);
    })
    .catch((e) => {
      prossimoTentativo = Date.now() + Math.min(RIPROVA * 2 ** fallimenti++, RIPROVA_MAX);
      console.error('Google Places:', (e as Error).message);
    })
    .finally(() => (aggiornamento = null));
  return aggiornamento;
}

function leggi(): Promise<void> {
  lettura ??= readJson<unknown>(paths.google, null).then(
    (salvati) => {
      if (validi(salvati)) dati = salvati;
    },
    (e) => console.error('Google Places, lettura dei dati salvati:', (e as Error).message),
  );
  return lettura;
}

export async function datiGoogle(): Promise<DatiGoogle | null> {
  await leggi();
  const scaduti = !dati || Math.abs(Date.now() - Date.parse(dati.aggiornato)) > (completi(dati) ? DURATA : RIPROVA_MAX);
  if (scaduti && Date.now() >= prossimoTentativo) void aggiorna();
  if (!dati && aggiornamento) await aggiornamento;
  return dati;
}

export const testoOrari = (orari: Fascia[][]) =>
  GIORNI.map((g, i) => `- ${g}: ${orari[i].length ? orari[i].map((f) => `${f.apre}-${f.chiude}`).join(', ') : 'chiuso'}`).join('\n');

export const schemaOrari = (orari: Fascia[][]) =>
  orari.flatMap((fasce, i) => fasce.map((f) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: GIORNI_SCHEMA[i], opens: f.apre, closes: f.chiude })));
