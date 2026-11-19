import { actions } from 'astro:actions';
import { $, ascolta, chiama, el, emetti, icona, normalizza, toast } from './comune';
import {
  elementoAttuale,
  nomeElemento,
  onSeleziona,
  percorsoAttuale,
  rettangoloScelto,
  ritoccaImmagine,
  ritoccaTesto,
  seleziona,
  simulaStato,
} from './anteprima';
import { apri, aperta, chiudi, evita } from '../finestre';
import { cartaRegola, corrispondenti, etichettaContesto, nuovaRegola, tutte, type Corrispondenza } from './regole';

type Esito =
  | { esito: 'fatto'; file: { percorso: string; riga: number }[] }
  | { esito: 'scegli'; candidati: { file: string; inizio: number; riga: number; estratto: string; punti: number }[] }
  | { esito: 'nessuno' }
  | { esito: 'calcolato'; espressione: string; file: string; riga: number };

const ATTRIBUTI = ['alt', 'title', 'aria-label', 'placeholder', 'content', 'value', 'href'];
const CALCOLATI = [
  'display',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'margin',
  'padding',
  'gap',
  'width',
  'height',
  'border-radius',
];

const pannello = $('svIspettore');
const titolo = $('svIspettoreTitolo');
const finestra = $<HTMLDialogElement>('finIspettore');
let scheda: 'testo' | 'stile' | null = null;
let statoScelto: string | null = null;

function vicini(e: Element, escluso: string): string[] {
  const testi = new Set<string>();
  const radice = e.closest('section, header, footer, nav, form, dialog, article, li') ?? e.parentElement ?? e;
  const giro = radice.ownerDocument.createTreeWalker(radice, NodeFilter.SHOW_TEXT);
  for (let n = giro.nextNode(); n && testi.size < 10; n = giro.nextNode()) {
    const t = normalizza(n.textContent ?? '');
    if (t.length > 3 && t !== escluso) testi.add(t.slice(0, 300));
  }
  return [...testi];
}

function nodiTesto(e: Element): Text[] {
  const out: Text[] = [];
  const giro = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('script, style, noscript, template') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = giro.nextNode() as Text | null; n && out.length < 40; n = giro.nextNode() as Text | null) if (normalizza(n.data)) out.push(n);
  return out;
}

function avviso(testo: string, tipo: 'info' | 'errore' = 'info', ...extra: HTMLElement[]): HTMLElement {
  return el('div', { class: `sv-avviso sv-avviso--${tipo}`, role: 'status' }, el('p', { text: testo }), ...extra);
}

function apriFile(percorso: string, riga?: number) {
  emetti('apri-file', { percorso, riga });
}

export async function inviaTesto(
  vecchio: string,
  nuovo: string,
  dove: { vicini: string[]; pagina: string },
  esito: HTMLElement,
  applica: (file: string) => void,
  extra: { scelta?: { file: string; inizio: number }; tutte?: boolean } = {},
): Promise<void> {
  esito.replaceChildren(avviso('Salvataggio…'));
  const r = (await chiama(actions.sviluppatori.testo({ vecchio, nuovo, ...dove, ...extra }), 'Testo non salvato')) as Esito | undefined;
  if (!r) {
    esito.replaceChildren();
    return;
  }
  if (r.esito === 'fatto') {
    const file = r.file[0]?.percorso ?? '';
    if (file) applica(file);
    emetti('modificato');
    const dove = r.file.map((f) => `${f.percorso}:${f.riga}`);
    esito.replaceChildren(avviso(dove.length ? `Salvato in ${dove.join(', ')}` : 'Nessuna modifica'));
    toast('Testo salvato', 'success');
    return;
  }
  if (r.esito === 'nessuno') {
    esito.replaceChildren(
      avviso(
        'Questo testo non è scritto nel codice: arriva dai dati della dashboard (eventi, insegnanti, documenti), da Google o dal chatbot. Modificalo da lì, oppure cerca un pezzo più corto nella scheda File.',
        'errore',
      ),
    );
    return;
  }
  if (r.esito === 'calcolato') {
    const apri = el('button', { type: 'button', class: 'btn btn-link', text: `Apri ${r.file}:${r.riga}` });
    apri.addEventListener('click', () => apriFile(r.file, r.riga));
    esito.replaceChildren(
      avviso(
        `Una parte di questo testo è calcolata dal codice (${r.espressione}): cambia solo il testo intorno, oppure modifica il valore dove è definito.`,
        'errore',
        apri,
      ),
    );
    return;
  }
  const scelte = el('ul', { class: 'sv-candidati' });
  for (const c of r.candidati) {
    const b = el('button', { type: 'button', class: 'sv-candidato' }, el('code', { text: `${c.file}:${c.riga}` }), el('small', { text: c.estratto }));
    b.addEventListener('click', () => void inviaTesto(vecchio, nuovo, dove, esito, applica, { scelta: { file: c.file, inizio: c.inizio } }));
    scelte.append(el('li', {}, b));
  }
  const tutteBtn = el('button', { type: 'button', class: 'btn btn-secondary', text: `Cambia in tutti i ${r.candidati.length} punti` });
  tutteBtn.addEventListener('click', () => void inviaTesto(vecchio, nuovo, dove, esito, applica, { tutte: true }));
  esito.replaceChildren(avviso('Lo stesso testo compare in più punti del codice. Scegli quale cambiare:'), scelte, tutteBtn);
}

const posizione = (e: Element, testo: string) => ({ vicini: vicini(e, normalizza(testo)), pagina: percorsoAttuale() });

export function campoTesto(
  etichetta: string,
  valore: string,
  salva: (vecchio: string, nuovo: string, esito: HTMLElement, fatto: () => void) => void,
  lungo = true,
): HTMLElement {
  const id = `sv-campo-${Math.random().toString(36).slice(2)}`;
  const campo = lungo
    ? el('textarea', { id, rows: Math.min(8, Math.max(1, Math.ceil(valore.length / 46))), spellcheck: 'true' })
    : el('input', { id, spellcheck: 'false' });
  campo.value = valore;
  const esito = el('div', { class: 'sv-esito' });
  const bottone = el('button', { type: 'button', class: 'btn btn-primary', disabled: true }, icona('fa-check'), 'Salva');
  let base = valore;
  const cambia = () => (bottone.disabled = normalizza(campo.value) === normalizza(base));
  const invia = () => {
    if (bottone.disabled) return;
    const nuovo = campo.value;
    salva(base, nuovo, esito, () => {
      base = normalizza(nuovo);
      cambia();
    });
  };
  campo.addEventListener('input', cambia);
  campo.addEventListener('keydown', (e) => {
    const tasto = e as KeyboardEvent;
    if (tasto.key === 'Enter' && !tasto.shiftKey) {
      e.preventDefault();
      invia();
    }
  });
  bottone.addEventListener('click', invia);
  return el(
    'div',
    { class: 'campo sv-campo-testo' },
    el('label', { for: id, text: etichetta }),
    campo,
    el('div', { class: 'sv-campo-azioni' }, bottone),
    esito,
  );
}

function sezioneTesti(e: Element): HTMLElement {
  const box = el('div', { class: 'sv-sezione' });
  const nodi = nodiTesto(e);
  if (!nodi.length) box.append(avviso('Questo elemento non contiene testo.'));
  nodi.forEach((n, i) => {
    const vecchio = normalizza(n.data);
    box.append(
      campoTesto(
        nodi.length > 1 ? `Testo ${i + 1} · ${n.parentElement ? nomeElemento(n.parentElement) : ''}` : 'Testo',
        vecchio,
        (prima, nuovo, esito, fatto) =>
          void inviaTesto(prima, nuovo, posizione(n.parentElement ?? e, prima), esito, (file) => {
            ritoccaTesto(file, prima, nuovo);
            fatto();
          }),
      ),
    );
  });
  for (const nome of ATTRIBUTI) {
    const valore = e.getAttribute(nome);
    if (!valore || (nome === 'value' && !(e instanceof HTMLInputElement))) continue;
    box.append(
      campoTesto(
        `Attributo ${nome}`,
        valore,
        (prima, nuovo, esito, fatto) =>
          void inviaTesto(prima, nuovo, posizione(e, prima), esito, (file) => {
            e.setAttribute(nome, normalizza(nuovo));
            ritoccaTesto(file, prima, nuovo, nome);
            fatto();
          }),
        nome !== 'href',
      ),
    );
  }
  return box;
}

let simboli: string[] | null = null;
async function elencoIcone(): Promise<string[]> {
  if (simboli) return simboli;
  const testo = await fetch('/assets/icons/inballet.svg').then(
    (r) => (r.ok ? r.text() : ''),
    () => '',
  );
  simboli = [...testo.matchAll(/<symbol id="([\w-]+)"/g)].map((m) => m[1]);
  return simboli;
}

function iconaDi(e: Element): Element | null {
  const trova = (x: Element) => [...x.classList].some((c) => c.startsWith('fa-'));
  if (trova(e)) return e;
  const figli = [...e.querySelectorAll('i')].filter(trova);
  return figli.length === 1 ? figli[0] : null;
}

function sezioneIcona(e: Element): HTMLElement | null {
  const i = iconaDi(e);
  if (!i) return null;
  const attuale = [...i.classList].find((c) => c.startsWith('fa-'))!;
  const box = el(
    'div',
    { class: 'sv-sezione' },
    el('h3', { text: 'Icona' }),
    el('p', { class: 'sv-spiega', text: `Ora: ${attuale.slice(3)}. Scegline un'altra:` }),
  );
  const cerca = el('input', { type: 'search', placeholder: 'Cerca icona…', 'aria-label': 'Cerca icona', class: 'sv-cerca-icona' });
  const griglia = el('div', { class: 'sv-icone' });
  const esito = el('div', { class: 'sv-esito' });
  const mostra = (nomi: string[]) => {
    const q = cerca.value.trim().toLowerCase();
    griglia.replaceChildren(
      ...nomi
        .filter((n) => !q || n.includes(q))
        .map((n) => {
          const b = el('button', {
            type: 'button',
            class: 'sv-icona-scelta',
            title: n,
            'aria-label': `Usa l'icona ${n}`,
            'aria-pressed': String(`fa-${n}` === attuale),
          });
          b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/icons/inballet.svg#${n}"></use></svg>`;
          b.addEventListener(
            'click',
            () =>
              void inviaTesto(attuale, `fa-${n}`, posizione(i.parentElement ?? i, attuale), esito, () => {
                i.classList.replace(attuale, `fa-${n}`);
                void aggiorna(elementoAttuale());
              }),
          );
          return b;
        }),
    );
  };
  void elencoIcone().then((nomi) => {
    mostra(nomi);
    cerca.addEventListener('input', () => mostra(nomi));
  });
  box.append(cerca, griglia, esito);
  return box;
}

function sezioneImmagine(e: Element): HTMLElement | null {
  const img = e instanceof HTMLImageElement ? e : e.querySelector('img');
  const w = e.ownerDocument.defaultView;
  const sfondo = w ? /url\(["']?([^"')]+)["']?\)/.exec(w.getComputedStyle(e).backgroundImage)?.[1] : undefined;
  const sorgente = img?.currentSrc || img?.src || sfondo;
  if (!sorgente || sorgente.startsWith('data:')) return null;
  const box = el('div', { class: 'sv-sezione' }, el('h3', { text: 'Immagine' }));
  const lista = el('div', { class: 'sv-file-immagini' }, avviso('Cerco il file…'));
  box.append(lista);
  void chiama(actions.sviluppatori.immagini({ indirizzo: new URL(sorgente, location.href).pathname + new URL(sorgente, location.href).search })).then(
    (file) => {
      if (!file?.length) {
        lista.replaceChildren(avviso('Questa immagine arriva dai dati (dashboard o caricamenti), non dal codice.'));
        return;
      }
      lista.replaceChildren(
        ...file.map((p) => {
          const input = el('input', { type: 'file', accept: 'image/*', class: 'sr-only' });
          const carica = el('label', { class: 'btn btn-secondary' }, icona('fa-cloud-upload-alt'), 'Sostituisci', input);
          input.addEventListener('change', async () => {
            const f = input.files?.[0];
            if (!f) return;
            const dati = new FormData();
            dati.append('percorso', p);
            dati.append('file', f);
            if ((await chiama(actions.sviluppatori.immagine(dati), 'Immagine non sostituita')) === undefined) return;
            ritoccaImmagine(p);
            const url = URL.createObjectURL(f);
            if (img) {
              img.removeAttribute('srcset');
              img
                .closest('picture')
                ?.querySelectorAll('source')
                .forEach((s) => s.remove());
              img.src = url;
            } else (e as HTMLElement).style.backgroundImage = `url("${url}")`;
            emetti('modificato');
            toast(`Immagine sostituita: ${p}`, 'success');
          });
          return el(
            'div',
            { class: 'sv-file-immagine' },
            el('img', { src: `/area-sviluppatori/file?p=${encodeURIComponent(p)}`, alt: '', loading: 'lazy' }),
            el('code', { text: p }),
            carica,
          );
        }),
      );
    },
  );
  return box;
}

function sezioneCalcolati(e: Element): HTMLElement {
  const w = e.ownerDocument.defaultView!;
  const s = w.getComputedStyle(e);
  const r = e.getBoundingClientRect();
  const righe = CALCOLATI.map((p) => el('div', {}, el('dt', { text: p }), el('dd', { text: s.getPropertyValue(p) })));
  righe.push(el('div', {}, el('dt', { text: 'misure' }), el('dd', { text: `${Math.round(r.width)} × ${Math.round(r.height)} px` })));
  return el('details', { class: 'sv-calcolati' }, el('summary', { text: 'Valori calcolati ora' }), el('dl', {}, ...righe));
}

function gruppoRegole(titolo: string, lista: Corrispondenza[]): HTMLElement | null {
  if (!lista.length) return null;
  return el(
    'div',
    { class: 'sv-gruppo-regole' },
    el('h3', { text: titolo }),
    ...lista.map((c) =>
      cartaRegola(c.regola, {
        attiva: c.attiva,
        etichette: [...c.stati.map((s) => `:${s}`), ...(c.pseudo ? [c.pseudo] : []), ...(c.tema ? [`tema ${c.tema}`] : [])],
      }),
    ),
  );
}

function formNuovaRegola(e: Element, trovate: Corrispondenza[], contesti: string[], fileCss: string[]): HTMLElement {
  const classe = [...e.classList].find((c) => !c.startsWith('sv-') && !c.startsWith('fa'));
  const suggerito =
    trovate
      .find((c) => !c.stati.length && !c.regola.contesti.length)
      ?.regola.selettore.split(',')[0]
      .trim() ?? (classe ? `.${classe}` : e.tagName.toLowerCase());
  const pagina = percorsoAttuale().split(/[?#]/)[0].replace(/^\//, '') || 'index';
  const predefinito = trovate[0]?.regola.file ?? fileCss.find((f) => f.endsWith(`/pages/${pagina}.css`)) ?? 'src/styles/global.css';
  const id = (s: string) => `sv-nr-${s}`;
  const selettore = el('input', { id: id('sel'), value: suggerito, spellcheck: 'false' });
  const stato = el(
    'select',
    { id: id('stato') },
    ...['', ':hover', ':focus-visible', ':active', '::before', '::after'].map((s) => el('option', { value: s, text: s || 'normale' })),
  );
  const larghezza = el(
    'select',
    { id: id('larg') },
    el('option', { value: '', text: 'tutte le larghezze' }),
    ...contesti.map((c) => el('option', { value: c, text: etichettaContesto(c) })),
  );
  const file = el(
    'select',
    { id: id('file') },
    ...fileCss.map((f) => el('option', { value: f, text: f.replace(/^src\/styles\//, ''), selected: f === predefinito })),
  );
  const prop = el('input', { id: id('prop'), list: 'svProprieta', placeholder: 'es. padding', spellcheck: 'false' });
  const valore = el('input', { id: id('val'), list: 'svToken', placeholder: 'es. 2rem', spellcheck: 'false' });
  const crea = el('button', { type: 'submit', class: 'btn btn-primary' }, icona('fa-plus'), 'Aggiungi regola');
  const campo = (etichetta: string, c: HTMLElement) => el('div', { class: 'campo' }, el('label', { for: c.id, text: etichetta }), c);
  const form = el(
    'form',
    { class: 'sv-nuova-regola' },
    campo('Selettore', selettore),
    el('div', { class: 'campi-2' }, campo('Stato', stato), campo('Larghezza', larghezza)),
    campo('File', file),
    el('div', { class: 'campi-2' }, campo('Proprietà', prop), campo('Valore', valore)),
    crea,
  );
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!prop.value.trim() || !valore.value.trim()) {
      toast('Scrivi proprietà e valore', 'warning');
      return;
    }
    crea.disabled = true;
    await nuovaRegola(file.value, `${selettore.value.trim()}${stato.value}`, larghezza.value ? [larghezza.value] : [], prop.value.trim(), valore.value.trim());
    crea.disabled = false;
  });
  return el('details', { class: 'sv-calcolati' }, el('summary', { text: 'Nuova regola per questo elemento' }), form);
}

async function sezioneStili(e: Element): Promise<HTMLElement> {
  const regole = await tutte();
  const trovate = corrispondenti(e, regole).reverse();
  const contesti = [...new Set(regole.flatMap((r) => r.contesti).filter((c) => /^@media \((max|min)-width/.test(c)))].sort(
    (a, b) => Number(/\d+/.exec(b)?.[0]) - Number(/\d+/.exec(a)?.[0]),
  );
  const fileCss = [...new Set(regole.map((r) => r.file))].sort();
  const statiBox = el('div', { class: 'sv-gruppo sv-stati', role: 'group', 'aria-label': 'Simula lo stato' });
  for (const [valore, nome] of [
    ['', 'Normale'],
    ['hover', 'Mouse sopra'],
    ['focus', 'Focus'],
    ['active', 'Premuto'],
  ] as const) {
    const b = el('button', { type: 'button', 'aria-pressed': String((statoScelto ?? '') === valore), text: nome });
    b.addEventListener('click', () => {
      statoScelto = valore || null;
      simulaStato(statoScelto, regole);
      void aggiorna(e);
    });
    statiBox.append(b);
  }
  const attive = trovate.filter((c) => c.attiva);
  const stati = trovate.filter((c) => !c.attiva && c.stati.length);
  const altre = trovate.filter((c) => !c.attiva && !c.stati.length);
  const box = el('div', { class: 'sv-sezione' });
  box.append(statiBox, sezioneCalcolati(e));
  if (!trovate.length) box.append(avviso('Nessuna regola dei fogli di stile colpisce direttamente questo elemento: prendi il genitore o aggiungi una regola.'));
  for (const g of [gruppoRegole('Attive ora', attive), gruppoRegole('Mouse sopra, focus e premuto', stati), gruppoRegole('Altre larghezze e temi', altre)])
    if (g) box.append(g);
  box.append(formNuovaRegola(e, trovate, contesti, fileCss));
  return box;
}

function briciole(e: Element): HTMLElement {
  const catena: Element[] = [];
  for (let x: Element | null = e; x && x.tagName !== 'HTML'; x = x.parentElement) catena.unshift(x);
  const nav = el('nav', { class: 'sv-briciole', 'aria-label': 'Elementi contenitori' });
  catena.slice(-6).forEach((x) => {
    const b = el('button', { type: 'button', text: nomeElemento(x), 'aria-current': x === e ? 'true' : undefined });
    b.addEventListener('click', () => seleziona(x));
    nav.append(b);
  });
  return nav;
}

async function aggiorna(e: Element | null) {
  if (!e || !e.isConnected) {
    chiudi(finestra.id);
    simulaStato(null, []);
    statoScelto = null;
    return;
  }
  const diretto = [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && normalizza(n.textContent ?? '')) || Boolean(iconaDi(e)) || e.tagName === 'IMG';
  const attuale = scheda ?? (diretto ? 'testo' : 'stile');
  const schede = el('div', { class: 'sv-gruppo sv-schede-pannello', role: 'group', 'aria-label': 'Cosa modificare' });
  for (const [id, nome] of [
    ['stile', 'Stile'],
    ['testo', 'Testi e icone'],
  ] as const) {
    const b = el('button', { type: 'button', 'aria-pressed': String(attuale === id), text: nome });
    b.addEventListener('click', () => {
      scheda = id;
      void aggiorna(e);
    });
    schede.append(b);
  }
  const corpo = attuale === 'testo' ? el('div', {}, sezioneTesti(e), sezioneIcona(e), sezioneImmagine(e)) : await sezioneStili(e);
  if (elementoAttuale() !== e) return;
  const scorrimento = pannello.scrollTop;
  titolo.textContent = nomeElemento(e);
  pannello.replaceChildren(el('div', { class: 'sv-ispettore-testa' }, briciole(e), schede), corpo);
  const nuova = !aperta(finestra.id);
  if (nuova) apri(finestra.id);
  else pannello.scrollTop = scorrimento;
  if (nuova || !pannello.contains(document.activeElement)) evita(finestra.id, rettangoloScelto());
}

onSeleziona((e) => {
  scheda = null;
  pannello.scrollTop = 0;
  void aggiorna(e);
});
finestra.addEventListener('close', () => {
  if (elementoAttuale()) seleziona(null);
});
ascolta('stili', () => void aggiorna(elementoAttuale()));
ascolta('file-scartato', () => void aggiorna(elementoAttuale()));
document.addEventListener('click', (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>('[data-apri-file]');
  if (b) apriFile(b.dataset.apriFile!);
});
