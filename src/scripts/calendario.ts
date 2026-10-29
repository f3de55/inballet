/**
 * Calendario /spettacoli-eventi: l'elenco arriva già nell'HTML dal server; qui
 * la vista "Calendario" (griglia del mese) e il modale con i dettagli
 * dell'evento, entrambi dai dati di #datiEventi (già pronti da mostrare).
 * Il modale aggiorna l'indirizzo in ?evento=<slug>: il link si può condividere.
 */

interface EventoSito {
  id: string;
  slug: string;
  titolo: string;
  data: string; // YYYY-MM-DD
  dataFine: string;
  passato: boolean;
  stato: 'pubblicato' | 'annullato' | 'esaurito';
  etichettaStato: string;
  tipo: string;
  quando: string;
  luogo: string;
  /** Link Google Maps se il luogo è una sede della scuola */
  mappa: string;
  destinatari: string;
  costo: string;
  descrizione: string; // HTML sanificato dal server (b, i, ul, li, br)
  immagine: string;
  /** Vuoti quando non servono (evento concluso, annullato…) */
  prenotazione: string;
  google: string;
  ics: string;
  condividi: string;
}

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pad = (n: number) => String(n).padStart(2, '0');
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const linkEvento = (e: EventoSito) => `?evento=${encodeURIComponent(e.slug)}`;

// "Oggi" dal server (fuso di Roma), non dall'orologio del visitatore
const { oggi, aperto, eventi } = JSON.parse($('datiEventi').textContent || '{}') as { oggi: string; aperto: string | null; eventi: EventoSito[] };

// === DIALOG EVENTO ===

const dialog = $<HTMLDialogElement>('eventoDialog');
const dialogLocandina = $<HTMLDialogElement>('locandinaDialog');
let eventoCorrente: EventoSito | null = null;

const riga = (label: string, valore: string) => `<div><dt class="titoletto">${label}</dt><dd>${valore}</dd></div>`;

function apriEvento(slug: string) {
  const e = eventi.find((ev) => ev.slug === slug);
  if (!e) return;
  eventoCorrente = e;

  const stato = e.stato !== 'pubblicato' ? e.etichettaStato : e.passato ? 'Evento concluso' : '';
  $('dialogEtichette').innerHTML =
    (e.tipo ? `<span>${escapeHtml(e.tipo)}</span>` : '') +
    (stato ? `<span class="evento-stato${e.stato === 'annullato' ? ' evento-stato--forte' : ''}">${escapeHtml(stato)}</span>` : '');
  $('dialogTitolo').textContent = e.titolo;

  const mappa = e.mappa ? ` <a class="evento-mappa" href="${escapeHtml(e.mappa)}" target="_blank" rel="noopener"><i class="fas fa-location-arrow" aria-hidden="true"></i>Indicazioni</a>` : '';
  $('dialogDettagli').innerHTML =
    riga('Quando', escapeHtml(e.quando)) +
    (e.luogo ? riga('Dove', escapeHtml(e.luogo) + mappa) : '') +
    (e.destinatari ? riga('Per chi', escapeHtml(e.destinatari)) : '') +
    (e.costo ? riga('Costo', escapeHtml(e.costo)) : '');
  $('dialogDescrizione').innerHTML = e.descrizione;

  const btnLocandina = $('dialogLocandinaBtn');
  const img = $<HTMLImageElement>('dialogLocandina');
  btnLocandina.hidden = !e.immagine;
  $('dialogCorpo').classList.toggle('con-locandina', !!e.immagine);
  // Stessa immagine, sfocata, come fondo del riquadro (riempie lo spazio attorno alla locandina).
  // URL assoluto: in una custom property sarebbe risolto rispetto al foglio di stile.
  btnLocandina.style.setProperty('--locandina', e.immagine ? `url("${new URL(e.immagine, location.href).href}")` : 'none');
  img.src = e.immagine || 'data:,';
  img.alt = e.immagine ? `Locandina: ${e.titolo}` : '';

  const prenota = $<HTMLAnchorElement>('dialogPrenota');
  prenota.hidden = !e.prenotazione;
  prenota.href = e.prenotazione || '#';
  // Calendari solo per eventi ancora da fare e non annullati
  $('dialogCalendario').hidden = !e.google;
  $<HTMLAnchorElement>('btnGoogle').href = e.google || '#';
  $<HTMLAnchorElement>('btnApple').href = e.ics || '#';
  $('btnCondividiTesto').textContent = 'Condividi';

  history.replaceState(null, '', linkEvento(e));
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
  img.alt = `Locandina: ${eventoCorrente.titolo}`;
  dialogLocandina.showModal();
});

async function condividi() {
  if (!eventoCorrente) return;
  const e = eventoCorrente;
  const url = `${location.origin}${location.pathname}${linkEvento(e)}`;
  if (navigator.share) {
    await navigator.share({ title: e.titolo, text: e.condividi, url }).catch(() => {});
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
$('btnCondividi').addEventListener('click', () => void condividi());

// Clic su un evento (elenco o griglia): modale invece di ricaricare la pagina
$('calendario').addEventListener('click', (ev) => {
  const t = ev.target as Element;
  const evento = t.closest<HTMLElement>('[data-evento]');
  if (evento) {
    ev.preventDefault();
    return apriEvento(evento.dataset.evento!);
  }
  // Schermi stretti: le celle mostrano solo un punto, il tocco apre il primo evento del giorno
  const giorno = t.closest<HTMLElement>('.cal-giorno.ha-eventi');
  if (giorno?.dataset.primo) apriEvento(giorno.dataset.primo);
});

// Link diretto (banner, condivisioni): ?evento=<slug>, già riconosciuto dal server
if (aperto) apriEvento(aperto);

// === CALENDARIO DEL MESE ===

if (eventi.length) {
  /** Eventi in corso in un giorno (anche quelli su più giorni). */
  const eventiDel = (data: string) => eventi.filter((e) => e.data <= data && data <= (e.dataFine || e.data));
  const meseOggi = oggi.slice(0, 7);

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

  const renderMese = () => {
    const [anno, m] = mesi[meseIndex].split('-').map(Number);
    $('meseCorrente').textContent = `${MESI[m - 1]} ${anno}`;

    const inizio = (new Date(anno, m - 1, 1).getDay() + 6) % 7;
    const giorni = new Date(anno, m, 0).getDate();

    let html = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((g) => `<div class="cal-intestazione titoletto">${g}</div>`).join('');
    html += '<div class="cal-giorno vuoto" aria-hidden="true"></div>'.repeat(inizio);
    for (let g = 1; g <= giorni; g++) {
      const data = `${anno}-${pad(m)}-${pad(g)}`;
      const evG = eventiDel(data);
      const cls = ['cal-giorno'];
      if (data === oggi) cls.push('oggi');
      else if (data < oggi) cls.push('passato');
      if (evG.length) cls.push('ha-eventi');

      const link = (e: EventoSito) =>
        `<a class="cal-evento${e.passato ? ' passato' : ''}${e.stato === 'annullato' ? ' annullato' : ''}" href="${linkEvento(e)}" data-evento="${escapeHtml(e.slug)}">${escapeHtml(e.titolo)}</a>`;
      html += `<div class="${cls.join(' ')}"${evG.length ? ` data-primo="${escapeHtml(evG[0].slug)}"` : ''}>
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
  };

  const cambiaMese = (dir: number) => {
    const nuovo = meseIndex + dir;
    if (nuovo < 0 || nuovo >= mesi.length) return;
    meseIndex = nuovo;
    renderMese();
  };

  const mostraVista = (vista: string) => {
    document.querySelectorAll<HTMLButtonElement>('#vistaSwitch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
    $('vistaElenco').hidden = vista !== 'elenco';
    $('vistaCalendario').hidden = vista !== 'calendario';
    if (vista === 'calendario') renderMese();
  };

  $('vistaSwitch').hidden = false;
  $('vistaSwitch').addEventListener('click', (ev) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button[data-vista]');
    if (b) mostraVista(b.dataset.vista!);
  });
  $('btnMesePrev').addEventListener('click', () => cambiaMese(-1));
  $('btnMeseNext').addEventListener('click', () => cambiaMese(1));
}
