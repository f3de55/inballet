import { escapeHtml } from '../text';

const SITI_ESTERNI = /^https:\/\/(?:www\.)?(?:inballet\.it|wa\.me|instagram\.com|facebook\.com|google\.[a-z.]+\/maps)(?:[/?#]|$)/i;

const LINK_RE = new RegExp(
  [
    String.raw`\[([^\]\n]+)\]\(([^)\s]+)\)`,
    String.raw`(https?:\/\/[^\s<]*[^\s<.,;:!?)])`,
    String.raw`([\w.%+-]+@[\w-]+(?:\.[\w-]+)+)`,
    String.raw`(?<!\d)((?:\+\d{2}[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3,4})(?!\d)`,
    String.raw`(?<=^|[\s(’]|&#039;)(\/[a-z][a-z0-9-]*(?:\/[a-z0-9.-]+)*)(?=[\s.,;:!?)]|$)`,
  ].join('|'),
  'gim',
);

const a = (href: string, testo: string) => {
  const esterno = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${href}" class="cb-link"${esterno}>${testo}${esterno && '<span class="sr-only"> (si apre in una nuova scheda)</span>'}</a>`;
};

function hrefSicuro(url: string): string | null {
  const u = url.replace(/&amp;/g, '&');
  if (/^\/(?!\/)[a-z0-9/._-]*$/i.test(u) && !u.includes('..')) return url;
  if (/^tel:\+?[\d\s-]+$/.test(u) || /^mailto:[\w.%+-]+@[\w.-]+$/.test(u)) return url;
  return SITI_ESTERNI.test(u) ? url : null;
}

export function formatta(testo: string): string {
  return escapeHtml(testo.trim())
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/\[(\/[a-z0-9/-]*)\](?!\()/gi, '$1')
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
