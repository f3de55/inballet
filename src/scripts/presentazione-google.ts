import { QUERY_GOOGLE } from '../data/presentazione';

const IMMAGINI = /var s='(data:image\/[^']+)';var ii=\[([^\]]+)\]/g;
const SNIPPET = '.VwiC3b, [data-sncf], [style*="line-clamp"]';
const SOPRA = 150;

interface Nuovo {
  titolo: string;
  link: string;
  sito: string;
  indirizzo: string;
  testo: string;
}

async function nuovoSito(): Promise<Nuovo> {
  const doc = new DOMParser().parseFromString(await fetch('/').then((r) => r.text()), 'text/html');
  const link = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? location.origin;
  return {
    titolo: doc.title,
    link,
    sito: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? '',
    indirizzo: link.replace(/\/$/, ''),
    testo: doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  };
}

function immagini(doc: Document) {
  for (const script of Array.from(doc.scripts)) {
    for (const [, dati, ids] of script.textContent?.matchAll(IMMAGINI) ?? []) {
      const src = dati.replace(/\\x3d/g, '=');
      for (const id of ids.match(/[\w-]+/g) ?? []) doc.getElementById(id)?.setAttribute('src', src);
    }
  }
  doc.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => (img.src = img.dataset.src ?? ''));
}

function destinazione(href: string) {
  try {
    const u = new URL(href, 'https://www.google.com');
    return u.pathname === '/url' ? new URL(u.searchParams.get('q') ?? u.searchParams.get('url') ?? '').hostname : u.hostname;
  } catch {
    return '';
  }
}

function blocco(doc: Document, link: Element) {
  const elenco = doc.getElementById('rso');
  let el: Element | null = link;
  while (el && el.parentElement && el.parentElement !== elenco) el = el.parentElement;
  return el?.parentElement === elenco ? (el as HTMLElement) : (link.closest<HTMLElement>('[data-hveid]') ?? null);
}

function grassetto(doc: Document, el: Element, testo: string) {
  const parole = QUERY_GOOGLE.split(' ').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  el.replaceChildren();
  testo.split(new RegExp(`(${parole.join('|')})`, 'gi')).forEach((pezzo, i) => {
    if (i % 2 === 0) return el.append(pezzo);
    const em = doc.createElement('em');
    em.textContent = pezzo;
    el.append(em);
  });
}

function copia(doc: Document, oggi: HTMLElement, n: Nuovo) {
  const nuovo = oggi.cloneNode(true) as HTMLElement;
  nuovo.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', n.link));
  const titolo = nuovo.querySelector('h3');
  if (titolo) titolo.textContent = n.titolo;
  const nome = nuovo.querySelector('.VuuXrf');
  if (nome) nome.textContent = n.sito;
  const cite = nuovo.querySelector('cite');
  if (cite) cite.textContent = n.indirizzo;
  const icona = nuovo.querySelector('img');
  if (icona) icona.setAttribute('src', `${location.origin}/favicon.ico`);
  const snippet = nuovo.querySelector(SNIPPET);
  if (snippet) grassetto(doc, snippet, n.testo);
  return nuovo;
}

function stile(doc: Document) {
  const token = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const css = doc.createElement('style');
  css.textContent = `[data-pres-esito]{position:relative;margin:2.25rem -1rem 1.5rem!important;padding:1.25rem 1rem .5rem!important;border-radius:16px;box-shadow:0 0 0 3px var(--pres-colore)}
[data-pres-esito]::before{content:attr(data-pres-esito);position:absolute;top:0;left:1rem;transform:translateY(-50%);padding:.3rem .9rem;border-radius:999px;font:600 14px/1.3 Arial,sans-serif;color:var(--pres-testo);background:var(--pres-colore)}
[data-pres-oggi]{--pres-colore:${token('--esito-errore')};--pres-testo:${token('--white')}}
[data-pres-nuovo]{--pres-colore:${token('--primary-blue')};--pres-testo:${token('--dark-navy')}}`;
  doc.head.append(css);
}

export async function segnaGoogle(doc: Document) {
  immagini(doc);
  stile(doc);
  const n = await nuovoSito();
  const link = Array.from(doc.querySelectorAll('#rso a[href]')).find((a) => /(^|\.)inballet\.it$/.test(destinazione(a.getAttribute('href') ?? '')));
  const oggi = link ? blocco(doc, link) : null;
  const modello = oggi ?? doc.querySelector<HTMLElement>('#rso > div');
  if (!modello) return;
  const nuovo = copia(doc, modello, n);
  nuovo.dataset.presNuovo = '';
  nuovo.dataset.presEsito = '✓ Così apparirà il nuovo sito';
  if (!oggi) return modello.before(nuovo);
  oggi.dataset.presOggi = '';
  oggi.dataset.presEsito = '✗ Così è oggi';
  oggi.after(nuovo);
  doc.defaultView?.scrollTo({ top: oggi.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0) - SOPRA, behavior: 'instant' });
}
