import { actions, isActionError } from 'astro:actions';
import '../styles/components/dialogo.css';
import '../styles/components/revisione.css';
import { COOKIE_REVISIONE, FILE_REVISIONE, MAX_TESTO_REVISIONE } from '../lib/revisione-comune';

const crea = <K extends keyof HTMLElementTagNameMap>(tag: K, attributi: Record<string, string> = {}, testo = '') => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) el.setAttribute(k, v);
  if (testo) el.textContent = testo;
  return el;
};
const icona = (nome: string) => crea('i', { class: `fas ${nome}`, 'aria-hidden': 'true' });
const peso = (byte: number) =>
  byte < 1024 * 1024 ? `${Math.max(1, Math.round(byte / 1024))} KB` : `${(byte / 1024 / 1024).toLocaleString('it-IT', { maximumFractionDigits: 1 })} MB`;

const nomePagina = () =>
  document.querySelector('.breadcrumb [aria-current="page"]')?.textContent?.trim() ||
  (location.pathname === '/' ? 'Home' : document.title.split(' | ')[0].trim());

const apri = crea('button', { type: 'button', class: 'btn-primary revisione-apri' });
apri.append(icona('fa-pen'), 'Proponi un testo');

const dialog = crea('dialog', { class: 'dialogo revisione-dialog', tabindex: '-1', 'aria-labelledby': 'revisione-titolo' });
const barra = crea('div', { class: 'dialogo-barra' });
const chiudi = crea('button', { type: 'button', class: 'btn-icon btn-icon--chiudi', 'aria-label': 'Chiudi' });
chiudi.append(icona('fa-times'));
barra.append(chiudi);

const form = crea('form', { class: 'dialogo-corpo revisione-corpo', novalidate: '' });
const testata = crea('div', { class: 'revisione-testata' });
const pagina = crea('strong');
const intro = crea('p', {}, 'Arriva nella tabella di Google Fogli, alla riga della pagina ');
intro.append(pagina, '.');
testata.append(crea('p', { class: 'eyebrow' }, 'Modalità revisione'), crea('h2', { id: 'revisione-titolo' }, 'Proponi un testo'), intro);

const campoTesto = crea('div', { class: 'revisione-campo' });
const testo = crea('textarea', { id: 'revisione-testo', rows: '7', maxlength: String(MAX_TESTO_REVISIONE) });
campoTesto.append(crea('label', { for: 'revisione-testo', class: 'titoletto' }, 'Testo'), testo);

const campoFile = crea('div', { class: 'revisione-campo' });
const input = crea('input', { type: 'file', id: 'revisione-file', accept: FILE_REVISIONE, multiple: '' });
const elenco = crea('ul', { class: 'revisione-elenco', 'aria-label': 'File scelti' });
campoFile.append(
  crea('label', { for: 'revisione-file', class: 'titoletto' }, 'Immagini o video'),
  input,
  elenco,
  crea('small', { class: 'testo-piccolo' }, 'Vanno nella cartella di Google Drive, non sul sito.'),
);

const esito = crea('p', { class: 'revisione-esito', role: 'status' });
const invia = crea('button', { type: 'submit', class: 'btn-primary' });
const etichettaInvia = () => invia.replaceChildren('Invia alla tabella', icona('fa-arrow-right'));
etichettaInvia();

form.append(testata, campoTesto, campoFile, esito, invia);
dialog.append(barra, form);
document.body.append(apri, dialog);

let scelti: File[] = [];

const mostraFile = () => {
  elenco.replaceChildren(
    ...scelti.map((f, i) => {
      const riga = crea('li');
      const togli = crea('button', { type: 'button', class: 'btn-icon btn-icon--chiudi', 'aria-label': `Togli ${f.name}` });
      togli.append(icona('fa-times'));
      togli.addEventListener('click', () => {
        scelti.splice(i, 1);
        mostraFile();
        input.focus();
      });
      riga.append(
        icona(f.type.startsWith('video/') ? 'fa-film' : 'fa-image'),
        crea('span', {}, f.name),
        crea('small', { class: 'testo-piccolo' }, peso(f.size)),
        togli,
      );
      return riga;
    }),
  );
};

const scrivi = (messaggio: string, tipo: 'ok' | 'errore' | '' = '') => {
  esito.textContent = messaggio;
  esito.dataset.esito = tipo;
};

const sessioneScaduta = () => {
  document.cookie = `${COOKIE_REVISIONE}=; Max-Age=0; path=/`;
  const link = crea('a', { href: `/login?da=${encodeURIComponent(location.pathname + location.search)}` }, 'Accedi di nuovo');
  esito.replaceChildren('Sessione scaduta. ', link);
  esito.dataset.esito = 'errore';
};

input.addEventListener('change', () => {
  const nuovi = [...(input.files ?? [])].filter((f) => f.size > 0 && /^(image|video)\//.test(f.type));
  input.value = '';
  scelti = [...scelti, ...nuovi];
  mostraFile();
});

apri.addEventListener('click', () => {
  pagina.textContent = nomePagina();
  dialog.showModal();
  dialog.focus();
});
chiudi.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

class Fallito extends Error {
  constructor(public errore: unknown) {
    super(isActionError(errore) ? errore.message : 'Invio non riuscito: riprova');
  }
}

async function caricaFile(file: File, nome: string, avanza: (byte: number) => void): Promise<string> {
  const { data, error } = await actions.revisione.inizia({ pagina: nome, nome: file.name, tipo: file.type, peso: file.size });
  if (error) throw new Fallito(error);
  for (let inizio = 0; inizio < file.size; inizio += data.pezzo) {
    const dati = new FormData();
    dati.set('id', data.id);
    dati.set('inizio', String(inizio));
    dati.set('pezzo', file.slice(inizio, inizio + data.pezzo), file.name);
    const { error: errorePezzo } = await actions.revisione.pezzo(dati);
    if (errorePezzo) throw new Fallito(errorePezzo);
    avanza(Math.min(data.pezzo, file.size - inizio));
  }
  return data.id;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (invia.disabled) return;
  if (!testo.value.trim() && !scelti.length) return scrivi('Scrivi un testo o aggiungi un’immagine o un video.', 'errore');
  const nome = nomePagina();
  const totale = scelti.reduce((n, f) => n + f.size, 0);
  let inviati = 0;
  invia.disabled = true;
  invia.replaceChildren('Invio…');
  try {
    const caricamenti: string[] = [];
    for (const file of scelti) {
      caricamenti.push(
        await caricaFile(file, nome, (byte) => {
          inviati += byte;
          scrivi(`Caricamento su Google Drive: ${Math.round((inviati / totale) * 100)}%`);
        }),
      );
    }
    scrivi('Scrivo nella tabella…');
    const { data, error } = await actions.revisione.invia({ pagina: nome, indirizzo: location.pathname + location.search, testo: testo.value, caricamenti });
    if (error) throw new Fallito(error);
    form.reset();
    scelti = [];
    mostraFile();
    scrivi(`Inviato: riga ${data.riga} della tabella.`, 'ok');
  } catch (errore) {
    const e = errore instanceof Fallito ? errore.errore : errore;
    if (isActionError(e) && e.code === 'UNAUTHORIZED') sessioneScaduta();
    else scrivi(errore instanceof Fallito ? errore.message : 'Invio non riuscito: riprova', 'errore');
  } finally {
    invia.disabled = false;
    etichettaInvia();
  }
});
