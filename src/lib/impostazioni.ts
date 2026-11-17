import type { AstroCookies } from 'astro';
import { COOKIE_REVISIONE } from './revisione-comune';
import { paths, readJson, serialized, writeJson } from './storage';

export interface Impostazioni {
  revisione: boolean;
  foglio: string;
  cartella: string;
  email: string;
}

export class ErroreImpostazioni extends Error {}

const PREDEFINITE: Impostazioni = { revisione: false, foglio: '', cartella: '', email: '' };

export const indirizziEmail = (testo: string) =>
  testo
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const idFoglio = (url: string) => /docs\.google\.com\/spreadsheets\/(?:u\/\d+\/)?d\/([\w-]{20,})/.exec(url)?.[1] ?? '';
export const idCartella = (url: string) => /drive\.google\.com\/.*(?:\/folders\/|[?&]id=)([\w-]{10,})/.exec(url)?.[1] ?? '';

export async function leggiImpostazioni(): Promise<Impostazioni> {
  const salvate = await readJson<Partial<Impostazioni>>(paths.impostazioni, {});
  return { ...PREDEFINITE, ...salvate };
}

export function salvaImpostazioni(input: Impostazioni): Promise<Impostazioni> {
  const foglio = input.foglio.trim();
  const cartella = input.cartella.trim();
  if (foglio && !idFoglio(foglio)) throw new ErroreImpostazioni('Indirizzo di Google Fogli non valido: copialo dalla barra del browser con il foglio aperto');
  if (cartella && !idCartella(cartella)) throw new ErroreImpostazioni('Indirizzo della cartella di Google Drive non valido: copialo con la cartella aperta');
  if (input.revisione && !foglio) throw new ErroreImpostazioni('Per la modalità revisione serve l’indirizzo di Google Fogli');
  const email = indirizziEmail(input.email);
  const errata = email.find((e) => !EMAIL.test(e));
  if (errata) throw new ErroreImpostazioni(`Indirizzo email non valido: ${errata}`);
  const nuove = { revisione: input.revisione, foglio, cartella, email: email.join(', ') };
  return serialized(async () => {
    await writeJson(paths.impostazioni, nuove);
    return nuove;
  });
}

export function segnaRevisione(cookies: AstroCookies, url: URL, attiva: boolean): void {
  if (attiva) cookies.set(COOKIE_REVISIONE, '1', { path: '/', sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 60 * 60 * 24 });
  else if (cookies.has(COOKIE_REVISIONE)) cookies.delete(COOKIE_REVISIONE, { path: '/' });
}
