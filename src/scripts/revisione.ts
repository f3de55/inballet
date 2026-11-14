import { actions, isActionError } from 'astro:actions';
import '../styles/components/dialogo.css';
import '../styles/components/revisione.css';
import { COOKIE_REVISIONE, FILE_REVISIONE, MAX_FILE_REVISIONE, MAX_SEZIONE_REVISIONE, MAX_TESTO_REVISIONE } from '../lib/revisione-comune';

const ALTRO = 'altro';
const DURATA_AVVISO = 2200;

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

const sezioniPagina = () =>
  [...document.querySelectorAll<HTMLElement>('main > section')].map(
    (s, i) => `${i + 1}. ${s.querySelector('h1, h2')?.textContent?.replace(/\s+/g, ' ').trim() || 'Sezione senza titolo'}`,
  );

const campo = (etichetta: string, controllo: HTMLElement) => {
  const div = crea('div', { class: 'revisione-campo' });
  div.append(crea('label', { for: controllo.id }, etichetta), controllo);
  return div;
};

function dove(prefisso: string, etichetta: string, esempio: string) {
  const sezione = crea('select', { id: `${prefisso}-sezione` });
  const punto = crea('input', {
    type: 'text',
    id: `${prefisso}-punto`,
    maxlength: '200',
    autocomplete: 'off',
    placeholder: esempio,
  });
  const riempi = () => {
    sezione.replaceChildren(
      crea('option', { value: '' }, 'Scegli la sezione'),
      ...sezioniPagina().map((s) => crea('option', { value: s }, s)),
      crea('option', { value: 'Nuova sezione' }, 'Nuova sezione'),
      crea('option', { value: ALTRO }, 'Altro punto (scrivilo sotto)'),
    );
  };
  const valore = () => {
    const scelta = sezione.value === ALTRO ? '' : sezione.value;
    return [scelta, punto.value.trim()].filter(Boolean).join(' — ').slice(0, MAX_SEZIONE_REVISIONE);
  };
  const manca = () => !sezione.value || (sezione.value === ALTRO && !punto.value.trim());
  const blocco = crea('div', { class: 'revisione-dove' });
  blocco.append(campo(etichetta, sezione), campo('Punto preciso (facoltativo)', punto));
  return { blocco, sezione, punto, riempi, valore, manca };
}

const cornice = crea('div', { class: 'revisione-cornice', 'aria-hidden': 'true' });
const apri = crea('button', { type: 'button', class: 'btn-primary revisione-apri' });
apri.append(icona('fa-pen'), 'Proponi un testo');
const avviso = crea('div', { class: 'revisione-avviso', role: 'status' });

const dialog = crea('dialog', { class: 'dialogo revisione-dialog', tabindex: '-1', 'aria-labelledby': 'revisione-titolo' });
const barra = crea('div', { class: 'dialogo-barra' });
const chiudi = crea('button', { type: 'button', class: 'btn-icon btn-icon--chiudi', 'aria-label': 'Chiudi' });
chiudi.append(icona('fa-times'));
barra.append(chiudi);

const form = crea('form', { class: 'dialogo-corpo revisione-corpo', novalidate: '' });
const testata = crea('div', { class: 'revisione-testata' });
const etichettaPagina = crea('p', { class: 'eyebrow' });
testata.append(etichettaPagina, crea('h2', { id: 'revisione-titolo' }, 'Proponi un testo'));

const testo = crea('textarea', { id: 'revisione-testo', rows: '8', maxlength: String(MAX_TESTO_REVISIONE) });
const doveTesto = dove('revisione-testo', 'In che sezione va inserito', 'Es. dopo il secondo paragrafo');
const gruppoTesto = crea('fieldset', { class: 'revisione-gruppo' });
gruppoTesto.append(crea('legend', { class: 'titoletto' }, 'Testo'), campo('Nuovo testo', testo), doveTesto.blocco);

const input = crea('input', { type: 'file', id: 'revisione-file', accept: FILE_REVISIONE, multiple: '' });
const elenco = crea('ul', { class: 'revisione-elenco', 'aria-label': 'File scelti' });
const doveFile = dove('revisione-file', 'Dove va inserito', 'Es. al posto della foto grande');
const campoFile = campo('Scegli i file', input);
campoFile.append(elenco, crea('small', { class: 'testo-piccolo' }, 'Più file insieme, fino a 50 MB ciascuno.'));
const gruppoFile = crea('fieldset', { class: 'revisione-gruppo' });
gruppoFile.append(crea('legend', { class: 'titoletto' }, 'Immagini o video'), doveFile.blocco, campoFile);

const gruppi = crea('div', { class: 'revisione-gruppi' });
gruppi.append(gruppoTesto, gruppoFile);

const esito = crea('p', { class: 'revisione-esito', role: 'alert' });
const invia = crea('button', { type: 'submit', class: 'btn-primary' });
const etichettaInvia = () => invia.replaceChildren('Invia', icona('fa-arrow-right'));
etichettaInvia();

form.append(testata, gruppi, esito, invia);
dialog.append(barra, form);
document.body.append(cornice, apri, avviso, dialog);

let scelti: File[] = [];
let timerAvviso = 0;

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

const errore = (messaggio: string | (string | Node)[], campo?: HTMLElement) => {
  esito.replaceChildren(...(typeof messaggio === 'string' ? (messaggio ? [messaggio] : []) : messaggio));
  campo?.focus();
};

const mostraAvviso = (messaggio: string) => {
  avviso.replaceChildren(icona('fa-check-circle'), messaggio);
  avviso.classList.add('visibile');
  clearTimeout(timerAvviso);
  timerAvviso = window.setTimeout(() => avviso.classList.remove('visibile'), DURATA_AVVISO);
};

const inviato = (conTesto: boolean, immagini: number, video: number) => {
  const parti = [...(conTesto ? ['testo'] : []), ...(immagini ? [immagini > 1 ? 'immagini' : 'immagine'] : []), ...(video ? ['video'] : [])];
  const participio = parti.length > 1 ? 'inviati' : immagini > 1 ? 'inviate' : immagini ? 'inviata' : video > 1 ? 'inviati' : 'inviato';
  const frase = parti.length > 1 ? `${parti.slice(0, -1).join(', ')} e ${parti.at(-1)}` : parti[0];
  return `${frase.charAt(0).toUpperCase()}${frase.slice(1)} ${participio}`;
};

const sessioneScaduta = () => {
  document.cookie = `${COOKIE_REVISIONE}=; Max-Age=0; path=/`;
  errore(['Sessione scaduta. ', crea('a', { href: `/login?da=${encodeURIComponent(location.pathname + location.search)}` }, 'Accedi di nuovo')]);
};

input.addEventListener('change', () => {
  const nuovi = [...(input.files ?? [])];
  input.value = '';
  const scartati = nuovi.filter((f) => !/^(image|video)\//.test(f.type) || f.size === 0 || f.size > MAX_FILE_REVISIONE);
  scelti = [...scelti, ...nuovi.filter((f) => !scartati.includes(f))];
  mostraFile();
  errore(scartati.length ? `Non aggiunti (solo immagini o video fino a 50 MB): ${scartati.map((f) => f.name).join(', ')}` : '');
});

const mostraDialog = () => {
  etichettaPagina.textContent = `Modalità revisione · ${nomePagina()}`;
  doveTesto.riempi();
  doveFile.riempi();
  errore('');
  dialog.showModal();
  dialog.focus();
};

apri.addEventListener('click', mostraDialog);
if (new URLSearchParams(location.search).get('revisione') === 'apri') mostraDialog();
chiudi.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

class Fallito extends Error {
  constructor(public causa: unknown) {
    super(isActionError(causa) ? causa.message : 'Invio non riuscito: riprova');
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
  const conTesto = Boolean(testo.value.trim());
  if (!conTesto && !scelti.length) return errore('Scrivi un testo o aggiungi un’immagine o un video.', testo);
  if (conTesto && doveTesto.manca())
    return errore('Scegli in che sezione va inserito il testo.', doveTesto.sezione.value ? doveTesto.punto : doveTesto.sezione);
  if (scelti.length && doveFile.manca())
    return errore('Scegli dove vanno inseriti immagini e video.', doveFile.sezione.value ? doveFile.punto : doveFile.sezione);

  const nome = nomePagina();
  const totale = scelti.reduce((n, f) => n + f.size, 0);
  const immagini = scelti.filter((f) => f.type.startsWith('image/')).length;
  const video = scelti.length - immagini;
  let caricati = 0;
  errore('');
  invia.disabled = true;
  invia.replaceChildren('Invio…');
  try {
    const caricamenti: string[] = [];
    for (const file of scelti) {
      caricamenti.push(
        await caricaFile(file, nome, (byte) => {
          caricati += byte;
          invia.replaceChildren(`Caricamento ${Math.round((caricati / totale) * 100)}%`);
        }),
      );
    }
    invia.replaceChildren('Invio…');
    const { error } = await actions.revisione.invia({
      pagina: nome,
      indirizzo: location.pathname + location.search,
      testo: testo.value,
      sezioneTesto: conTesto ? doveTesto.valore() : '',
      sezioneFile: scelti.length ? doveFile.valore() : '',
      caricamenti,
    });
    if (error) throw new Fallito(error);
    form.reset();
    scelti = [];
    mostraFile();
    dialog.close();
    mostraAvviso(inviato(conTesto, immagini, video));
  } catch (err) {
    const causa = err instanceof Fallito ? err.causa : err;
    if (isActionError(causa) && causa.code === 'UNAUTHORIZED') sessioneScaduta();
    else errore(err instanceof Fallito ? err.message : 'Invio non riuscito: riprova');
  } finally {
    invia.disabled = false;
    etichettaInvia();
  }
});
