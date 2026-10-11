/**
 * Date/ore nel fuso Europe/Rome indipendentemente dal fuso del server
 * (equivalente a date_default_timezone_set('Europe/Rome') in PHP).
 */
const TZ = 'Europe/Rome';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function romeParts(ms: number) {
  const p = Object.fromEntries(partsFormatter.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return {
    y: +p.year,
    m: +p.month,
    d: +p.day,
    h: +p.hour,
    i: +p.minute,
    s: +p.second,
  };
}

function offsetMs(utcMs: number): number {
  const p = romeParts(utcMs);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.i, p.s) - (utcMs - (utcMs % 1000));
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

export const isValidTime = (ora: string) => TIME_RE.test(ora);
export const isDateFormat = (data: string) => DATE_RE.test(data);

/**
 * Timestamp (ms) di una data `YYYY-MM-DD` e ora `HH:MM` nel fuso di Roma.
 * Restituisce NaN se la data non è valida.
 */
export function romeTimestamp(data: string, ora = '23:59'): number {
  const dm = DATE_RE.exec(data);
  const tm = TIME_RE.exec(ora || '23:59');
  if (!dm || !tm) return NaN;
  const [y, m, d] = [+dm[1], +dm[2], +dm[3]];
  const guess = Date.UTC(y, m - 1, d, +tm[1], +tm[2]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return NaN;
  let ts = guess - offsetMs(guess);
  const second = guess - offsetMs(ts);
  if (second !== ts) ts = second;
  return ts;
}

/** Timestamp di fine evento usato ovunque: data + ora (o 23:59 se assente). */
export const eventoTimestamp = (e: { data?: string; ora?: string }) =>
  romeTimestamp(e.data ?? '', e.ora ? e.ora : '23:59');

/** `YYYY-MM-DD` di oggi (o di `ms`) nel fuso di Roma. */
export function romeDate(ms = Date.now()): string {
  const p = romeParts(ms);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

/** Ora (0-23) nel fuso di Roma. */
export const romeHour = (ms = Date.now()) => romeParts(ms).h;

/** ISO 8601 con offset di Roma, come date('c') in PHP. */
export function romeIso(ms = Date.now()): string {
  const p = romeParts(ms);
  const off = Math.round(offsetMs(ms) / 60000);
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.i)}:${pad(p.s)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}
