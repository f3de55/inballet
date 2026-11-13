import { escapeHtml } from './text';

function riga(testo: string) {
  return escapeHtml(testo)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_, etichetta: string, url: string) =>
        `<a href="${url}" target="_blank" rel="noopener">${etichetta}<span class="sr-only"> (si apre in una nuova scheda)</span></a>`,
    );
}

export function formattaRisposta(testo: string): string {
  const html: string[] = [];
  let paragrafo: string[] = [];
  let lista: 'ul' | 'ol' | null = null;
  const chiudi = () => {
    if (paragrafo.length) html.push(`<p>${paragrafo.join('<br>')}</p>`);
    if (lista) html.push(`</${lista}>`);
    paragrafo = [];
    lista = null;
  };
  for (const r of testo.split('\n')) {
    const t = r.trim();
    if (!t || /^([-*_])\1{2,}$/.test(t)) {
      chiudi();
      continue;
    }
    const titolo = t.match(/^#{1,6}\s+(.+)$/);
    if (titolo) {
      chiudi();
      html.push(`<h2>${riga(titolo[1].replace(/\*\*/g, ''))}</h2>`);
      continue;
    }
    const voce = t.match(/^(?:([-*•])|\d+[.)])\s+(.+)$/);
    if (voce) {
      const tipo = voce[1] ? 'ul' : 'ol';
      if (paragrafo.length || lista !== tipo) {
        chiudi();
        html.push(`<${tipo}>`);
        lista = tipo;
      }
      html.push(`<li>${riga(voce[2])}</li>`);
      continue;
    }
    if (lista) chiudi();
    paragrafo.push(riga(t));
  }
  chiudi();
  return html.join('');
}
