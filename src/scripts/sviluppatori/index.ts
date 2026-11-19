import { actions } from 'astro:actions';
import { $, ascolta, chiama, rimbalzo } from './comune';
import {
  dimensiona,
  elementoAttuale,
  impostaLarghezza,
  impostaModalita,
  impostaModo,
  impostaTema,
  larghezzaAttuale,
  onCarica,
  onTasto,
  percorsoAttuale,
  ricarica,
  seleziona,
  vai,
} from './anteprima';
import { aggiornaElencoToken, tutte } from './regole';
import { allarga, apri, chiudi, inCima } from './finestre';
import './ispettore';
import { mostraTema } from './tema';
import { mostraAnimazioni } from './animazioni';
import { mostraSeo } from './seo';
import { mostraImmagini } from './immagini';
import { mostraFile } from './file';
import { mostraPubblica } from './pubblica';
import { apriPalette, impostaPagine } from './palette';

type Strumento = { finestra: string; scheda?: string; larga?: boolean; fuoco?: string; mostra: () => void };

const CHIAVE_VISTA = 'sv-vista';
const AREA_RISERVATA = [
  '/dashboard',
  '/dashboard?s=bot',
  '/dashboard?s=documenti',
  '/dashboard?s=insegnanti',
  '/login?anteprima',
  '/presentazione',
  '/presentazione/google',
  '/presentazione/chatgpt',
  '/presentazione/claude',
  '/presentazione/mappa/oggi',
  '/presentazione/mappa/nuovo',
  '/pagina-inesistente',
];
const GRUPPI: Record<string, string> = { design: 'tema', codice: 'file', pubblica: 'pubblica' };
const conteggio = $('svConteggio');
const dispositivi = [...document.querySelectorAll<HTMLButtonElement>('button[data-dispositivo]')];
const modi = [...document.querySelectorAll<HTMLButtonElement>('[data-modo]')];
const vistaMenu = $('svVistaMenu');
let font = '';
let strumentoAttuale = 'visuale';
let tema: 'chiaro' | 'scuro' = 'chiaro';
const ultimeSchede: Record<string, string> = {};

const STRUMENTI: Record<string, Strumento> = {
  tema: { finestra: 'finDesign', scheda: 'scheda-tema', fuoco: 'svCercaToken', mostra: () => mostraTema(font) },
  animazioni: { finestra: 'finDesign', scheda: 'scheda-animazioni', fuoco: 'svCercaAnimazioni', mostra: mostraAnimazioni },
  seo: { finestra: 'finDesign', scheda: 'scheda-seo', larga: true, mostra: mostraSeo },
  immagini: { finestra: 'finDesign', scheda: 'scheda-immagini', larga: true, fuoco: 'svCercaImmagini', mostra: mostraImmagini },
  file: { finestra: 'finCodice', fuoco: 'svFiltroFile', mostra: mostraFile },
  pubblica: { finestra: 'finPubblica', fuoco: 'svMessaggio', mostra: mostraPubblica },
};

function ricordaIndirizzo() {
  history.replaceState(null, '', `#${strumentoAttuale}${percorsoAttuale()}`);
}

function ricordaVista() {
  try {
    localStorage.setItem(CHIAVE_VISTA, JSON.stringify({ dispositivo: $('svScena').dataset.dispositivo, tema }));
  } catch {
    return;
  }
}

function scegliScheda(s: Strumento) {
  if (!s.scheda) return;
  const scelta = $(s.scheda);
  for (const t of scelta.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
    const attiva = t === scelta;
    t.setAttribute('aria-selected', String(attiva));
    t.tabIndex = attiva ? 0 : -1;
    $(t.getAttribute('aria-controls')!).hidden = !attiva;
  }
  ultimeSchede[s.finestra] = scelta.dataset.strumento!;
  allarga(s.finestra, Boolean(s.larga));
}

function apriStrumento(id: string, fuoco = true) {
  const s = STRUMENTI[id];
  if (!s) return;
  scegliScheda(s);
  apri(s.finestra, fuoco && s.fuoco ? $(s.fuoco) : null);
  strumentoAttuale = id;
  ricordaIndirizzo();
  s.mostra();
}

function alternaGruppo(gruppo: string) {
  const id = GRUPPI[gruppo];
  const finestra = STRUMENTI[id].finestra;
  const f = $<HTMLDialogElement>(finestra);
  if (f.open && inCima() === f) {
    chiudi(finestra);
    return;
  }
  apriStrumento(ultimeSchede[finestra] ?? id);
}

for (const lista of document.querySelectorAll<HTMLElement>('.sv-linguette')) {
  const schede = [...lista.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  schede.forEach((t, i) => {
    t.addEventListener('click', () => apriStrumento(t.dataset.strumento!, false));
    t.addEventListener('keydown', (e) => {
      const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!passo) return;
      e.preventDefault();
      const altra = schede[(i + passo + schede.length) % schede.length];
      apriStrumento(altra.dataset.strumento!, false);
      altra.focus();
    });
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-apri]').forEach((b) => b.addEventListener('click', () => alternaGruppo(b.dataset.apri!)));

function premi(lista: HTMLElement[], scelto: HTMLElement) {
  lista.forEach((b) => b.setAttribute('aria-pressed', String(b === scelto)));
}

function etichettaVista() {
  const scelto = dispositivi.find((b) => b.getAttribute('aria-pressed') === 'true') ?? dispositivi[0];
  $('svVistaIcona').className = `fas ${scelto.dataset.icona}`;
  $('svVistaTema').className = `fas ${tema === 'scuro' ? 'fa-moon' : 'fa-sun'}`;
  $('svVistaLarghezza').textContent = `${larghezzaAttuale()}`;
  $('svVista').setAttribute('aria-label', `Vista: ${scelto.dataset.nome}, ${larghezzaAttuale()} px, tema ${tema}`);
}

function scegliDispositivo(b: HTMLButtonElement) {
  premi(dispositivi, b);
  impostaLarghezza(Number(b.dataset.larghezza), b.dataset.dispositivo!);
  etichettaVista();
  ricordaVista();
}
dispositivi.forEach((b) => b.addEventListener('click', () => scegliDispositivo(b)));

function temaAnteprima(t: 'chiaro' | 'scuro') {
  tema = t;
  premi([...document.querySelectorAll<HTMLButtonElement>('[data-tema-anteprima]')], document.querySelector(`[data-tema-anteprima="${t}"]`)!);
  impostaTema(t);
  etichettaVista();
  ricordaVista();
}
document
  .querySelectorAll<HTMLButtonElement>('[data-tema-anteprima]')
  .forEach((b) => b.addEventListener('click', () => temaAnteprima(b.dataset.temaAnteprima as 'chiaro' | 'scuro')));

function scegliModo(m: 'modifica' | 'naviga') {
  premi(
    modi,
    modi.find((b) => b.dataset.modo === m)!,
  );
  impostaModo(m);
  if (m === 'naviga') seleziona(null);
}
modi.forEach((b) => b.addEventListener('click', () => scegliModo(b.dataset.modo as 'modifica' | 'naviga')));

$('svRicarica').addEventListener('click', () => {
  vistaMenu.hidePopover();
  ricarica();
});
$('svPagina').addEventListener('click', apriPalette);

for (const menu of document.querySelectorAll<HTMLElement>('.sv-menu[popover]')) {
  menu.addEventListener('toggle', (e) => {
    if ((e as ToggleEvent).newState !== 'open') return;
    const bottone = document.querySelector<HTMLElement>(`[popovertarget="${menu.id}"]`)!.getBoundingClientRect();
    const larga = menu.offsetWidth;
    menu.style.left = `${Math.min(Math.max(12, bottone.left + bottone.width / 2 - larga / 2), innerWidth - larga - 12)}px`;
    menu.style.bottom = `${innerHeight - bottone.top + 10}px`;
  });
}

const scrivibile = (t: EventTarget | null) =>
  typeof (t as Element | null)?.closest === 'function' &&
  Boolean((t as Element).closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], .cm-editor'));

function esc(e: KeyboardEvent) {
  if (e.key !== 'Escape' || document.querySelector('dialog[open]:modal, [popover]:popover-open')) return;
  const f = inCima();
  if (f && (f.contains(e.target as Node) || !scrivibile(e.target))) {
    e.preventDefault();
    f.close();
  } else if (!f && elementoAttuale()) seleziona(null);
}
addEventListener('keydown', esc);
onTasto(esc);

const aggiornaConteggio = rimbalzo(async () => {
  const s = await chiama(actions.sviluppatori.stato());
  if (!s) return;
  impostaModalita(s.modalita);
  const cambiato = font !== s.font;
  font = s.font;
  if (cambiato && $('vista-tema').checkVisibility()) mostraTema(font);
  conteggio.hidden = !s.modifiche.length;
  conteggio.textContent = String(s.modifiche.length);
  $('svDock')
    .querySelector('[data-apri="pubblica"]')
    ?.setAttribute('aria-label', s.modifiche.length ? `Pubblica, ${s.modifiche.length} modifiche` : 'Pubblica');
}, 400);

ascolta('modificato', aggiornaConteggio);
ascolta('mostra-vista', (id) => apriStrumento(String(id), false));
ascolta('vai', (p) => {
  chiudi('finDesign');
  vai(String(p));
});
ascolta('tema-anteprima', (t) => temaAnteprima(t as 'chiaro' | 'scuro'));
ascolta('finestre', () => {
  const f = inCima();
  const id = f
    ? (Object.entries(STRUMENTI).find(([, s]) => s.finestra === f.id && (!s.scheda || !$(s.scheda.replace('scheda-', 'vista-')).hidden))?.[0] ?? 'visuale')
    : 'visuale';
  strumentoAttuale = id;
  ricordaIndirizzo();
});
ascolta('dimensioni', etichettaVista);

const elenco = (sito: string[]) => [
  ...sito.map((percorso) => ({ gruppo: 'Pagine del sito', percorso })),
  ...AREA_RISERVATA.map((percorso) => ({ gruppo: 'Area riservata e errori', percorso })),
];
impostaPagine(elenco([]), vai);
void chiama(actions.sviluppatori.pagine()).then((sito) => impostaPagine(elenco(sito ?? []), vai));
void tutte().then(aggiornaElencoToken);
aggiornaConteggio();
onCarica(ricordaIndirizzo);

function ripristinaVista() {
  try {
    const salvata = JSON.parse(localStorage.getItem(CHIAVE_VISTA) ?? '{}') as { dispositivo?: string; tema?: 'chiaro' | 'scuro' };
    const b = dispositivi.find((d) => d.dataset.dispositivo === salvata.dispositivo);
    if (b) scegliDispositivo(b);
    if (salvata.tema === 'scuro') temaAnteprima('scuro');
  } catch {
    return;
  }
}
ripristinaVista();
etichettaVista();
requestAnimationFrame(dimensiona);

const [, iniziale = 'visuale', paginaIniziale = '/'] = /^#([a-z]+)(\/.*)?$/.exec(location.hash) ?? [];
vai(paginaIniziale);
if (STRUMENTI[iniziale]) apriStrumento(iniziale, false);
