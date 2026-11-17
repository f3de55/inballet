import { actions } from 'astro:actions';
import { $, chiama, el, emetti, icona } from './comune';
import { campoTesto, inviaTesto } from './ispettore';

type Dati = { percorso: string; titolo: string; descrizione: string; alt: string; canonical: string; h1: number; robots: string; tipi: string[] };

const FILE_SEO = [
  ['src/layouts/Base.astro', 'Meta tag e Open Graph comuni'],
  ['src/lib/schema.ts', 'Dati strutturati di corsi ed eventi'],
  ['src/data/navigazione.ts', 'Menu, briciole e footer'],
  ['src/data/scuola.ts', 'Dati ufficiali della scuola'],
  ['src/lib/riepilogo.ts', 'Testo di llms.txt e del chatbot'],
  ['src/pages/robots.txt.ts', 'robots.txt'],
  ['src/lib/sitemap.ts', 'Pagine della sitemap'],
  ['src/pages/llms.txt.ts', 'llms.txt'],
] as const;

const elenco = $('svSeo');
const bottone = $<HTMLButtonElement>('svSeoControlla');
let pagine: string[] = [];

function tipi(json: unknown, out: Set<string>) {
  if (Array.isArray(json)) json.forEach((x) => tipi(x, out));
  else if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o['@type'] === 'string') out.add(o['@type']);
    Object.values(o).forEach((x) => tipi(x, out));
  }
}

async function leggi(percorso: string): Promise<Dati | null> {
  const risposta = await fetch(percorso, { credentials: 'same-origin' }).catch(() => null);
  if (!risposta?.ok) return null;
  const d = new DOMParser().parseFromString(await risposta.text(), 'text/html');
  const meta = (sel: string) => d.querySelector(sel)?.getAttribute('content') ?? '';
  const insieme = new Set<string>();
  d.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      tipi(JSON.parse(s.textContent ?? ''), insieme);
    } catch {
      insieme.add('JSON-LD non valido');
    }
  });
  return {
    percorso,
    titolo: d.title,
    descrizione: meta('meta[name="description"]'),
    alt: meta('meta[property="og:image:alt"]'),
    canonical: d.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    h1: d.querySelectorAll('h1').length,
    robots: meta('meta[name="robots"]'),
    tipi: [...insieme],
  };
}

function misura(valore: string, massimo: number): HTMLElement {
  const n = valore.length;
  const stato = !n || n > massimo ? 'errore' : n > massimo - 10 ? 'avviso' : 'ok';
  return el('small', { class: `sv-misura sv-misura--${stato}`, text: `${n}/${massimo}` });
}

function scheda(dati: Dati): HTMLElement {
  const problemi: string[] = [];
  if (!dati.titolo || dati.titolo.length > 60) problemi.push('titolo');
  if (!dati.descrizione || dati.descrizione.length > 160) problemi.push('descrizione');
  if (dati.h1 !== 1) problemi.push(`${dati.h1} h1`);
  if (!dati.alt) problemi.push('alt immagine social');
  if (!dati.canonical) problemi.push('canonical');
  const dove = { vicini: [], pagina: dati.percorso };
  const campo = (etichetta: string, valore: string) =>
    campoTesto(etichetta, valore, (prima, nuovo, esito, fatto) => void inviaTesto(prima, nuovo, dove, esito, fatto));
  const apri = el('button', { type: 'button', class: 'btn btn-link', text: 'Apri in Visuale' });
  apri.addEventListener('click', () => emetti('vai', dati.percorso));
  return el(
    'details',
    { class: 'sv-seo-pagina' },
    el(
      'summary',
      {},
      el('code', { text: dati.percorso }),
      el('span', { class: 'sv-seo-titolo', text: dati.titolo }),
      misura(dati.titolo, 60),
      misura(dati.descrizione, 160),
      el('span', {
        class: `sv-etichetta${problemi.length ? ' sv-etichetta--errore' : ''}`,
        text: problemi.length ? `Da sistemare: ${problemi.join(', ')}` : 'Tutto a posto',
      }),
    ),
    el(
      'div',
      { class: 'sv-seo-corpo' },
      campo('Titolo (≤ 60 caratteri)', dati.titolo),
      campo('Descrizione (≤ 160 caratteri)', dati.descrizione),
      dati.alt ? campo('Testo alternativo dell’immagine social', dati.alt) : null,
      el(
        'dl',
        { class: 'sv-seo-dati' },
        el('div', {}, el('dt', { text: 'Canonical' }), el('dd', { text: dati.canonical || '—' })),
        el('div', {}, el('dt', { text: 'Robots' }), el('dd', { text: dati.robots || 'indicizzabile' })),
        el('div', {}, el('dt', { text: 'Titoli h1' }), el('dd', { text: String(dati.h1) })),
        el('div', {}, el('dt', { text: 'Dati strutturati' }), el('dd', { text: dati.tipi.join(', ') || '—' })),
      ),
      apri,
    ),
  );
}

async function controlla() {
  bottone.disabled = true;
  if (!pagine.length) pagine = (await chiama(actions.sviluppatori.pagine())) ?? [];
  elenco.replaceChildren(el('p', { class: 'sv-spiega', text: `Controllo ${pagine.length} pagine…` }));
  const schede: HTMLElement[] = [];
  for (let i = 0; i < pagine.length; i += 6) {
    const lotto = await Promise.all(pagine.slice(i, i + 6).map(leggi));
    for (const d of lotto) if (d) schede.push(scheda(d));
    elenco.replaceChildren(...schede);
  }
  bottone.disabled = false;
}

export function mostraSeo() {
  const link = $('svSeoFile');
  if (!link.childElementCount) {
    link.append(
      ...FILE_SEO.map(([file, nome]) =>
        el('button', { type: 'button', class: 'sv-collegamento', 'data-apri-file': file }, icona('fa-list'), `${nome}`, el('code', { text: file })),
      ),
    );
  }
  if (!elenco.childElementCount) void controlla();
}

bottone.addEventListener('click', () => void controlla());
