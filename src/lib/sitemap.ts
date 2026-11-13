import { getCollection } from 'astro:content';

const ESCLUSE = /^(\[.*\]|404|login|dashboard|presentazione)$/;
const HOST_DI_PROVA = /(^|\.)up\.railway\.app$|^localhost$|^127\.0\.0\.1$/;

const pagine = Object.keys(import.meta.glob('../pages/*.astro'))
  .map((file) => file.slice('../pages/'.length, -'.astro'.length))
  .filter((nome) => !ESCLUSE.test(nome))
  .map((nome) => (nome === 'index' ? '' : nome));

export async function indirizziSitemap(site: URL, url: URL): Promise<string[]> {
  const base = HOST_DI_PROVA.test(url.hostname) ? url.origin : site.origin;
  const corsi = (await getCollection('corsi')).map((corso) => corso.id);
  return [...pagine, ...corsi].sort().map((percorso) => `${base}/${percorso}`);
}
