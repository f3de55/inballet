import { apri, aperta, chiudi } from '../finestre';
import { CHIAVE_ANTEPRIMA } from './comune';

const main = document.querySelector<HTMLElement>('.db-main')!;
const iframe = document.getElementById('dbAnteprima') as HTMLIFrameElement | null;
const piccolo = matchMedia('(max-width: 700px)');

function salvata(): string | null {
  try {
    const p = sessionStorage.getItem(CHIAVE_ANTEPRIMA);
    sessionStorage.removeItem(CHIAVE_ANTEPRIMA);
    return p;
  } catch {
    return null;
  }
}

if (iframe) {
  const pagina = main.dataset.pagina!;
  const base = pagina.split(/[?#]/)[0];
  const qui = document.getElementById('dbModificaQui');
  let osservatore: MutationObserver | null = null;

  const mostra = (percorso: string) => {
    iframe.src = percorso;
    if (piccolo.matches) chiudi('finElenco');
  };

  const riga = (): HTMLElement | null => {
    const d = iframe.contentDocument;
    if (!d) return null;
    const insegnante = d.querySelector<HTMLDialogElement>('dialog.ins-dialog[open]');
    if (insegnante) return document.querySelector<HTMLElement>(`.ins[data-id="${CSS.escape(insegnante.id.replace(/^insegnante-/, ''))}"]`);
    if (!d.querySelector('dialog.evento-dialog[open]')) return null;
    const slug = new URLSearchParams(iframe.contentWindow?.location.search ?? '').get('evento');
    return (
      [...document.querySelectorAll<HTMLElement>('.ev[data-modifica]')].find((r) => {
        const ev = JSON.parse(r.dataset.modifica!) as { id: string; slug: string; alias?: string[] };
        return slug !== null && (ev.slug === slug || ev.id === slug || ev.alias?.includes(slug));
      }) ?? null
    );
  };

  const aggiornaQui = () => {
    if (qui) qui.hidden = !riga();
  };

  const apriInsegnante = () => {
    const d = iframe.contentDocument;
    const id = new URLSearchParams(iframe.contentWindow?.location.search ?? '').get('insegnante');
    const scheda = id ? d?.getElementById(`insegnante-${id}`) : null;
    if (!(scheda instanceof (iframe.contentWindow as Window & typeof globalThis).HTMLDialogElement) || scheda.open) return;
    scheda.showModal();
    scheda.focus();
  };

  iframe.addEventListener('load', () => {
    osservatore?.disconnect();
    const d = iframe.contentDocument;
    if (!d?.body) return;
    osservatore = new MutationObserver(aggiornaQui);
    osservatore.observe(d.body, { attributes: true, attributeFilter: ['open'], subtree: true });
    setTimeout(apriInsegnante, 400);
    aggiornaQui();
  });

  qui?.addEventListener('click', () => riga()?.querySelector<HTMLButtonElement>('[data-azione="modifica"]')?.click());

  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('[data-anteprima]');
    if (t) mostra(t.dataset.anteprima!);
    if ((e.target as Element).closest('[data-apri-elenco]')) {
      if (aperta('finElenco')) chiudi('finElenco');
      else apri('finElenco');
    }
  });

  document.addEventListener('anteprima', () => iframe.contentWindow?.location.reload());

  const richiesta = salvata();
  iframe.src = richiesta?.startsWith(base) ? richiesta : pagina;
  if (!piccolo.matches) apri('finElenco');
}
