/**
 * Calendario /spettacoli-eventi: vista mese e settimana, modale evento con
 * locandina, aggiunta a Google/Apple Calendar e condivisione.
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
const GIORNI_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

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
const tronca = (s: string, n: number) => (s.length > n ? s.substring(0, n) + '...' : s);
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const oggi = isoLocale(new Date());
let eventi: Evento[] = [];
let mesiConEventi: string[] = []; // "YYYY-MM" ordinati
let meseIndex = 0;
let vista: 'mese' | 'settimana' = 'mese';
let eventoCorrente: Evento | null = null;

const eventiDel = (data: string) => eventi.filter((e) => e.data === data);

// === INIZIALIZZAZIONE ===

async function init() {
  const { data } = await actions.eventi.pubblici();
  eventi = data?.eventi ?? [];

  if (!eventi.length) {
    $('noEventiMsg').style.display = 'block';
    $('calendarioContent').style.display = 'none';
    return;
  }
  $('noEventiMsg').style.display = 'none';
  $('calendarioContent').style.display = 'block';

  mesiConEventi = [...new Set(eventi.map((e) => e.data.slice(0, 7)))].sort();
  // Primo mese con eventi futuri, altrimenti il primo disponibile
  const meseCorrente = oggi.slice(0, 7);
  meseIndex = Math.max(0, mesiConEventi.findIndex((m) => m >= meseCorrente));

  render();

  // Apertura diretta di un evento (link dal banner: ?evento=ID)
  const eventoId = new URLSearchParams(location.search).get('evento');
  if (eventoId) setTimeout(() => apriModal(eventoId), 300);
}

function meseAnno() {
  const [anno, mese] = mesiConEventi[meseIndex].split('-').map(Number);
  return { anno, mese: mese - 1 };
}

function render() {
  if (vista === 'mese') renderMese();
  else renderSettimana();
}

function updateNavButtons() {
  const [prev, next] = vista === 'mese' ? ['btnMesePrev', 'btnMeseNext'] : ['btnSettPrev', 'btnSettNext'];
  $(prev).classList.toggle('hidden', meseIndex <= 0);
  $(next).classList.toggle('hidden', meseIndex >= mesiConEventi.length - 1);
}

function cambiaMese(dir: number) {
  const nuovo = meseIndex + dir;
  if (nuovo < 0 || nuovo >= mesiConEventi.length) return;
  meseIndex = nuovo;
  render();
}

// === RENDER ===

function eventoMini(e: Evento, max: number) {
  // Tronca il testo (non le entità HTML con cui il titolo è salvato)
  const titolo = escapeHtml(tronca(testo(e.titolo), max));
  return `<div class="evento-mini${e.data < oggi ? ' passato' : ''}" data-evento="${e.id}">${titolo}</div>`;
}

function renderMese() {
  const { anno, mese } = meseAnno();
  $('meseCorrente').textContent = `${MESI[mese]} ${anno}`;

  const inizio = (new Date(anno, mese, 1).getDay() + 6) % 7;
  const giorni = new Date(anno, mese + 1, 0).getDate();

  let html = GIORNI_SHORT.map((g) => `<div class="giorno-header">${g}</div>`).join('');
  html += '<div class="giorno-cella vuoto"></div>'.repeat(inizio);
  for (let g = 1; g <= giorni; g++) {
    const data = `${anno}-${pad(mese + 1)}-${pad(g)}`;
    const evG = eventiDel(data);
    const cls = ['giorno-cella'];
    if (data === oggi) cls.push('oggi');
    else if (data < oggi) cls.push('passato');
    if (new Date(anno, mese, g).getDay() === 0) cls.push('domenica');
    if (evG.length) cls.push('ha-eventi');

    html += `<div class="${cls.join(' ')}" data-giorno="${data}"><div class="giorno-numero">${g}</div>`;
    html += evG.slice(0, 2).map((e) => eventoMini(e, 10)).join('');
    if (evG.length > 2) {
      const n = evG.length - 2;
      html += `<div class="piu-eventi" data-giorno="${data}">+${n} ${n === 1 ? 'altro' : 'altri'}</div>`;
    }
    html += '</div>';
  }
  $('calendarioGrid').innerHTML = html;
  updateNavButtons();
}

function renderSettimana() {
  const { anno, mese } = meseAnno();
  const eventiMese = eventi.filter((e) => e.data.startsWith(`${anno}-${pad(mese + 1)}`));

  if (!eventiMese.length) {
    $('rangeSettimana').textContent = `${MESI[mese]} ${anno} - Nessun evento`;
    $('settimanaGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun evento in questo mese</div>';
    updateNavButtons();
    return;
  }

  // Lunedì delle settimane che contengono eventi del mese
  const lunedi = [
    ...new Set(
      eventiMese.map((e) => {
        const d = parseData(e.data);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return isoLocale(d);
      }),
    ),
  ].sort();

  $('rangeSettimana').textContent = `${MESI[mese]} ${anno}`;
  $('settimanaHeaders').innerHTML = GIORNI_SHORT.map((g) => `<div class="settimana-header-giorno">${g}</div>`).join('');

  let html = '';
  for (const key of lunedi) {
    const inizio = parseData(key);
    for (let i = 0; i < 7; i++) {
      const d = new Date(inizio.getFullYear(), inizio.getMonth(), inizio.getDate() + i);
      const data = isoLocale(d);
      const evG = eventiDel(data);
      const cls = ['settimana-giorno'];
      if (data === oggi) cls.push('oggi');
      else if (data < oggi) cls.push('passato');
      if (evG.length) cls.push('ha-eventi');

      html += `<div class="${cls.join(' ')}" data-giorno="${data}">
                    <div class="settimana-giorno-info">
                        <div class="settimana-nome">${GIORNI_SHORT[i]}</div>
                        <div class="settimana-data">${d.getDate()}</div>
                    </div>
                    <div class="settimana-giorno-eventi">`;
      html += evG.slice(0, 2).map((e) => eventoMini(e, 15)).join('');
      if (evG.length > 2) {
        const n = evG.length - 2;
        html += `<div class="piu-eventi-sett" data-giorno="${data}">+${n} ${n === 1 ? 'altro' : 'altri'}</div>`;
      }
      html += '</div></div>';
    }
  }
  $('settimanaGrid').innerHTML = html;
  updateNavButtons();
}

// === MODALI ===

function clickGiorno(data: string) {
  const evG = eventiDel(data);
  if (evG.length === 1) apriModal(evG[0].id);
  else if (evG.length > 1) apriListaModal(data, evG);
}

function apriListaModal(data: string, eventiGiorno: Evento[]) {
  const d = parseData(data);
  $('listaModalTitolo').textContent = `Eventi del ${d.getDate()} ${MESI[d.getMonth()]}`;
  $('listaModalBody').innerHTML = eventiGiorno
    .map(
      (e) => `<div class="lista-evento-item" data-lista-evento="${e.id}">
                <div class="lista-evento-dot${e.data < oggi ? ' passato' : ''}"></div>
                <div class="lista-evento-info">
                    <div class="lista-evento-titolo">${e.titolo}</div>
                    ${e.ora ? `<div class="lista-evento-ora"><i class="fas fa-clock"></i> ${e.ora}</div>` : ''}
                </div>
                <i class="fas fa-chevron-right" style="color:var(--text-light);font-size:.8rem"></i>
            </div>`,
    )
    .join('');
  $('listaModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function chiudiListaModal() {
  $('listaModal').classList.remove('open');
  document.body.style.overflow = '';
}

function infoCard(icon: string, label: string, value: string) {
  return `<div class="modal-info-card">
                <div class="modal-info-icon"><i class="fas ${icon}"></i></div>
                <div class="modal-info-text"><span class="modal-info-label">${label}</span><span class="modal-info-value">${value}</span></div>
            </div>`;
}

function apriModal(id: string) {
  const e = eventi.find((ev) => ev.id === id);
  if (!e) return;
  eventoCorrente = e;
  const d = parseData(e.data);

  let badges = '';
  if (e.tipo) badges += `<span class="modal-tipo-badge"></span>`;
  if (e.data < oggi) badges += '<span class="modal-tipo-badge passato">Evento Passato</span>';
  $('modalBadges').innerHTML = badges;
  if (e.tipo) $('modalBadges').firstElementChild!.textContent = e.tipo;

  $('modalTitolo').textContent = testo(e.titolo);
  $('modalData').textContent = `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}${e.ora ? ' alle ' + e.ora : ''}`;
  $('modalDescrizione').innerHTML = e.descrizione || 'Maggiori informazioni disponibili contattando la segreteria.';

  // Locandina
  const wrap = $('modalLocandinaWrap');
  if (e.immagine) {
    $<HTMLImageElement>('modalLocandina').src = e.immagine;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
  $('modalMainGrid').classList.toggle('no-image', !e.immagine);

  // Info (l'orario è già nella data)
  const info =
    (e.luogo ? infoCard('fa-map-marker-alt', 'Sede', e.luogo) : '') +
    (e.destinatari ? infoCard('fa-users', 'Destinatari', e.destinatari) : '') +
    (e.costo ? infoCard('fa-euro-sign', 'Costo', e.costo) : '');
  $('modalInfoGrid').innerHTML = info;
  $('modalInfoGrid').style.display = info ? 'grid' : 'none';

  $('eventoModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function chiudiModal() {
  $('eventoModal').classList.remove('open');
  document.body.style.overflow = '';
  eventoCorrente = null;
}

function apriLightbox() {
  if (!eventoCorrente?.immagine) return;
  $<HTMLImageElement>('lightboxImg').src = eventoCorrente.immagine;
  $('lightbox').classList.add('open');
}

const chiudiLightbox = () => $('lightbox').classList.remove('open');

// === CALENDARI E CONDIVISIONE ===

/** Inizio/fine per i calendari: evento di 1 ora o giornata intera. */
function intervallo(e: Evento) {
  const giorno = e.data.replace(/-/g, '');
  if (e.ora) {
    const [h, m] = e.ora.split(':');
    return { start: `${giorno}T${pad(+h)}${m}00`, end: `${giorno}T${pad(+h + 1)}${m}00`, allDay: false };
  }
  const domani = parseData(e.data);
  domani.setDate(domani.getDate() + 1);
  return { start: giorno, end: isoLocale(domani).replace(/-/g, ''), allDay: true };
}

function googleCalendarUrl(e: Evento) {
  const { start, end } = intervallo(e);
  const enc = encodeURIComponent;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(testo(e.titolo))}&dates=${start}/${end}&details=${enc(e.descrizione || '')}&location=${enc(testo(e.luogo || ''))}`;
}

function generateICS(e: Evento) {
  const { start, end, allDay } = intervallo(e);
  const now = new Date();
  const stamp = `${isoLocale(now).replace(/-/g, '')}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
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
    `SUMMARY:${testo(e.titolo)}`,
    `DESCRIPTION:${(e.descrizione || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${testo(e.luogo || '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
}

function scaricaICS(e: Evento) {
  const url = URL.createObjectURL(new Blob([generateICS(e)], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${testo(e.titolo).replace(/[^a-zA-Z0-9]/g, '_')}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

async function condividi() {
  if (!eventoCorrente) return;
  const e = eventoCorrente;
  const url = location.href.split('?')[0];
  const txt = `${testo(e.titolo)} - ${e.data}${e.luogo ? ' @ ' + testo(e.luogo) : ''}\n\nInBallet - Scuola di Danza`;
  if (navigator.share) {
    await navigator.share({ title: testo(e.titolo), text: txt, url }).catch(() => {});
  } else {
    await navigator.clipboard.writeText(`${txt}\n${url}`);
    alert('Link copiato negli appunti!');
  }
}

// === EVENTI ===

$('btnMesePrev').addEventListener('click', () => cambiaMese(-1));
$('btnMeseNext').addEventListener('click', () => cambiaMese(1));
$('btnSettPrev').addEventListener('click', () => cambiaMese(-1));
$('btnSettNext').addEventListener('click', () => cambiaMese(1));

document.querySelectorAll<HTMLElement>('.vista-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.vista-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    vista = tab.dataset.vista === 'settimana' ? 'settimana' : 'mese';
    $('vistaMese').classList.toggle('active', vista === 'mese');
    $('vistaSettimana').classList.toggle('active', vista === 'settimana');
    render();
  });
});

// Clic su eventi e giorni (delegato: le celle sono generate dinamicamente)
for (const grid of [$('calendarioGrid'), $('settimanaGrid')]) {
  grid.addEventListener('click', (ev) => {
    const target = ev.target as Element;
    const evento = target.closest<HTMLElement>('[data-evento]');
    if (evento) return apriModal(evento.dataset.evento!);
    const giorno = target.closest<HTMLElement>('[data-giorno]');
    if (giorno) clickGiorno(giorno.dataset.giorno!);
  });
}

$('listaModalBody').addEventListener('click', (ev) => {
  const item = (ev.target as Element).closest<HTMLElement>('[data-lista-evento]');
  if (!item) return;
  chiudiListaModal();
  apriModal(item.dataset.listaEvento!);
});
$('listaModal').addEventListener('click', (ev) => {
  if (ev.target === ev.currentTarget || (ev.target as Element).closest('[data-chiudi-lista]')) chiudiListaModal();
});

$('eventoModal').addEventListener('click', (ev) => {
  if (ev.target === ev.currentTarget || (ev.target as Element).closest('[data-chiudi-evento]')) chiudiModal();
});
$('modalLocandinaWrap').addEventListener('click', (ev) => {
  ev.stopPropagation();
  apriLightbox();
});
$('lightbox').addEventListener('click', (ev) => {
  if (ev.target === ev.currentTarget || (ev.target as Element).closest('[data-chiudi-lightbox]')) chiudiLightbox();
});

$('btnCondividi').addEventListener('click', () => void condividi());
$('btnGoogle').addEventListener('click', () => {
  if (eventoCorrente) window.open(googleCalendarUrl(eventoCorrente), '_blank', 'noopener,noreferrer');
});
$('btnApple').addEventListener('click', () => {
  if (eventoCorrente) scaricaICS(eventoCorrente);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if ($('lightbox').classList.contains('open')) chiudiLightbox();
  else chiudiModal();
});

void init();
