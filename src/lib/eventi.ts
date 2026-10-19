/**
 * Eventi e tipi evento: lettura/scrittura su data/*.json e regole di
 * validazione (stesse regole e messaggi della dashboard PHP originale).
 */
import { randomBytes } from 'node:crypto';
import { paths, readJson, serialized, writeJson } from './storage';
import { decodeHtml, escapeHtml, mbLen, stripTags } from './text';
import { eventoTimestamp, isDateFormat, isValidTime, romeIso, romeTimestamp } from './time';

export interface Evento {
  id: string;
  titolo: string;
  data: string;
  ora: string;
  tipo: string;
  luogo: string;
  descrizione: string;
  immagine: string;
  destinatari: string;
  costo: string;
  creato: string;
  modificato: string;
  /** Creato dal generatore demo della dashboard */
  demo?: boolean;
}

export type EventoInput = Partial<Record<Exclude<keyof Evento, 'creato' | 'modificato' | 'demo'>, string>>;

/** Errore di validazione con messaggio da mostrare all'utente. */
export class ErroreEvento extends Error {}

export const leggiEventi = () => readJson<Evento[]>(paths.eventi, []);
export const leggiTipi = () => readJson<string[]>(paths.tipi, []);

/** Eventi ordinati per data crescente. */
export const eventiOrdinati = async () => (await leggiEventi()).sort((a, b) => a.data.localeCompare(b.data));

/** Prossimi eventi futuri in ordine di data (per il banner). */
export async function prossimiEventi(limite = 10, now = Date.now()): Promise<{ evento: Evento; ts: number }[]> {
  return (await leggiEventi())
    .filter((e) => e.data)
    .map((evento) => ({ evento, ts: eventoTimestamp(evento) }))
    .filter(({ ts }) => ts >= now)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, limite);
}

/** Copia dell'evento con i campi testuali decodificati (per il form di modifica). */
export const eventoPerModifica = (e: Evento): Evento => ({
  ...e,
  titolo: decodeHtml(e.titolo),
  luogo: decodeHtml(e.luogo ?? ''),
  destinatari: decodeHtml(e.destinatari ?? ''),
  costo: decodeHtml(e.costo ?? ''),
  immagine: decodeHtml(e.immagine ?? ''),
});

/** Valida e salva (crea o aggiorna) un evento. Restituisce evento e avvisi. */
export async function salvaEvento(input: EventoInput): Promise<{ evento: Evento; warnings: string[] }> {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const errors: string[] = [];
  const warnings: string[] = [];
  const eventoId = str(input.id) || null;

  // Titolo obbligatorio (min 3, max 100 caratteri)
  const titolo = str(input.titolo);
  if (!titolo) errors.push('Il titolo è obbligatorio');
  else if (mbLen(titolo) < 3) errors.push('Il titolo deve avere almeno 3 caratteri');
  else if (mbLen(titolo) > 100) errors.push('Il titolo non può superare i 100 caratteri');

  // Data obbligatoria e formato valido
  const data = str(input.data);
  const ora = str(input.ora);
  if (!data) {
    errors.push('La data è obbligatoria');
  } else if (!isDateFormat(data)) {
    errors.push('Formato data non valido (usa YYYY-MM-DD)');
  } else {
    const ts = romeTimestamp(data, ora && isValidTime(ora) ? ora : '23:59');
    if (Number.isNaN(ts)) errors.push('Data non valida');
    // Avviso solo per NUOVI eventi nel passato, non per aggiornamenti
    else if (ts < Date.now() && !eventoId) warnings.push('Attenzione: stai inserendo un evento nel passato');
  }
  if (ora && !isValidTime(ora)) errors.push('Formato ora non valido (usa HH:MM)');

  const luogo = str(input.luogo);
  if (mbLen(luogo) > 150) errors.push('Il luogo non può superare i 150 caratteri');

  // Descrizione: max 1000 caratteri di testo, esclusi i tag HTML
  const descrizione = str(input.descrizione);
  if (mbLen(stripTags(descrizione)) > 1000) errors.push('La descrizione non può superare i 1000 caratteri');

  // Immagine: path relativo o URL assoluto
  const immagine = str(input.immagine);
  if (immagine) {
    if (!/^(https?:\/\/|assets\/|images\/|\.\/|\/)/.test(immagine)) warnings.push('Il percorso immagine potrebbe non essere valido');
    if (mbLen(immagine) > 500) errors.push('URL immagine troppo lungo (max 500 caratteri)');
  }

  const destinatari = str(input.destinatari);
  if (mbLen(destinatari) > 100) errors.push('I destinatari non possono superare i 100 caratteri');

  const costo = str(input.costo);
  if (mbLen(costo) > 50) errors.push('Il costo non può superare i 50 caratteri');

  if (errors.length) throw new ErroreEvento(errors.join('. '));

  // Tipo: match case-insensitive tra i tipi esistenti
  const tipoInput = str(input.tipo).toLowerCase();
  const tipo = (tipoInput && (await leggiTipi()).find((t) => t.toLowerCase() === tipoInput)) || '';

  return serialized(async () => {
    const eventi = await leggiEventi();

    // Stesso titolo + stessa data = probabile duplicato
    if (eventi.some((e) => e.id !== eventoId && decodeHtml(e.titolo).toLowerCase() === titolo.toLowerCase() && e.data === data)) {
      warnings.push('Esiste già un evento con lo stesso titolo nella stessa data');
    }

    // Descrizione: solo tag sicuri (grassetto, corsivo, liste) e senza attributi
    const descrizioneClean = stripTags(descrizione, ['b', 'strong', 'i', 'em', 'ul', 'li']).replace(/<([a-z]+)\s+[^>]*>/gi, '<$1>');
    const pulito = (s: string) => escapeHtml(stripTags(s));
    const esistente = eventoId ? eventi.find((e) => e.id === eventoId) : undefined;
    const adesso = romeIso();

    const evento: Evento = {
      id: eventoId ?? nuovoId(),
      titolo: pulito(titolo),
      data,
      ora,
      tipo,
      luogo: pulito(luogo),
      descrizione: descrizioneClean,
      immagine: pulito(immagine),
      destinatari: pulito(destinatari),
      costo: pulito(costo),
      creato: esistente?.creato ?? adesso,
      modificato: adesso,
      // Un evento demo modificato resta demo (si rimuove con gli altri)
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
    await writeJson(paths.eventi, eventi.filter((e) => e.id !== id));
  });
}

export async function aggiungiTipo(nome: string): Promise<string[]> {
  const nuovo = nome.trim();
  if (!nuovo) throw new ErroreEvento('Nome tipo obbligatorio');
  if (mbLen(nuovo) > 30) throw new ErroreEvento('Nome tipo troppo lungo (max 30 caratteri)');
  return serialized(async () => {
    const tipi = await leggiTipi();
    if (tipi.includes(nuovo)) throw new ErroreEvento('Tipo già esistente');
    tipi.push(nuovo);
    await writeJson(paths.tipi, tipi);
    return tipi;
  });
}

/** Rimuove un tipo dalla lista e da tutti gli eventi che lo usano. */
export async function rimuoviTipo(nome: string): Promise<string[]> {
  const tipo = nome.trim();
  if (!tipo) throw new ErroreEvento('Tipo da rimuovere non specificato');
  return serialized(async () => {
    const tipi = (await leggiTipi()).filter((t) => t !== tipo);
    await writeJson(paths.tipi, tipi);
    const eventi = await leggiEventi();
    if (eventi.some((e) => e.tipo === tipo)) {
      await writeJson(paths.eventi, eventi.map((e) => (e.tipo === tipo ? { ...e, tipo: '' } : e)));
    }
    return tipi;
  });
}

const nuovoId = () => 'evt_' + randomBytes(6).toString('hex');
