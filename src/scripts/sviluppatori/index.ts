import { actions } from 'astro:actions';
import { $, ascolta, chiama, rimbalzo } from './comune';
import {
  dimensiona,
  elementoAttuale,
  impostaLarghezza,
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
import { apri, chiudi, inCima } from './finestre';
import './ispettore';
import { mostraTema } from './tema';
import { mostraAnimazioni } from './animazioni';
import { mostraSeo } from './seo';
import { mostraImmagini } from './immagini';
import { mostraFile } from './file';
import { mostraPubblica } from './pubblica';
import { apriPalette, impostaComandi, type Comando } from './palette';

type Strumento = { nome: string; finestra: string; scheda?: string; tasto: string; icona: string; fuoco?: string; mostra: () => void };

const CHIAVE_VISTA = 'sv-vista';
const ALTRE_PAGINE = [
  '/dashboard',
  '/dashboard?s=bot',
  '/dashboard?s=documenti',
  '/dashboard?s=insegnanti',
  '/login?anteprima',
  '/presentazione',
  '/pagina-inesistente',
];
const GRUPPI: Record<string, string> = { design: 'tema', contenuti: 'seo', codice: 'file', pubblica: 'pubblica' };
const conteggio = $('svConteggio');
const dispositivi = [...document.querySelectorAll<HTMLButtonElement>('button[data-dispositivo]')];
const modi = [...document.querySelectorAll<HTMLButtonElement>('[data-modo]')];
const vistaMenu = $('svVistaMenu');
let font = '';
let strumentoAttuale = 'visuale';
let modo: 'modifica' | 'naviga' = 'modifica';
let tema: 'chiaro' | 'scuro' = 'chiaro';
const ultimeSchede: Record<string, string> = {};

const STRUMENTI: Record<string, Strumento> = {
  tema: {
    nome: 'Tema',
    finestra: 'finDesign',
    scheda: 'scheda-tema',
    tasto: 'T',
    icona: 'fa-layer-group',
    fuoco: 'svCercaToken',
    mostra: () => mostraTema(font),
  },
  animazioni: {
    nome: 'Animazioni',
    finestra: 'finDesign',
    scheda: 'scheda-animazioni',
    tasto: 'A',
    icona: 'fa-film',
    fuoco: 'svCercaAnimazioni',
    mostra: mostraAnimazioni,
  },
  seo: { nome: 'SEO', finestra: 'finContenuti', scheda: 'scheda-seo', tasto: 'S', icona: 'fa-magnifying-glass', mostra: mostraSeo },
  immagini: {
    nome: 'Immagini',
    finestra: 'finContenuti',
    scheda: 'scheda-immagini',
    tasto: 'I',
    icona: 'fa-image',
    fuoco: 'svCercaImmagini',
    mostra: mostraImmagini,
  },
  file: { nome: 'File', finestra: 'finCodice', tasto: 'F', icona: 'fa-code', fuoco: 'svFiltroFile', mostra: mostraFile },
  pubblica: { nome: 'Pubblica', finestra: 'finPubblica', tasto: 'P', icona: 'fa-paper-plane', fuoco: 'svMessaggio', mostra: mostraPubblica },
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
  modo = m;
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
$('svPagina').addEventListener('click', () => apriPalette());
document.querySelectorAll('[data-palette]').forEach((b) =>
  b.addEventListener('click', () => {
    $('svAltroMenu').hidePopover();
    apriPalette();
  }),
);

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

function tasto(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    apriPalette();
    return;
  }
  if (e.key === 'Escape') {
    if (document.querySelector('dialog[open]:modal, [popover]:popover-open')) return;
    const f = inCima();
    if (f && (f.contains(e.target as Node) || !scrivibile(e.target))) {
      e.preventDefault();
      f.close();
    } else if (!f && elementoAttuale()) seleziona(null);
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey || scrivibile(e.target) || document.querySelector('dialog[open]:modal')) return;
  const k = e.key.toUpperCase();
  const strumento = Object.entries(STRUMENTI).find(([, s]) => s.tasto === k)?.[0];
  const numero = Number(e.key);
  if (strumento) apriStrumento(strumento);
  else if (k === 'M') scegliModo(modo === 'modifica' ? 'naviga' : 'modifica');
  else if (k === 'D') temaAnteprima(tema === 'chiaro' ? 'scuro' : 'chiaro');
  else if (k === 'R') ricarica();
  else if (numero >= 1 && numero <= dispositivi.length) scegliDispositivo(dispositivi[numero - 1]);
  else return;
  e.preventDefault();
}
addEventListener('keydown', tasto);
onTasto(tasto);

const aggiornaConteggio = rimbalzo(async () => {
  const s = await chiama(actions.sviluppatori.stato());
  if (!s) return;
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
  chiudi('finContenuti');
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

function comandi(pagine: string[]): Comando[] {
  const strumenti: Comando[] = Object.entries(STRUMENTI).map(([id, s]) => ({
    gruppo: 'Strumenti',
    nome: s.nome,
    dettaglio: s.finestra === 'finDesign' ? 'Design' : s.finestra === 'finContenuti' ? 'Contenuti' : s.finestra === 'finCodice' ? 'Codice' : '',
    icona: s.icona,
    tasto: s.tasto,
    fai: () => apriStrumento(id),
  }));
  const vista: Comando[] = [
    ...dispositivi.map((b, i) => ({
      gruppo: 'Vista',
      nome: b.dataset.nome!,
      dettaglio: b.dataset.larghezza === '0' ? 'finestra' : `${b.dataset.larghezza} px`,
      icona: b.dataset.icona!,
      tasto: String(i + 1),
      fai: () => scegliDispositivo(b),
    })),
    { gruppo: 'Vista', nome: 'Tema chiaro / scuro', icona: 'fa-moon', tasto: 'D', fai: () => temaAnteprima(tema === 'chiaro' ? 'scuro' : 'chiaro') },
    { gruppo: 'Vista', nome: 'Modifica / Naviga', icona: 'fa-pen', tasto: 'M', fai: () => scegliModo(modo === 'modifica' ? 'naviga' : 'modifica') },
    { gruppo: 'Vista', nome: 'Ricarica l’anteprima', icona: 'fa-arrows-rotate', tasto: 'R', fai: ricarica },
  ];
  const vaiA: Comando[] = [...pagine, ...ALTRE_PAGINE].map((p) => ({ gruppo: 'Pagine', nome: p, icona: 'fa-route', fai: () => vai(p) }));
  const uscite: Comando[] = [
    { gruppo: 'Altro', nome: 'Dashboard', icona: 'fa-gear', fai: () => location.assign('/dashboard') },
    { gruppo: 'Altro', nome: 'Apri il sito in una nuova scheda', icona: 'fa-external-link-alt', fai: () => open(percorsoAttuale(), '_blank', 'noopener') },
    { gruppo: 'Altro', nome: 'Esci', icona: 'fa-sign-out-alt', fai: () => $<HTMLFormElement>('svEsci').requestSubmit() },
  ];
  return [...strumenti, ...vaiA, ...vista, ...uscite];
}

impostaComandi(comandi([]), {
  vai,
  token: (nome) => {
    apriStrumento('tema');
    const cerca = $<HTMLInputElement>('svCercaToken');
    cerca.value = nome;
    cerca.dispatchEvent(new Event('input'));
  },
});
void chiama(actions.sviluppatori.pagine()).then((pagine) => impostaComandi(comandi(pagine ?? [])));
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
