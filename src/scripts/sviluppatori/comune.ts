import { toast } from '../dashboard/toast';

export { toast };
export { conferma } from '../dashboard/conferma';

type Risposta<T> = { data?: T; error?: { message: string } };

export async function chiama<T>(promessa: Promise<Risposta<T>>, errore = 'Operazione non riuscita'): Promise<T | undefined> {
  try {
    const { data, error } = await promessa;
    if (error) {
      toast(error.message || errore, 'error');
      return undefined;
    }
    return data as T;
  } catch {
    toast(errore, 'error');
    return undefined;
  }
}

type Figlio = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributi: Record<string, string | number | boolean | undefined> = {},
  ...figli: (Figlio | Figlio[])[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') e.className = String(v);
    else if (k === 'text') e.textContent = String(v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const f of figli.flat()) if (f) e.append(f);
  return e;
}

export const icona = (classe: string) => el('i', { class: `fas ${classe}`, 'aria-hidden': 'true' });

export function normalizza(testo: string): string {
  return testo.replace(/\s+/g, ' ').trim();
}

export const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const ascoltatori = new Map<string, Set<(dato?: unknown) => void>>();

export function ascolta(evento: string, fn: (dato?: unknown) => void): void {
  if (!ascoltatori.has(evento)) ascoltatori.set(evento, new Set());
  ascoltatori.get(evento)!.add(fn);
}

export function emetti(evento: string, dato?: unknown): void {
  ascoltatori.get(evento)?.forEach((fn) => fn(dato));
}

export function chiedi(titolo: string, etichetta: string, valore = ''): Promise<string | null> {
  const dlg = $<HTMLDialogElement>('svChiedi');
  const campo = $<HTMLInputElement>('svChiediCampo');
  $('svChiediTitolo').textContent = titolo;
  $('svChiediEtichetta').textContent = etichetta;
  campo.value = valore;
  dlg.returnValue = '';
  dlg.showModal();
  campo.focus();
  campo.select();
  return new Promise((ok) =>
    dlg.addEventListener('close', () => ok(dlg.returnValue === 'si' && campo.value.trim() ? campo.value.trim() : null), { once: true }),
  );
}

export function rimbalzo<A extends unknown[]>(fn: (...a: A) => void, ms = 150): (...a: A) => void {
  let t = 0;
  return (...a: A) => {
    clearTimeout(t);
    t = window.setTimeout(() => fn(...a), ms);
  };
}

export const COLORE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i;

export function aEsadecimale(colore: string, doc: Document = document): string | null {
  const prova = doc.createElement('span');
  prova.style.color = '';
  prova.style.color = colore;
  if (!prova.style.color) return null;
  doc.body.append(prova);
  const calcolato = getComputedStyle(prova).color;
  prova.remove();
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(calcolato);
  if (!m) return null;
  return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
}
