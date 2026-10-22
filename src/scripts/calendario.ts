/**
 * Calendario /spettacoli-eventi: l'elenco arriva già nell'HTML dal server; qui
 * solo il passaggio alla vista "Calendario" (griglia del mese) disegnata con i
 * dati di #datiCalendario. Ogni evento porta alla sua pagina.
 */

interface EventoCalendario {
  titolo: string;
  url: string;
  data: string; // YYYY-MM-DD
  dataFine: string;
  passato: boolean;
  annullato: boolean;
}

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pad = (n: number) => String(n).padStart(2, '0');
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const sorgente = document.getElementById('datiCalendario');

if (sorgente) {
  // "Oggi" dal server (fuso di Roma), non dall'orologio del visitatore
  const { oggi, eventi } = JSON.parse(sorgente.textContent || '{}') as { oggi: string; eventi: EventoCalendario[] };
  const meseOggi = oggi.slice(0, 7);

  /** Eventi in corso in un giorno (anche quelli su più giorni). */
  const eventiDel = (data: string) => eventi.filter((e) => e.data <= data && data <= (e.dataFine || e.data));

  /** Mesi "YYYY-MM" consecutivi, dal primo all'ultimo con eventi. */
  function elencoMesi(): string[] {
    const da = eventi[0].data.slice(0, 7);
    const a = eventi.reduce((max, e) => ((e.dataFine || e.data) > max ? e.dataFine || e.data : max), '').slice(0, 7);
    const out: string[] = [];
    let [y, m] = da.split('-').map(Number);
    while (`${y}-${pad(m)}` <= a) {
      out.push(`${y}-${pad(m)}`);
      if (++m > 12) [m, y] = [1, y + 1];
    }
    return out;
  }

  const mesi = elencoMesi();
  // Mese corrente se ha senso, altrimenti il primo con eventi futuri, altrimenti l'ultimo
  const corrente = mesi.indexOf(meseOggi);
  const futuro = mesi.findIndex((m) => m >= meseOggi);
  let meseIndex = corrente >= 0 ? corrente : futuro >= 0 ? futuro : mesi.length - 1;

  function renderMese() {
    const [anno, m] = mesi[meseIndex].split('-').map(Number);
    $('meseCorrente').textContent = `${MESI[m - 1]} ${anno}`;

    const inizio = (new Date(anno, m - 1, 1).getDay() + 6) % 7;
    const giorni = new Date(anno, m, 0).getDate();

    let html = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((g) => `<div class="cal-intestazione">${g}</div>`).join('');
    html += '<div class="cal-giorno vuoto" aria-hidden="true"></div>'.repeat(inizio);
    for (let g = 1; g <= giorni; g++) {
      const data = `${anno}-${pad(m)}-${pad(g)}`;
      const evG = eventiDel(data);
      const cls = ['cal-giorno'];
      if (data === oggi) cls.push('oggi');
      else if (data < oggi) cls.push('passato');
      if (evG.length) cls.push('ha-eventi');

      const link = (e: EventoCalendario) =>
        `<a class="cal-evento${e.passato ? ' passato' : ''}${e.annullato ? ' annullato' : ''}" href="${escapeHtml(e.url)}">${escapeHtml(e.titolo)}</a>`;
      html += `<div class="${cls.join(' ')}" ${evG.length ? `data-url="${escapeHtml(evG[0].url)}"` : ''}>
        <span class="cal-numero">${g}</span>
        ${evG.map(link).join('')}
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

  $('vistaSwitch').hidden = false;
  $('vistaSwitch').addEventListener('click', (ev) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button[data-vista]');
    if (b) mostraVista(b.dataset.vista!);
  });
  $('btnMesePrev').addEventListener('click', () => cambiaMese(-1));
  $('btnMeseNext').addEventListener('click', () => cambiaMese(1));

  // Schermi stretti: le celle mostrano solo un punto, il tocco apre il primo evento del giorno
  $('calendarioGrid').addEventListener('click', (ev) => {
    const t = ev.target as Element;
    if (t.closest('a')) return;
    const url = t.closest<HTMLElement>('.cal-giorno.ha-eventi')?.dataset.url;
    if (url) location.href = url;
  });
}
