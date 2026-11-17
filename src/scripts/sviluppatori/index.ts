import { actions } from 'astro:actions';
import { $, ascolta, chiama, el, rimbalzo } from './comune';
import { dimensiona, impostaLarghezza, impostaModo, impostaTema, onCarica, percorsoAttuale, ricarica, seleziona, vai } from './anteprima';
import { aggiornaElencoToken, tutte } from './regole';
import './ispettore';
import { mostraTema } from './tema';
import { mostraAnimazioni } from './animazioni';
import { mostraSeo } from './seo';
import { mostraImmagini } from './immagini';
import { mostraFile } from './file';
import { mostraPubblica } from './pubblica';

const schede = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-vista]')];
const lavoro = $('svLavoro');
const conteggio = $('svConteggio');
const indirizzo = $<HTMLInputElement>('svIndirizzo');
const ALTRE_PAGINE = [
  '/dashboard',
  '/dashboard?s=bot',
  '/dashboard?s=documenti',
  '/dashboard?s=insegnanti',
  '/login?anteprima',
  '/presentazione',
  '/pagina-inesistente',
];
let font = '';
let vistaAttuale = 'visuale';

function ricorda() {
  history.replaceState(null, '', `#${vistaAttuale}${percorsoAttuale()}`);
}

const mostra: Record<string, () => void> = {
  visuale: () => {},
  tema: () => mostraTema(font),
  animazioni: mostraAnimazioni,
  seo: mostraSeo,
  immagini: mostraImmagini,
  file: mostraFile,
  pubblica: mostraPubblica,
};

function apriVista(id: string, fuoco = false) {
  for (const s of schede) {
    const attiva = s.dataset.vista === id;
    s.setAttribute('aria-selected', String(attiva));
    s.tabIndex = attiva ? 0 : -1;
    $(`vista-${s.dataset.vista}`).hidden = !attiva;
    if (attiva && fuoco) s.focus();
  }
  vistaAttuale = id;
  ricorda();
  if (id !== 'visuale') seleziona(null);
  const conAnteprima = $(`vista-${id}`).hasAttribute('data-con-anteprima');
  lavoro.hidden = !conAnteprima;
  if (conAnteprima) requestAnimationFrame(dimensiona);
  mostra[id]?.();
}

schede.forEach((s, i) => {
  s.addEventListener('click', () => apriVista(s.dataset.vista!));
  s.addEventListener('keydown', (e) => {
    const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (e.key === 'Home' || e.key === 'End' || passo) {
      e.preventDefault();
      const j = e.key === 'Home' ? 0 : e.key === 'End' ? schede.length - 1 : (i + passo + schede.length) % schede.length;
      apriVista(schede[j].dataset.vista!, true);
    }
  });
});

function premi(selettore: string, scelto: HTMLElement) {
  document.querySelectorAll(selettore).forEach((b) => b.setAttribute('aria-pressed', String(b === scelto)));
}

document.querySelectorAll<HTMLButtonElement>('[data-dispositivo]').forEach((b) =>
  b.addEventListener('click', () => {
    premi('[data-dispositivo]', b);
    impostaLarghezza(Number(b.dataset.larghezza));
  }),
);

function temaAnteprima(t: 'chiaro' | 'scuro') {
  premi('[data-tema-anteprima]', document.querySelector(`[data-tema-anteprima="${t}"]`)!);
  impostaTema(t);
}
document
  .querySelectorAll<HTMLButtonElement>('[data-tema-anteprima]')
  .forEach((b) => b.addEventListener('click', () => temaAnteprima(b.dataset.temaAnteprima as 'chiaro' | 'scuro')));

document.querySelectorAll<HTMLButtonElement>('[data-modo]').forEach((b) =>
  b.addEventListener('click', () => {
    premi('[data-modo]', b);
    impostaModo(b.dataset.modo as 'modifica' | 'naviga');
  }),
);

indirizzo.addEventListener('change', () => vai(indirizzo.value));
indirizzo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') vai(indirizzo.value);
});
$('svRicarica').addEventListener('click', ricarica);

const aggiornaConteggio = rimbalzo(async () => {
  const s = await chiama(actions.sviluppatori.stato());
  if (!s) return;
  font = s.font;
  conteggio.hidden = !s.modifiche.length;
  conteggio.textContent = String(s.modifiche.length);
}, 400);

ascolta('modificato', aggiornaConteggio);
ascolta('mostra-vista', (id) => apriVista(String(id)));
ascolta('vai', (p) => {
  apriVista('visuale');
  vai(String(p));
});
ascolta('tema-anteprima', (t) => temaAnteprima(t as 'chiaro' | 'scuro'));

aggiornaConteggio();
void tutte().then(aggiornaElencoToken);
void chiama(actions.sviluppatori.pagine()).then((pagine) => {
  $('svPagine').replaceChildren(...[...(pagine ?? []), ...ALTRE_PAGINE].map((p) => el('option', { value: p })));
});
onCarica(ricorda);
const [, vistaIniziale = 'visuale', paginaIniziale = '/'] = /^#([a-z]+)(\/.*)?$/.exec(location.hash) ?? [];
apriVista(schede.some((s) => s.dataset.vista === vistaIniziale) ? vistaIniziale : 'visuale');
vai(paginaIniziale);
