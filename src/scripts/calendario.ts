/**
 * Calendario /spettacoli-eventi: elenco dei prossimi appuntamenti (vista
 * principale) o griglia del mese, dialog con i dettagli dell'evento,
 * aggiunta a Google/Apple Calendar e condivisione.
 * Gli eventi arrivano dall'Action pubblica `eventi.pubblici`.
 */
import { actions } from 'astro:actions';

interface Evento {
  id: string;
  titolo: string; // già con escape HTML (salvato così dalla dashboard)
  data: string; // YYYY-MM-DD
  ora: string;
  tipo: string;
  luogo: string; // già con escape HTML
  descrizione: string; // HTML sanificato (b, i, ul, li)
  immagine: string;
  destinatari: string;
  costo: string;
}

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const GIORNI_BREVI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pad = (n: number) => String(n).padStart(2, '0');
/** Data locale → "YYYY-MM-DD" (senza conversioni UTC). */
const isoLocale = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "YYYY-MM-DD" → Date locale a mezzanotte. */
const parseData = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
/** Testo salvato con escape HTML → testo semplice. */
const testo = (html: string) => new DOMParser().parseFromString(html, 'text/html').documentElement.textContent ?? '';
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
/** Campo salvato con escape → HTML sicuro da inserire. */
const sicuro = (s: string) => escapeHtml(testo(s));

const oggi = isoLocale(new Date());
const domani = isoLocale(new Date(Date.now() + 864e5));
const meseOggi = oggi.slice(0, 7);
let eventi: Evento[] = [];
let mesi: string[] = []; // "YYYY-MM" consecutivi, dal primo all'ultimo mese con eventi
let meseIndex = 0;
let eventoCorrente: Evento | null = null;

const eventiDel = (data: string) => eventi.filter((e) => e.data === data);
const passato = (e: Evento) => e.data < oggi;

// === INIZIALIZZAZIONE ===

async function init() {
  const { data, error } = await actions.eventi.pubblici();
  if (error) {
    $('eventiStato').textContent = 'Non riusciamo a caricare il calendario in questo momento. Riprova tra poco.';
    return;
  }
  eventi = [...(data?.eventi ?? [])].sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora));
  $('eventiStato').hidden = true;

  const prossimi = eventi.filter((e) => !passato(e));
  const passati = eventi.filter(passato).reverse();

  $('eventiVuoto').hidden = prossimi.length > 0;
  if (!eventi.length) return;

  $('vistaSwitch').hidden = false;
  $('vistaElenco').hidden = false;
  $('agendaProssimi').innerHTML = agenda(prossimi);
  if (passati.length) {
    $('agendaPassatiWrap').hidden = false;
    $('passatiConteggio').textContent = `(${passati.length})`;
    $('agendaPassati').innerHTML = agenda(passati);
  }

  mesi = elencoMesi(eventi[0].data.slice(0, 7), eventi[eventi.length - 1].data.slice(0, 7));
  // Mese corrente se ha senso, altrimenti il primo con eventi futuri, altrimenti l'ultimo
  const corrente = mesi.indexOf(meseOggi);
  const futuro = mesi.findIndex((m) => m >= meseOggi);
  meseIndex = corrente >= 0 ? corrente : futuro >= 0 ? futuro : mesi.length - 1;

  // Apertura diretta di un evento (link dal banner o condiviso: ?evento=ID)
  const eventoId = new URLSearchParams(location.search).get('evento');
  if (eventoId) apriEvento(eventoId);
}

function elencoMesi(da: string, a: string) {
  const out: string[] = [];
  let [y, m] = da.split('-').map(Number);
  while (`${y}-${pad(m)}` <= a) {
    out.push(`${y}-${pad(m)}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

// === ELENCO ===

function voce(e: Evento) {
  const d = parseData(e.data);
  const vicino = e.data === oggi ? '<span class="agenda-vicino">Oggi</span>' : e.data === domani ? '<span class="agenda-vicino">Domani</span>' : '';
  const meta = [
    e.ora ? `<span><i class="fas fa-clock" aria-hidden="true"></i>${escapeHtml(e.ora)}</span>` : '',
    e.luogo ? `<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i>${sicuro(e.luogo)}</span>` : '',
  ].join('');
  return `<li data-giorno="${e.data}"${passato(e) ? ' class="passato"' : ''}>
    <a class="agenda-voce" href="?evento=${encodeURIComponent(e.id)}" data-evento="${escapeHtml(e.id)}">
      <span class="agenda-data">
        <span class="agenda-giorno">${d.getDate()}</span>
        <span class="agenda-settimana">${GIORNI_BREVI[d.getDay()]}</span>
      </span>
      <span class="agenda-testo">
        ${e.tipo || vicino ? `<span class="agenda-sopra">${vicino}${e.tipo ? `<span class="agenda-tipo">${sicuro(e.tipo)}</span>` : ''}</span>` : ''}
        <span class="agenda-titolo">${sicuro(e.titolo)}</span>
        ${meta ? `<span class="agenda-meta">${meta}</span>` : ''}
      </span>
      <span class="link-cta agenda-cta" aria-hidden="true">Vedi dettagli <i class="fas fa-arrow-right"></i></span>
    </a>
  </li>`;
}

/** Eventi raggruppati per mese, nell'ordine ricevuto. */
function agenda(lista: Evento[]) {
  const gruppi = new Map<string, Evento[]>();
  for (const e of lista) {
    const k = e.data.slice(0, 7);
    gruppi.set(k, [...(gruppi.get(k) ?? []), e]);
  }
  return [...gruppi]
    .map(([k, ev]) => {
      const [y, m] = k.split('-').map(Number);
      // Un blocco per mese: sfondi alternati rendono riconoscibile dove inizia il mese successivo
      return `<div class="agenda-gruppo"><h3 class="agenda-mese">${MESI[m - 1]} ${y}</h3><ul class="agenda">${ev.map(voce).join('')}</ul></div>`;
    })
    .join('');
}

// === CALENDARIO ===

function renderMese() {
  const [anno, m] = mesi[meseIndex].split('-').map(Number);
  const mese = m - 1;
  $('meseCorrente').textContent = `${MESI[mese]} ${anno}`;

  const inizio = (new Date(anno, mese, 1).getDay() + 6) % 7;
  const giorni = new Date(anno, mese + 1, 0).getDate();

  let html = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((g) => `<div class="cal-intestazione">${g}</div>`).join('');
  html += '<div class="cal-giorno vuoto" aria-hidden="true"></div>'.repeat(inizio);
  for (let g = 1; g <= giorni; g++) {
    const data = `${anno}-${pad(m)}-${pad(g)}`;
    const evG = eventiDel(data);
    const cls = ['cal-giorno'];
    if (data === oggi) cls.push('oggi');
    else if (data < oggi) cls.push('passato');
    if (evG.length) cls.push('ha-eventi');

    html += `<div class="${cls.join(' ')}" data-giorno="${data}">
      <span class="cal-numero">${g}</span>
      ${evG.map((e) => `<button type="button" class="cal-evento${passato(e) ? ' passato' : ''}" data-evento="${escapeHtml(e.id)}">${sicuro(e.titolo)}</button>`).join('')}
      ${evG.length ? '<span class="cal-punti" aria-hidden="true"></span>' : ''}
    </div>`;
  }
  // Completa l'ultima riga
  const resto = (7 - ((inizio + giorni) % 7)) % 7;
  html += '<div class="cal-giorno vuoto" aria-hidden="true"></div>'.repeat(resto);
  $('calendarioGrid').innerHTML = html;

  $<HTMLButtonElement>('btnMesePrev').disabled = meseIndex <= 0;
  $<HTMLButtonElement>('btnMeseNext').disabled = meseIndex >= mesi.length - 1;
}

function cambiaMese(dir: number) {
  const nuovo = meseIndex + dir;
  if (nuovo < 0 || nuovo >= mesi.length) return;
  meseIndex = nuovo;
  renderMese();
}

function mostraVista(vista: string) {
  document.querySelectorAll<HTMLButtonElement>('#vistaSwitch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
  $('vistaElenco').hidden = vista !== 'elenco';
  $('vistaCalendario').hidden = vista !== 'calendario';
  if (vista === 'calendario') renderMese();
}

/** Tocco su un giorno (schermi stretti, dove le celle mostrano solo un punto). */
function apriGiorno(data: string) {
  const [primo] = eventiDel(data);
  if (primo) apriEvento(primo.id);
}

// === DIALOG EVENTO ===

const dialog = $<HTMLDialogElement>('eventoDialog');
const dialogLocandina = $<HTMLDialogElement>('locandinaDialog');

function riga(label: string, valore: string) {
  return `<div><dt>${label}</dt><dd>${valore}</dd></div>`;
}

function apriEvento(id: string) {
  const e = eventi.find((ev) => ev.id === id);
  if (!e) return;
  eventoCorrente = e;
  const d = parseData(e.data);
  const concluso = passato(e);

  $('dialogEtichette').innerHTML =
    (e.tipo ? `<span>${sicuro(e.tipo)}</span>` : '') + (concluso ? '<span class="evento-concluso">Evento concluso</span>' : '');
  $('dialogTitolo').textContent = testo(e.titolo);

  const quando = `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()].toLowerCase()} ${d.getFullYear()}${e.ora ? `, ore ${escapeHtml(e.ora)}` : ''}`;
  $('dialogDettagli').innerHTML =
    riga('Quando', quando) +
    (e.luogo ? riga('Dove', sicuro(e.luogo)) : '') +
    (e.destinatari ? riga('Per chi', sicuro(e.destinatari)) : '') +
    (e.costo ? riga('Costo', sicuro(e.costo)) : '');
  $('dialogDescrizione').innerHTML = e.descrizione || '';

  const img = $<HTMLImageElement>('dialogLocandina');
  const btnLocandina = $('dialogLocandinaBtn');
  btnLocandina.hidden = !e.immagine;
  $('dialogCorpo').classList.toggle('con-locandina', !!e.immagine);
  // Stessa immagine, sfocata, come fondo del riquadro (riempie lo spazio attorno alla locandina).
  // URL assoluto: in una custom property sarebbe risolto rispetto al foglio di stile.
  btnLocandina.style.setProperty('--locandina', e.immagine ? `url("${new URL(e.immagine, location.href).href}")` : 'none');
  img.src = e.immagine || 'data:,';
  img.alt = e.immagine ? `Locandina: ${testo(e.titolo)}` : '';

  // Per un evento concluso non ha senso aggiungerlo al calendario
  $('dialogCalendario').hidden = concluso;
  $('btnCondividiTesto').textContent = 'Condividi';

  history.replaceState(null, '', `?evento=${encodeURIComponent(e.id)}`);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

dialog.addEventListener('close', () => {
  eventoCorrente = null;
  history.replaceState(null, '', location.pathname);
});

// Chiusura: X o clic sullo sfondo (il dialog stesso, fuori dal contenuto)
for (const dlg of [dialog, dialogLocandina]) {
  dlg.addEventListener('click', (ev) => {
    const t = ev.target as Element;
    if (t === dlg || t.closest('[data-chiudi]') || dlg === dialogLocandina) dlg.close();
  });
}

$('dialogLocandinaBtn').addEventListener('click', () => {
  if (!eventoCorrente?.immagine) return;
  const img = $<HTMLImageElement>('locandinaGrande');
  img.src = eventoCorrente.immagine;
  img.alt = `Locandina: ${testo(eventoCorrente.titolo)}`;
  dialogLocandina.showModal();
});

// === CALENDARI E CONDIVISIONE ===

/** Inizio/fine per i calendari: evento di 1 ora o giornata intera. */
function intervallo(e: Evento) {
  const giorno = e.data.replace(/-/g, '');
  const ora = /^(\d{1,2}):(\d{2})/.exec(e.ora);
  if (ora) {
    const inizio = parseData(e.data);
    inizio.setHours(+ora[1], +ora[2]);
    const fine = new Date(inizio.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => `${isoLocale(d).replace(/-/g, '')}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    return { start: fmt(inizio), end: fmt(fine), allDay: false };
  }
  const domani = parseData(e.data);
  domani.setDate(domani.getDate() + 1);
  return { start: giorno, end: isoLocale(domani).replace(/-/g, ''), allDay: true };
}

function googleCalendarUrl(e: Evento) {
  const { start, end } = intervallo(e);
  const enc = encodeURIComponent;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(testo(e.titolo))}&dates=${start}/${end}&details=${enc(testo(e.descrizione || ''))}&location=${enc(testo(e.luogo || ''))}`;
}

/** Testo per un campo iCalendar (RFC 5545). */
const ics = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

function generateICS(e: Evento) {
  const { start, end, allDay } = intervallo(e);
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const tipo = allDay ? ';VALUE=DATE' : '';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InBallet//Eventi//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@inballet.it`,
    `DTSTAMP:${stamp}`,
    `DTSTART${tipo}:${start}`,
    `DTEND${tipo}:${end}`,
    `SUMMARY:${ics(testo(e.titolo))}`,
    `DESCRIPTION:${ics(testo(e.descrizione || ''))}`,
    `LOCATION:${ics(testo(e.luogo || ''))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function scaricaICS(e: Evento) {
  const url = URL.createObjectURL(new Blob([generateICS(e)], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${testo(e.titolo).replace(/[^a-zA-Z0-9]+/g, '_')}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

async function condividi() {
  if (!eventoCorrente) return;
  const e = eventoCorrente;
  const url = `${location.origin}${location.pathname}?evento=${encodeURIComponent(e.id)}`;
  const d = parseData(e.data);
  const txt = `${testo(e.titolo)}, ${d.getDate()} ${MESI[d.getMonth()].toLowerCase()} ${d.getFullYear()}${e.luogo ? ' - ' + testo(e.luogo) : ''}`;
  if (navigator.share) {
    await navigator.share({ title: testo(e.titolo), text: txt, url }).catch(() => {});
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    $('btnCondividiTesto').textContent = 'Link copiato';
  } catch {
    $('btnCondividiTesto').textContent = 'Copia non riuscita';
  }
  setTimeout(() => ($('btnCondividiTesto').textContent = 'Condividi'), 2500);
}

// === EVENTI ===

$('btnMesePrev').addEventListener('click', () => cambiaMese(-1));
$('btnMeseNext').addEventListener('click', () => cambiaMese(1));

$('vistaSwitch').addEventListener('click', (ev) => {
  const b = (ev.target as Element).closest<HTMLButtonElement>('button[data-vista]');
  if (b) mostraVista(b.dataset.vista!);
});

// Clic su eventi e giorni (delegato: il contenuto è generato dinamicamente)
$('calendario').addEventListener('click', (ev) => {
  const t = ev.target as Element;
  const evento = t.closest<HTMLElement>('[data-evento]');
  if (evento) {
    ev.preventDefault();
    return apriEvento(evento.dataset.evento!);
  }
  const giorno = t.closest<HTMLElement>('.cal-giorno.ha-eventi');
  if (giorno) apriGiorno(giorno.dataset.giorno!);
});

$('btnCondividi').addEventListener('click', () => void condividi());
$('btnGoogle').addEventListener('click', () => {
  if (eventoCorrente) window.open(googleCalendarUrl(eventoCorrente), '_blank', 'noopener,noreferrer');
});
$('btnApple').addEventListener('click', () => {
  if (eventoCorrente) scaricaICS(eventoCorrente);
});

void init();
