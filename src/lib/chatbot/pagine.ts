/**
 * Testi del sito per il chatbot, letti dalle pagine vere: il server visita il
 * proprio sito come un motore di ricerca (parte dalla homepage e segue i link
 * interni) e da ogni pagina prende il testo del <main>, senza menu e footer.
 * Così il chatbot conosce TUTTO ciò che è pubblicato, anche le pagine nuove,
 * senza elenchi da tenere aggiornati a mano.
 */
import { decodeHtml } from '../text';

export interface Pagina {
  percorso: string;
  titolo: string;
  testo: string;
}

/**
 * Pagine da non leggere: area riservata, file e pagine dei singoli eventi
 * (gli eventi arrivano già aggiornati dalla parte variabile del prompt).
 */
const ESCLUSE = /^\/(?:dashboard|login|_actions|_image|_server-islands|assets)(?:\/|$)|^\/spettacoli-eventi\/|\.[a-z0-9]{2,4}$/i;
const MAX_PAGINE = 150;
const PARALLELE = 6;

/** Entità HTML più comuni (Astro scrive quasi tutto in UTF-8). */
function decodifica(s: string): string {
  return decodeHtml(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

/** Testo leggibile del <main>: titoli, paragrafi ed elenchi, niente codice né moduli. */
function testoPrincipale(html: string): string {
  const inizio = html.search(/<main[\s>]/i);
  const fine = html.lastIndexOf('</main>');
  if (inizio < 0 || fine < inizio) return '';
  return decodifica(
    html
      .slice(inizio, fine)
      .replace(/<(script|style|noscript|svg|template|form|nav|button|select)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<h([1-2])\b[^>]*>/gi, '\n## ')
      .replace(/<h([3-6])\b[^>]*>/gi, '\n### ')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<(br|hr)\b[^>]*>/gi, '\n')
      .replace(/<\/dt>/gi, ': ') // "Età: dai 6 anni" su una riga
      .replace(/<\/(p|div|section|article|header|footer|h[1-6]|li|ul|ol|dt|dd|blockquote|figcaption|tr|table|summary|details)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .split('\n')
    .map((r) => r.replace(/\s+/g, ' ').trim())
    .filter((r) => r.replace(/^[#-]+\s*/, '').length > 1)
    .join('\n');
}

const titoloDi = (html: string, percorso: string) =>
  decodifica(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, ' ') ?? /<title>([^<|]*)/i.exec(html)?.[1] ?? percorso)
    .replace(/\s+/g, ' ')
    .trim();

/** Link interni della pagina, normalizzati (senza ancore, query e slash finale). */
function linkInterni(html: string): string[] {
  const trovati = new Set<string>();
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const percorso = href.replace(/^https?:\/\/(?:www\.)?inballet\.it/i, '').split(/[?#]/)[0].replace(/(.)\/+$/, '$1');
    if (percorso.startsWith('/') && !percorso.startsWith('//') && !ESCLUSE.test(percorso)) trovati.add(percorso);
  }
  return [...trovati];
}

/**
 * Righe che compaiono in tante pagine (inviti a contattare la segreteria,
 * didascalie ricorrenti…) sono contorno: si tolgono, restano una volta sola nel
 * riepilogo ufficiale.
 */
function togliRipetute(pagine: Pagina[]): Pagina[] {
  if (pagine.length < 6) return pagine;
  const conta = new Map<string, number>();
  for (const p of pagine) for (const r of new Set(p.testo.split('\n'))) conta.set(r, (conta.get(r) ?? 0) + 1);
  const soglia = Math.max(4, Math.ceil(pagine.length * 0.25));
  return pagine.map((p) => ({ ...p, testo: p.testo.split('\n').filter((r) => (conta.get(r) ?? 0) < soglia || r.startsWith('#')).join('\n') }));
}

/** Visita il sito partendo dalla homepage. `origine`: indirizzo del server stesso. */
export async function leggiSito(origine: string): Promise<Pagina[]> {
  const visti = new Set<string>(['/']);
  const coda = ['/'];
  const pagine: Pagina[] = [];
  while (coda.length) {
    const lotto = coda.splice(0, PARALLELE);
    await Promise.all(
      lotto.map(async (percorso) => {
        try {
          const res = await fetch(new URL(percorso, origine), { signal: AbortSignal.timeout(10_000), headers: { 'User-Agent': 'InBallet-Etoile' } });
          if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) return;
          const html = await res.text();
          const testo = testoPrincipale(html);
          if (testo) pagine.push({ percorso, titolo: titoloDi(html, percorso), testo });
          for (const link of linkInterni(html)) {
            if (!visti.has(link) && visti.size < MAX_PAGINE) {
              visti.add(link);
              coda.push(link);
            }
          }
        } catch {
          // Pagina irraggiungibile: si prosegue con le altre
        }
      }),
    );
  }
  // Ordine stabile (homepage, poi alfabetico): il testo resta identico tra una lettura e l'altra e la cache del fornitore regge
  pagine.sort((a, b) => (a.percorso === '/' ? -1 : b.percorso === '/' ? 1 : a.percorso.localeCompare(b.percorso)));
  return togliRipetute(pagine);
}

export const testoPagine = (pagine: Pagina[]) => pagine.map((p) => `=== Pagina "${p.titolo}" (${p.percorso}) ===\n${p.testo}`).join('\n\n');
