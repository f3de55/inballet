import { randomBytes } from 'node:crypto';
import { z } from 'astro/zod';
import { paths, readJson, serialized, writeJson } from './storage';
import { decodeHtml, slug, stripTags } from './text';
import { isDateFormat, isValidTime, romeIso, romeTimestamp } from './time';
import { scuola, sedi } from '../data/scuola';

const STATI = ['pubblicato', 'bozza', 'annullato', 'esaurito'] as const;
export type Stato = (typeof STATI)[number];

export interface Evento {
  id: string;
  slug: string;
  alias?: string[];
  titolo: string;
  data: string;
  ora: string;
  dataFine: string;
  oraFine: string;
  stato: Stato;
  tipo: string;
  luogo: string;
  descrizione: string;
  immagine: string;
  destinatari: string;
  costo: string;
  prenotazione: string;
  creato: string;
  modificato: string;
  demo?: boolean;
}

export class ErroreEvento extends Error {}

const dataValida = (s: string) => isDateFormat(s) && !Number.isNaN(romeTimestamp(s, '12:00'));
const ora2 = (s: string) => (s ? s.padStart(5, '0') : s);

const testo = (max: number, messaggio: string) => z.string().trim().max(max, messaggio).default('');
const ora = (messaggio: string) =>
  z
    .string()
    .trim()
    .default('')
    .refine((s) => !s || isValidTime(s), messaggio)
    .transform(ora2);

export const inputEvento = z
  .object({
    id: z
      .string()
      .regex(/^evt_[a-f0-9]{12}$/, 'ID evento non valido')
      .optional(),
    titolo: z
      .string()
      .trim()
      .min(1, 'Il titolo è obbligatorio')
      .min(3, 'Il titolo deve avere almeno 3 caratteri')
      .max(100, 'Il titolo non può superare i 100 caratteri'),
    data: z.string().trim().min(1, 'La data è obbligatoria').refine(dataValida, 'Data non valida'),
    ora: ora('Ora non valida (usa HH:MM)'),
    dataFine: z
      .string()
      .trim()
      .default('')
      .refine((s) => !s || dataValida(s), 'Data di fine non valida'),
    oraFine: ora('Ora di fine non valida (usa HH:MM)'),
    stato: z.enum(STATI).default('pubblicato'),
    tipo: testo(30, 'Tipo troppo lungo'),
    luogo: testo(150, 'Il luogo non può superare i 150 caratteri'),
    descrizione: z
      .string()
      .max(20000, 'Descrizione troppo lunga')
      .default('')
      .refine((s) => stripTags(s).trim().length <= 1000, 'La descrizione non può superare i 1000 caratteri'),
    immagine: testo(500, 'Percorso immagine troppo lungo'),
    destinatari: testo(100, 'I destinatari non possono superare i 100 caratteri'),
    costo: testo(50, 'Il costo non può superare i 50 caratteri'),
    prenotazione: z
      .string()
      .trim()
      .max(500, 'Link troppo lungo')
      .default('')
      .transform((s) => (s && !/^https?:\/\//i.test(s) ? `https://${s}` : s))
      .refine((s) => !s || (URL.canParse(s) && /^https?:$/.test(new URL(s).protocol)), 'Link di prenotazione non valido'),
  })
  .superRefine((e, ctx) => {
    const errore = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (e.oraFine && !e.ora) errore('ora', "Indica anche l'ora di inizio");
    if (e.dataFine && e.dataFine < e.data) errore('dataFine', 'La fine è prima dell’inizio');
    else if (e.ora && e.oraFine && (!e.dataFine || e.dataFine === e.data) && e.oraFine <= e.ora) errore('oraFine', 'L’ora di fine è prima dell’inizio');
  });

type InputEvento = z.output<typeof inputEvento>;

export const fineEvento = (e: Pick<Evento, 'data' | 'dataFine' | 'oraFine'>) => romeTimestamp(e.dataFine || e.data, e.oraFine || '23:59');

export const passato = (e: Evento, now = Date.now()) => fineEvento(e) < now;

const pubblico = (e: Evento) => e.stato !== 'bozza';

export const urlEvento = (e: Pick<Evento, 'slug'>) => `/spettacoli-eventi?evento=${encodeURIComponent(e.slug)}`;

export const urlIcs = (e: Pick<Evento, 'slug'>) => `/spettacoli-eventi/${e.slug}/calendario.ics`;

export const srcImmagine = (immagine: string) => (/^https?:\/\//i.test(immagine) ? immagine : '/' + immagine.replace(/^\.?\/+/, ''));

export const perInizio = (a: Evento, b: Evento) => (a.data + ora2(a.ora)).localeCompare(b.data + ora2(b.ora));

export function baseSlug(titolo: string, data: string): string {
  return `${slug(titolo, 60) || 'evento'}-${data}`;
}

export function slugUnico(base: string, usati: Set<string>): string {
  let slug = base;
  for (let n = 2; usati.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

const usaSlug = (slug: string, base: string) => slug === base || new RegExp(`^${base}-\\d+$`).test(slug);

const str = (v: unknown) => (typeof v === 'string' ? v : '');

function normalizza(raw: Record<string, unknown>): Evento {
  const stato = STATI.includes(raw.stato as Stato) ? (raw.stato as Stato) : 'pubblicato';
  const alias = Array.isArray(raw.alias) ? raw.alias.filter((a): a is string => typeof a === 'string') : [];
  return {
    id: str(raw.id),
    slug: str(raw.slug),
    ...(alias.length && { alias }),
    titolo: str(raw.titolo),
    data: str(raw.data),
    ora: ora2(str(raw.ora)),
    dataFine: str(raw.dataFine),
    oraFine: ora2(str(raw.oraFine)),
    stato,
    tipo: str(raw.tipo),
    luogo: str(raw.luogo),
    descrizione: pulisciDescrizione(str(raw.descrizione)),
    immagine: str(raw.immagine),
    destinatari: str(raw.destinatari),
    costo: str(raw.costo),
    prenotazione: str(raw.prenotazione),
    creato: str(raw.creato),
    modificato: str(raw.modificato),
    ...(raw.demo === true && { demo: true }),
  };
}

export async function leggiEventi(): Promise<Evento[]> {
  const raw = await readJson<unknown[]>(paths.eventi, []);
  const eventi = (Array.isArray(raw) ? raw : [])
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map(normalizza)
    .filter((e) => e.id && e.data);
  const usati = new Set<string>();
  for (const e of eventi) {
    if (e.slug && !usati.has(e.slug)) usati.add(e.slug);
    else e.slug = '';
  }
  for (const e of eventi) if (!e.slug) usati.add((e.slug = slugUnico(baseSlug(e.titolo, e.data), usati)));
  return eventi;
}

export const leggiTipi = () => readJson<string[]>(paths.tipi, []);

export const eventiPubblici = async () => (await leggiEventi()).filter(pubblico).sort(perInizio);

export async function prossimiEventi(limite = 10, now = Date.now()): Promise<Evento[]> {
  return (await eventiPubblici()).filter((e) => !passato(e, now)).slice(0, limite);
}

export async function trovaEvento(chiave: string): Promise<{ evento: Evento; vecchio: boolean } | null> {
  const eventi = await leggiEventi();
  const evento = eventi.find((e) => e.slug === chiave);
  if (evento) return { evento, vecchio: false };
  const altro = eventi.find((e) => e.alias?.includes(chiave) || e.id === chiave);
  return altro ? { evento: altro, vecchio: true } : null;
}

const TAG_DESCRIZIONE = ['b', 'strong', 'i', 'em', 'ul', 'li', 'br'];

function pulisciDescrizione(html: string): string {
  return stripTags(html.replace(/<\/(div|p)>\s*/gi, '<br>'), TAG_DESCRIZIONE)
    .replace(/<(\/?)([a-z]+)\b[^>]*>/gi, (_, chiusura: string, tag: string) => `<${chiusura}${tag.toLowerCase()}>`)
    .replace(/<br>\s*(<\/?(ul|li)>)/gi, '$1')
    .replace(/(<br>\s*)+$/i, '')
    .trim();
}

export async function salvaEvento(input: InputEvento): Promise<{ evento: Evento; warnings: string[] }> {
  const warnings: string[] = [];
  const eventoId = input.id ?? null;

  if (!eventoId && fineEvento(input) < Date.now()) warnings.push('Attenzione: stai inserendo un evento nel passato');
  if (input.immagine && !/^(https?:\/\/|assets\/|images\/|\.\/|\/)/.test(input.immagine)) warnings.push('Il percorso immagine potrebbe non essere valido');

  return serialized(async () => {
    const [eventi, tipi] = await Promise.all([leggiEventi(), leggiTipi()]);
    const esistente = eventoId ? eventi.find((e) => e.id === eventoId) : undefined;
    if (eventoId && !esistente) throw new ErroreEvento('Evento non trovato: forse è stato eliminato');

    if (eventi.some((e) => e.id !== eventoId && e.titolo.toLowerCase() === input.titolo.toLowerCase() && e.data === input.data)) {
      warnings.push('Esiste già un evento con lo stesso titolo nella stessa data');
    }

    const tipoInput = input.tipo.toLowerCase();
    const tipo = tipoInput ? (tipi.find((t) => t.toLowerCase() === tipoInput) ?? (esistente?.tipo.toLowerCase() === tipoInput ? esistente.tipo : '')) : '';

    const base = baseSlug(input.titolo, input.data);
    const usati = new Set(eventi.filter((e) => e.id !== eventoId).flatMap((e) => [e.slug, ...(e.alias ?? [])]));
    let slug = esistente?.slug ?? '';
    let alias = esistente?.alias ?? [];
    if (!slug || !usaSlug(slug, base)) {
      const nuovo = slugUnico(base, usati);
      if (slug) alias = [...alias.filter((a) => a !== nuovo), slug];
      slug = nuovo;
    }

    const adesso = romeIso();
    const evento: Evento = {
      id: eventoId ?? nuovoId(),
      slug,
      ...(alias.length && { alias }),
      titolo: input.titolo,
      data: input.data,
      ora: input.ora,
      dataFine: input.dataFine === input.data ? '' : input.dataFine,
      oraFine: input.oraFine,
      stato: input.stato,
      tipo,
      luogo: input.luogo,
      descrizione: pulisciDescrizione(input.descrizione),
      immagine: input.immagine,
      destinatari: input.destinatari,
      costo: input.costo,
      prenotazione: input.prenotazione,
      creato: esistente?.creato || adesso,
      modificato: adesso,
      ...(esistente?.demo && { demo: true }),
    };

    const idx = eventi.findIndex((e) => e.id === evento.id);
    if (idx >= 0) eventi[idx] = evento;
    else eventi.push(evento);
    await writeJson(paths.eventi, eventi);

    return { evento, warnings };
  });
}

export async function eliminaEvento(id: string): Promise<void> {
  if (!id) throw new ErroreEvento('ID evento mancante');
  if (!/^evt_[a-f0-9]{12}$/.test(id)) throw new ErroreEvento('ID evento non valido');
  await serialized(async () => {
    const eventi = await leggiEventi();
    if (!eventi.some((e) => e.id === id)) throw new ErroreEvento('Evento non trovato');
    await writeJson(
      paths.eventi,
      eventi.filter((e) => e.id !== id),
    );
  });
}

export async function togliImmagine(nome: string): Promise<number> {
  return serialized(async () => {
    const eventi = await leggiEventi();
    const usano = (e: Evento) => !!e.immagine && e.immagine.split('/').pop() === nome;
    const n = eventi.filter(usano).length;
    if (n)
      await writeJson(
        paths.eventi,
        eventi.map((e) => (usano(e) ? { ...e, immagine: '' } : e)),
      );
    return n;
  });
}

export async function aggiungiTipo(nome: string): Promise<string[]> {
  const nuovo = nome.trim();
  if (!nuovo) throw new ErroreEvento('Nome tipo obbligatorio');
  if ([...nuovo].length > 30) throw new ErroreEvento('Nome tipo troppo lungo (max 30 caratteri)');
  return serialized(async () => {
    const tipi = await leggiTipi();
    if (tipi.some((t) => t.toLowerCase() === nuovo.toLowerCase())) throw new ErroreEvento('Tipo già esistente');
    tipi.push(nuovo);
    await writeJson(paths.tipi, tipi);
    return tipi;
  });
}

export async function rimuoviTipo(nome: string): Promise<string[]> {
  const tipo = nome.trim();
  if (!tipo) throw new ErroreEvento('Tipo da rimuovere non specificato');
  return serialized(async () => {
    const tipi = (await leggiTipi()).filter((t) => t !== tipo);
    await writeJson(paths.tipi, tipi);
    return tipi;
  });
}

const nuovoId = () => 'evt_' + randomBytes(6).toString('hex');

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
export const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function parti(data: string) {
  const [y, m, d] = data.split('-').map(Number);
  return { y, m, d, giorno: GIORNI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], mese: MESI[m - 1] };
}

export function quando(e: Pick<Evento, 'data' | 'ora' | 'dataFine' | 'oraFine'>): string {
  const a = parti(e.data);
  const ore = e.ora ? `, ore ${e.ora}${e.oraFine ? `–${e.oraFine}` : ''}` : '';
  if (!e.dataFine || e.dataFine === e.data) return `${a.giorno} ${a.d} ${a.mese} ${a.y}${ore}`;
  const b = parti(e.dataFine);
  const inizio = a.y !== b.y ? `${a.giorno} ${a.d} ${a.mese} ${a.y}` : a.m !== b.m ? `${a.giorno} ${a.d} ${a.mese}` : `${a.giorno} ${a.d}`;
  return `da ${inizio} a ${b.giorno} ${b.d} ${b.mese} ${b.y}${ore}`;
}

export const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GIORNI_BREVI = GIORNI.map((g) => maiuscola(g.slice(0, 3)));

export const giornoBreve = (data: string) => GIORNI_BREVI[new Date(`${data}T12:00:00Z`).getUTCDay()];

export function perMese(lista: Evento[]) {
  const gruppi = new Map<string, Evento[]>();
  for (const e of lista) gruppi.set(e.data.slice(0, 7), [...(gruppi.get(e.data.slice(0, 7)) ?? []), e]);
  return [...gruppi].map(([chiave, eventi]) => {
    const [y, m] = chiave.split('-').map(Number);
    return { titolo: `${maiuscola(MESI[m - 1])} ${y}`, eventi };
  });
}

export const ETICHETTE_STATO: Record<Stato, string> = {
  pubblicato: 'Pubblicato',
  bozza: 'Bozza',
  annullato: 'Annullato',
  esaurito: 'Posti esauriti',
};

export function testoDescrizione(html: string): string {
  return decodeHtml(stripTags(html.replace(/<br\s*\/?>|<\/li>|<\/p>/gi, '\n').replace(/<li>/gi, '- ')))
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

export function sedeDi(luogo: string) {
  const norma = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return sedi.find((s) => norma(luogo).includes(norma(s.via)));
}

function prezzo(costo: string): number | null {
  if (/gratu|gratis|libero|free/i.test(costo)) return 0;
  const n = /(\d+(?:[.,]\d{1,2})?)/.exec(costo);
  return n ? Number(n[1].replace(',', '.')) : null;
}

export function datiStrutturati(e: Evento, site: URL) {
  const url = new URL(urlEvento(e), site).href;
  const iso = (data: string, ora: string) => romeIso(romeTimestamp(data, ora));
  const sede = sedeDi(e.luogo);
  const costo = prezzo(e.costo);
  const descrizione = testoDescrizione(e.descrizione);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.titolo,
    url,
    startDate: e.ora ? iso(e.data, e.ora) : e.data,
    ...((e.dataFine || e.oraFine) && { endDate: e.oraFine && e.ora ? iso(e.dataFine || e.data, e.oraFine) : e.dataFine || e.data }),
    eventStatus: `https://schema.org/${e.stato === 'annullato' ? 'EventCancelled' : 'EventScheduled'}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(e.luogo && {
      location: {
        '@type': 'Place',
        name: e.luogo,
        address: sede
          ? {
              '@type': 'PostalAddress',
              streetAddress: sede.via,
              addressLocality: sede.citta,
              postalCode: sede.cap,
              addressRegion: sede.provincia,
              addressCountry: 'IT',
            }
          : e.luogo,
      },
    }),
    ...(e.immagine && { image: [new URL(srcImmagine(e.immagine), site).href] }),
    ...(descrizione && { description: descrizione.slice(0, 500) }),
    organizer: { '@type': 'Organization', name: scuola.nome, url: site.href },
    ...(costo === 0 && { isAccessibleForFree: true }),
    ...((costo !== null || e.prenotazione) && {
      offers: {
        '@type': 'Offer',
        url: e.prenotazione || url,
        ...(costo !== null && { price: costo, priceCurrency: 'EUR' }),
        availability: `https://schema.org/${e.stato === 'esaurito' ? 'SoldOut' : 'InStock'}`,
      },
    }),
  };
}

function intervallo(e: Evento) {
  const utc = (ms: number) =>
    new Date(ms)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const giorno = (data: string, piu = 0) => {
    const [y, m, d] = data.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + piu)).toISOString().slice(0, 10).replace(/-/g, '');
  };
  if (!e.ora) return { start: giorno(e.data), end: giorno(e.dataFine || e.data, 1), allDay: true };
  const inizio = romeTimestamp(e.data, e.ora);
  const fine = e.oraFine ? romeTimestamp(e.dataFine || e.data, e.oraFine) : e.dataFine ? romeTimestamp(e.dataFine, '23:59') : inizio + 3_600_000;
  return { start: utc(inizio), end: utc(fine), allDay: false };
}

export function linkGoogleCalendar(e: Evento, site: URL): string {
  const { start, end } = intervallo(e);
  const dettagli = [testoDescrizione(e.descrizione), new URL(urlEvento(e), site).href].filter(Boolean).join('\n\n');
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.titolo, dates: `${start}/${end}`, details: dettagli, location: e.luogo, ctz: 'Europe/Rome' });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function fileIcs(e: Evento, site: URL): string {
  const { start, end, allDay } = intervallo(e);
  const campo = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const piega = (riga: string) => {
    const righe = [''];
    for (const c of riga) {
      if (Buffer.byteLength(righe.at(-1)! + c) > (righe.length > 1 ? 74 : 75)) righe.push('');
      righe[righe.length - 1] += c;
    }
    return righe.join('\r\n ');
  };
  const tipo = allDay ? ';VALUE=DATE' : '';
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InBallet//Eventi//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@inballet.it`,
    `DTSTAMP:${stamp}`,
    `DTSTART${tipo}:${start}`,
    `DTEND${tipo}:${end}`,
    `SUMMARY:${campo(e.titolo)}`,
    `DESCRIPTION:${campo(testoDescrizione(e.descrizione))}`,
    `LOCATION:${campo(e.luogo)}`,
    `URL:${new URL(urlEvento(e), site).href}`,
    ...(e.stato === 'annullato' ? ['STATUS:CANCELLED'] : []),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]
    .map(piega)
    .join('\r\n');
}
