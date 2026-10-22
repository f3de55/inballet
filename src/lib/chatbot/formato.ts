/**
 * Testo del modello → HTML sicuro per il fumetto della chat. Prima si fa
 * l'escape di tutto, poi si ricostruiscono solo grassetto, elenchi, a capo e
 * link: telefoni, e-mail, pagine del sito e pochi siti esterni noti. Un link
 * verso qualsiasi altro sito resta testo (niente phishing via prompt injection).
 */
import { escapeHtml } from '../text';

const SITI_ESTERNI = /^https:\/\/(?:www\.)?(?:inballet\.it|wa\.me|instagram\.com|facebook\.com|google\.[a-z.]+\/maps)(?:[/?#]|$)/i;

const LINK_RE = new RegExp(
  [
    String.raw`\[([^\]\n]+)\]\(([^)\s]+)\)`, // 1-2: link Markdown [testo](indirizzo)
    String.raw`(https?:\/\/[^\s<]*[^\s<.,;:!?)])`, // 3: indirizzo web
    String.raw`([\w.%+-]+@[\w-]+(?:\.[\w-]+)+)`, // 4: e-mail
    String.raw`(\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{4})`, // 5: telefono
    String.raw`(?<=^|[\s(])(\/[a-z][a-z0-9-]*(?:\/[a-z0-9.-]+)*)(?=[\s.,;:!?)]|$)`, // 6: pagina del sito
  ].join('|'),
  'gim',
);

const a = (href: string, testo: string) => {
  const esterno = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${href}" class="cb-link"${esterno}>${testo}</a>`;
};

/** Indirizzo consentito (già con escape HTML) o null. */
function hrefSicuro(url: string): string | null {
  const u = url.replace(/&amp;/g, '&');
  if (/^\/[a-z0-9/._-]*$/i.test(u) && !u.includes('..')) return url;
  if (/^tel:\+?[\d\s-]+$/.test(u) || /^mailto:[\w.%+-]+@[\w.-]+$/.test(u)) return url;
  return SITI_ESTERNI.test(u) ? url : null;
}

export function formatta(testo: string): string {
  return escapeHtml(testo.trim())
    .replace(/^#{1,6}\s+/gm, '') // niente titoli
    .replace(/^\s*[-*•]\s+/gm, '• ') // elenchi puntati
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(LINK_RE, (m, mdTesto, mdUrl, url, email, tel, pagina) => {
      if (mdTesto) {
        const href = hrefSicuro(mdUrl);
        return href ? a(href, mdTesto) : mdTesto;
      }
      if (url) return hrefSicuro(url) ? a(url, url) : url;
      if (email) return a(`mailto:${email}`, email);
      if (tel) return a(`tel:${tel.replace(/[\s-]/g, '')}`, tel);
      if (pagina) return a(pagina, pagina);
      return m;
    })
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\r?\n/g, '<br>');
}
