import { actions } from 'astro:actions';
import { QUERY_GOOGLE } from '../data/presentazione';
import type { Luogo, Organico, PaginaGoogle } from '../lib/risultati-google';

const PAROLE = QUERY_GOOGLE.split(' ');
const SOTTO_NAVIGAZIONE = 140;
const SOPRA_ROSSO = 40;

function crea<K extends keyof HTMLElementTagNameMap>(tag: K, classe: string, testo?: string) {
  const el = document.createElement(tag);
  el.className = classe;
  if (testo) el.textContent = testo;
  return el;
}

function icona(nome: string) {
  const i = crea('i', `fas ${nome}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function grassetto(el: HTMLElement, testo: string, parole: string[]) {
  const voci = parole.filter(Boolean).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!voci.length) return el.append(testo);
  testo.split(new RegExp(`(${voci.join('|')})`, 'gi')).forEach((pezzo, i) => el.append(i % 2 ? crea('strong', '', pezzo) : pezzo));
}

function stelle(voto: number, recensioni?: number, dopo?: string) {
  const riga = crea('p', 'pres-g-voto');
  riga.append(crea('span', 'pres-g-numero', voto.toLocaleString('it-IT', { minimumFractionDigits: 1 })));
  const piene = crea('span', 'pres-g-stelle', '★★★★★');
  piene.style.setProperty('--voto', String(voto / 5));
  piene.setAttribute('aria-label', `${voto} su 5`);
  riga.append(piene);
  if (recensioni) riga.append(` (${recensioni.toLocaleString('it-IT')})`);
  if (dopo) riga.append(` · ${dopo}`);
  return riga;
}

async function nuovoSito(): Promise<Organico> {
  const doc = new DOMParser().parseFromString(await fetch('/').then((r) => r.text()), 'text/html');
  const canonico = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? location.origin;
  return {
    title: doc.title,
    link: canonico,
    source: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ?? '',
    displayed_link: canonico.replace(/\/$/, ''),
    favicon: '/favicon.ico',
    snippet: doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    snippet_highlighted_words: PAROLE,
  };
}

function organico(r: Organico) {
  const li = crea('li', 'pres-g-risultato');
  const sito = crea('p', 'pres-g-sito');
  const tondo = crea('span', 'pres-g-favicon');
  if (r.favicon) {
    const img = crea('img', '');
    img.src = r.favicon;
    img.alt = '';
    img.width = img.height = 18;
    tondo.append(img);
  } else tondo.append(icona('fa-globe'));
  const nomi = crea('span', 'pres-g-nomi');
  nomi.append(crea('span', 'pres-g-nome', r.source ?? ''), crea('cite', '', r.displayed_link ?? r.link ?? ''));
  sito.append(tondo, nomi, icona('fa-ellipsis-vertical'));
  li.append(sito, crea('h3', 'pres-g-titolo', r.title ?? ''));
  const ext = r.rich_snippet?.top?.detected_extensions;
  if (ext?.rating) li.append(stelle(ext.rating, ext.reviews));
  const testo = crea('p', 'pres-g-testo');
  if (r.date) testo.append(crea('span', 'pres-g-data', `${r.date} — `));
  grassetto(testo, r.snippet ?? '', r.snippet_highlighted_words ?? []);
  li.append(testo);
  const collegamenti = r.sitelinks?.inline ?? r.sitelinks?.expanded ?? [];
  if (collegamenti.length) {
    const riga = crea('p', 'pres-g-collegamenti');
    collegamenti.slice(0, 4).forEach((c) => riga.append(crea('span', '', c.title ?? '')));
    li.append(riga);
  }
  return li;
}

function riquadro(li: HTMLElement, esito: 'oggi' | 'nuovo', testo: string) {
  li.classList.add(`pres-g-risultato--${esito}`);
  const segno = crea('small', `pres-g-esito pres-g-esito--${esito}`);
  segno.append(icona(esito === 'oggi' ? 'fa-times' : 'fa-check'), testo);
  li.prepend(segno);
  return li;
}

function luoghi(pagina: PaginaGoogle) {
  const elenco = Array.isArray(pagina.local_results) ? pagina.local_results : (pagina.local_results?.places ?? []);
  if (!elenco.length) return null;
  const li = crea('li', 'pres-g-blocco');
  li.append(crea('h3', 'pres-g-blocco-titolo', 'Luoghi'));
  if (pagina.local_map?.image) {
    const mappa = crea('img', 'pres-g-mappa');
    mappa.src = pagina.local_map.image;
    mappa.alt = 'Mappa dei luoghi';
    li.append(mappa);
  }
  elenco.slice(0, 3).forEach((l: Luogo) => {
    const voce = crea('div', 'pres-g-luogo');
    voce.append(crea('p', 'pres-g-luogo-nome', l.title ?? ''));
    if (l.rating) voce.append(stelle(l.rating, l.reviews, l.type));
    else if (l.type) voce.append(crea('p', '', l.type));
    if (l.address) voce.append(crea('p', '', l.address));
    if (l.hours) voce.append(crea('p', 'pres-g-orario', l.hours));
    li.append(voce);
  });
  return li;
}

function domande(pagina: PaginaGoogle) {
  const elenco = (pagina.related_questions ?? []).filter((d) => d.question);
  if (!elenco.length) return null;
  const li = crea('li', 'pres-g-blocco');
  li.append(crea('h3', 'pres-g-blocco-titolo', 'Le persone hanno chiesto anche'));
  elenco.slice(0, 4).forEach((d) => {
    const riga = crea('p', 'pres-g-domanda', d.question);
    riga.append(icona('fa-chevron-down'));
    li.append(riga);
  });
  return li;
}

function correlate(pagina: PaginaGoogle) {
  const elenco = (pagina.related_searches ?? []).filter((r) => r.query);
  if (!elenco.length) return null;
  const li = crea('li', 'pres-g-blocco');
  li.append(crea('h3', 'pres-g-blocco-titolo', 'Ricerche correlate'));
  const griglia = crea('div', 'pres-g-correlate');
  elenco.slice(0, 8).forEach((r) => {
    const voce = crea('p', '');
    voce.append(icona('fa-magnifying-glass'), r.query ?? '');
    griglia.append(voce);
  });
  li.append(griglia);
  return li;
}

function scheda(pagina: PaginaGoogle) {
  const k = pagina.knowledge_graph;
  if (!k?.title) return null;
  const box = crea('div', 'pres-g-scheda');
  const foto = k.header_images?.[0]?.image;
  if (foto) {
    const img = crea('img', 'pres-g-scheda-foto');
    img.src = foto;
    img.alt = '';
    box.append(img);
  }
  box.append(crea('h3', 'pres-g-scheda-titolo', k.title));
  if (k.rating) box.append(stelle(k.rating, k.review_count, k.type));
  else if (k.type) box.append(crea('p', 'pres-g-tipo', k.type));
  if (k.description) box.append(crea('p', '', k.description));
  const riga = (etichetta: string, valore?: string) => {
    if (!valore) return;
    const p = crea('p', 'pres-g-riga');
    p.append(crea('strong', '', `${etichetta}: `), valore);
    box.append(p);
  };
  riga('Indirizzo', k.address);
  riga('Telefono', k.phone);
  return box;
}

export async function mostraGoogle(radice: HTMLElement) {
  const pagina = radice.querySelector<HTMLElement>('[data-pagina-google]');
  const lista = radice.querySelector<HTMLElement>('[data-risultati-google]');
  const laterale = radice.querySelector<HTMLElement>('[data-laterale-google]');
  const stato = radice.querySelector<HTMLElement>('[data-stato-google]');
  if (!pagina || !lista || !laterale || !stato) return;
  const [nuovo, { data, error }] = await Promise.all([nuovoSito(), actions.presentazione.google()]);
  const dati = data?.pagina ?? {};
  const organici = (dati.organic_results ?? []).filter((r) => r.title && r.link);
  const oggi = organici.findIndex((r) => new URL(r.link ?? '').hostname.endsWith('inballet.it'));
  const voci: HTMLElement[] = organici.map(organico);
  const blu = riquadro(organico(nuovo), 'nuovo', 'Così apparirà il nuovo sito');
  if (oggi >= 0) {
    riquadro(voci[oggi], 'oggi', `Così è oggi: ${organici[oggi].position ?? oggi + 1}° risultato su Google`);
    voci.splice(oggi + 1, 0, blu);
  } else {
    const assente = riquadro(
      crea('li', 'pres-g-risultato'),
      'oggi',
      data ? 'Oggi inballet.it non compare nella prima pagina di Google' : 'Pagina di Google non disponibile',
    );
    voci.unshift(assente, blu);
  }
  const dopoBlu = voci.indexOf(blu) + 1;
  const altre = domande(dati);
  if (altre) voci.splice(Math.min(voci.length, Math.max(3, dopoBlu)), 0, altre);
  const mappa = luoghi(dati);
  if (mappa) voci.splice(dopoBlu <= 2 ? dopoBlu : 0, 0, mappa);
  const fine = correlate(dati);
  if (fine) voci.push(fine);
  lista.replaceChildren(...voci);
  laterale.replaceChildren(...[scheda(dati)].filter((x): x is HTMLDivElement => !!x));
  const quando = data && new Date(data.aggiornato).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  stato.textContent = quando
    ? `Pagina vera di Google per «${QUERY_GOOGLE}», cercata da Lainate il ${quando}`
    : error
      ? 'Pagina di Google non raggiungibile in questo momento'
      : 'Pagina di Google non disponibile: manca la chiave SERPAPI_KEY';
  const rosso = lista.querySelector<HTMLElement>('.pres-g-risultato--oggi');
  const fondo = blu.offsetTop + blu.offsetHeight - (pagina.clientHeight - SOTTO_NAVIGAZIONE);
  if (rosso && fondo > 0) pagina.scrollTo({ top: Math.min(rosso.offsetTop - SOPRA_ROSSO, fondo), behavior: 'instant' });
}
