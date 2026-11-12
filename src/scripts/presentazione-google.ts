import { QUERY_GOOGLE } from '../data/presentazione';
import type { PanoramicaAI } from '../lib/risultati-google';

const IMMAGINI = /var s='(data:image\/[^']+)';var ii=\[([^\]]+)\]/g;
const SNIPPET = '.VwiC3b, [data-sncf], [style*="line-clamp"]';
const TITOLI_AI = /^(Panoramica AI|AI Overview|Panoramica creata con l'AI)$/i;
const DATI_PER_AI = [
  'Corsi, età e sedi come dati strutturati (schema.org) su ogni pagina',
  'Orari della segreteria e contatti ufficiali, sempre aggiornati',
  'Una scheda riassuntiva della scuola pensata per gli assistenti AI (/llms.txt)',
];

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

function elemento(doc: Document, tag: string, testo?: string) {
  const el = doc.createElement(tag);
  if (testo) el.textContent = testo;
  return el;
}

function panoramica(doc: Document, ai: PanoramicaAI) {
  const box = elemento(doc, 'div');
  box.dataset.presAi = '';
  box.append(elemento(doc, 'p', '✦ Panoramica AI'));
  for (const b of ai.text_blocks ?? []) {
    if (b.type === 'list') {
      const ul = elemento(doc, 'ul');
      for (const v of b.list ?? []) ul.append(elemento(doc, 'li', [v.title, v.snippet].filter(Boolean).join(': ')));
      box.append(ul);
    } else if (b.snippet) box.append(elemento(doc, b.type === 'heading' ? 'h3' : 'p', b.snippet));
  }
  const fonti = (ai.references ?? []).filter((f) => f.source || f.title);
  if (fonti.length) {
    const riga = elemento(doc, 'p');
    riga.dataset.presFonti = '';
    for (const f of fonti) {
      const fonte = elemento(doc, 'span', f.source || f.title);
      if (/(^|\.)inballet\.it$/.test(destinazione(f.link ?? ''))) fonte.dataset.presNostra = '';
      riga.append(fonte);
    }
    box.append(riga);
  }
  return box;
}

function intelligenza(doc: Document, ai: PanoramicaAI | null) {
  const inizio = doc.getElementById('rso');
  if (!inizio) return;
  const titolo = Array.from(doc.querySelectorAll('h1, h2, div, span, strong')).find((el) => TITOLI_AI.test(el.textContent?.trim() ?? ''));
  let oggi: HTMLElement;
  if (titolo) {
    let el = titolo as HTMLElement;
    while (el.parentElement && !el.parentElement.contains(inizio)) el = el.parentElement;
    oggi = el;
  } else {
    oggi = ai ? panoramica(doc, ai) : elemento(doc, 'p', `Oggi Google non mostra una panoramica AI per «${QUERY_GOOGLE}».`);
    oggi.dataset.presAi = '';
    inizio.before(oggi);
  }
  const citata = (ai?.references ?? []).some((f) => /(^|\.)inballet\.it$/.test(destinazione(f.link ?? '')));
  oggi.dataset.presOggi = '';
  oggi.dataset.presEsito = ai && !citata ? '✗ AI di Google oggi: inballet.it non è tra le fonti' : '✗ AI di Google oggi';
  const nuovo = elemento(doc, 'div');
  nuovo.dataset.presAi = '';
  nuovo.dataset.presNuovo = '';
  nuovo.dataset.presEsito = '✓ Cosa il nuovo sito dà all’AI di Google';
  const ul = elemento(doc, 'ul');
  for (const voce of DATI_PER_AI) ul.append(elemento(doc, 'li', voce));
  nuovo.append(ul);
  oggi.after(nuovo);
  const sinistra = `${inizio.getBoundingClientRect().left - (inizio.parentElement?.getBoundingClientRect().left ?? 0)}px`;
  for (const box of [oggi, nuovo]) if (!titolo || box === nuovo) box.style.setProperty('--pres-sinistra', sinistra);
}

function stile(doc: Document) {
  const token = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const css = doc.createElement('style');
  css.textContent = `[data-pres-esito]{position:relative;margin:2.25rem -1rem 1.5rem!important;padding:1.25rem 1rem .5rem!important;border-radius:16px;box-shadow:0 0 0 3px var(--pres-colore)}
[data-pres-esito]::before{content:attr(data-pres-esito);position:absolute;top:0;left:1rem;transform:translateY(-50%);padding:.3rem .9rem;border-radius:999px;font:600 14px/1.3 Arial,sans-serif;color:var(--pres-testo);background:var(--pres-colore)}
[data-pres-oggi]{--pres-colore:${token('--esito-errore')};--pres-testo:${token('--white')}}
[data-pres-nuovo]{--pres-colore:${token('--primary-blue')};--pres-testo:${token('--dark-navy')}}
[data-pres-ai][data-pres-esito]{margin-left:calc(var(--pres-sinistra,0px) - 1rem)!important}
[data-pres-ai]{max-width:652px;font:14px/1.6 Arial,sans-serif;color:${token('--dark-navy')}}
[data-pres-ai]>p:first-child{margin:0 0 .5rem;font-size:16px;font-weight:600}
[data-pres-ai] p,[data-pres-ai] ul{margin:0 0 .6rem}
[data-pres-ai] h3{margin:.4rem 0;font-size:16px;font-weight:600}
[data-pres-fonti]{display:flex;flex-wrap:wrap;gap:.4rem}
[data-pres-fonti] span{padding:.2rem .7rem;border-radius:999px;background:${token('--grigio-100')}}
[data-pres-fonti] [data-pres-nostra]{background:${token('--primary-blue')}}`;
  doc.head.append(css);
}

export async function segnaGoogle(doc: Document) {
  immagini(doc);
  stile(doc);
  intelligenza(doc, JSON.parse(doc.getElementById('pres-panoramica-ai')?.textContent || 'null') as PanoramicaAI | null);
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
}
