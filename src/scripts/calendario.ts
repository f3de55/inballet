interface EventoSito {
  id: string;
  slug: string;
  titolo: string;
  data: string;
  dataFine: string;
  passato: boolean;
  inCorso: boolean;
  stato: 'pubblicato' | 'annullato' | 'esaurito';
  etichettaStato: string;
  tipo: string;
  quando: string;
  orario: string;
  luogo: string;
  mappa: string;
  destinatari: string;
  costo: string;
  descrizione: string;
  immagine: string;
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

const { oggi, aperto, eventi } = JSON.parse($('datiEventi').textContent || '{}') as { oggi: string; aperto: string | null; eventi: EventoSito[] };

const dialog = $<HTMLDialogElement>('eventoDialog');
const dialogLocandina = $<HTMLDialogElement>('locandinaDialog');
const dialogGiorno = $<HTMLDialogElement>('giornoDialog');
let eventoCorrente: EventoSito | null = null;
let toccoGiorno: HTMLElement | null = null;
let ritorno: HTMLElement | null = null;

// Mantiene un unico pulsante di condivisione e l'ordine reale di lettura
// e di tabulazione coerente con il layout, anche al cambio di orientamento.
const layoutEventoMobile = window.matchMedia('(max-width: 600px)');
function disponiEvento() {
  const corpo = $('dialogCorpo');
  const barra = dialog.querySelector<HTMLElement>('.dialogo-barra')!;
  const azioni = corpo.querySelector<HTMLElement>('.evento-azioni')!;
  const condividi = $('btnCondividi');
  const testo = $('btnCondividiTesto');
  const locandina = $('dialogLocandinaBtn');
  const attivo = document.activeElement;
  if (layoutEventoMobile.matches) {
    if (condividi.parentElement !== azioni) azioni.append(condividi);
    if (corpo.lastElementChild !== locandina) corpo.append(locandina);
  } else {
    if (condividi.parentElement !== barra) barra.prepend(condividi);
    if (locandina.nextElementSibling !== $('dialogDettagli')) {
      corpo.insertBefore(locandina, $('dialogDettagli'));
    }
  }
  condividi.classList.toggle('btn-icon', !layoutEventoMobile.matches);
  condividi.classList.toggle('evento-azione', layoutEventoMobile.matches);
  testo.classList.toggle('sr-only', !layoutEventoMobile.matches);
  if (dialog.open && (attivo === condividi || attivo === locandina)) {
    (attivo as HTMLElement).focus({ preventScroll: true });
  }
}
disponiEvento();
layoutEventoMobile.addEventListener('change', disponiEvento);

const riga = (label: string, valore: string) => `<div><dt class="titoletto">${label}</dt><dd>${valore}</dd></div>`;

function apriEvento(slug: string) {
  const e = eventi.find((ev) => ev.slug === slug);
  if (!e) return;
  eventoCorrente = e;

  const stato = e.stato !== 'pubblicato' ? e.etichettaStato : e.passato ? 'Evento concluso' : e.inCorso ? 'In corso' : '';
  $('dialogEtichette').innerHTML =
    (e.tipo ? `<span>${escapeHtml(e.tipo)}</span>` : '') +
    (stato ? `<span class="evento-stato${e.stato === 'annullato' ? ' evento-stato--forte' : ''}">${escapeHtml(stato)}</span>` : '');
  $('dialogTitolo').textContent = e.titolo;

  const luogo = escapeHtml(e.luogo);
  const parole = luogo.split(' ');
  const coda = parole.pop();
  const dove = e.mappa
    ? `<a class="evento-mappa" href="${escapeHtml(e.mappa)}" target="_blank" rel="noopener noreferrer" aria-label="${luogo}, indicazioni (si apre in una nuova scheda)">${parole.map((p) => `${p} `).join('')}<span class="link-coda">${coda}<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></span></a>`
    : luogo;
  $('dialogDettagli').innerHTML =
    riga('Quando', escapeHtml(e.quando)) +
    (e.luogo ? riga('Dove', dove) : '') +
    (e.destinatari ? riga('Per chi', escapeHtml(e.destinatari)) : '') +
    (e.costo ? riga('Costo', escapeHtml(e.costo)) : '');
  $('dialogDescrizione').innerHTML = e.descrizione;

  const btnLocandina = $('dialogLocandinaBtn');
  const img = $<HTMLImageElement>('dialogLocandina');
  btnLocandina.hidden = !e.immagine;
  $('dialogCorpo').classList.toggle('con-locandina', !!e.immagine);
  btnLocandina.style.setProperty('--locandina', e.immagine ? `url("${new URL(e.immagine, location.href).href}")` : 'none');
  img.src = e.immagine || 'data:,';
  img.alt = e.immagine ? `Locandina: ${e.titolo}` : '';

  const prenota = $<HTMLAnchorElement>('dialogPrenota');
  prenota.hidden = !e.prenotazione;
  prenota.href = e.prenotazione || '#';
  $('dialogCalendario').hidden = !e.google;
  $<HTMLAnchorElement>('btnGoogle').href = e.google || '#';
  $<HTMLAnchorElement>('btnApple').href = e.ics || '#';
  $('btnCondividiTesto').textContent = 'Condividi';
  $('iconaCondividi').className = 'fas fa-share-alt';

  history.replaceState(null, '', linkEvento(e));
  if (!dialog.open) {
    dialog.showModal();
    dialog.focus();
  }
  dialog.scrollTop = 0;
}

dialog.addEventListener('close', () => {
  eventoCorrente = null;
  ritorno?.focus({ preventScroll: true });
  ritorno = null;
  history.replaceState(null, '', location.pathname);
});

for (const dlg of [dialog, dialogLocandina, dialogGiorno]) {
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
  dialogLocandina.focus();
});

async function condividi() {
  if (!eventoCorrente) return;
  const e = eventoCorrente;
  const url = `${location.origin}${location.pathname}${linkEvento(e)}`;
  if (navigator.share) {
    await navigator.share({ title: e.titolo, text: e.condividi, url }).catch(() => {});
    return;
  }
  const esito = (testo: string, icona: string) => {
    $('btnCondividiTesto').textContent = testo;
    $('iconaCondividi').className = `fas ${icona}`;
  };
  try {
    await navigator.clipboard.writeText(url);
    esito('Link copiato', 'fa-check');
  } catch {
    esito('Copia non riuscita', 'fa-times');
  }
  setTimeout(() => esito('Condividi', 'fa-share-alt'), 2500);
}
$('btnCondividi').addEventListener('click', () => void condividi());

$('calendario').addEventListener('click', (ev) => {
  const t = ev.target as Element;
  const evento = t.closest<HTMLElement>('[data-evento]');
  if (evento) {
    ev.preventDefault();
    return apriEvento(evento.dataset.evento!);
  }
  const tocco = t.closest<HTMLElement>('.cal-tocco');
  if (tocco) mostraGiorno(tocco);
});

const eventiDel = (data: string) => eventi.filter((e) => e.data <= data && data <= (e.dataFine || e.data));

const giornoLungo = (data: string) => {
  const testo = new Date(`${data}T12:00:00Z`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  return testo.charAt(0).toUpperCase() + testo.slice(1);
};

const statoBreve = (e: EventoSito) => (e.stato !== 'pubblicato' ? e.etichettaStato : e.passato ? 'Evento concluso' : e.inCorso ? 'In corso' : '');

function mostraGiorno(tocco: HTMLElement) {
  const data = tocco.dataset.giorno!;
  const delGiorno = eventiDel(data);
  if (delGiorno.length === 1) return apriEvento(delGiorno[0].slug);
  toccoGiorno = tocco;
  $('giornoTitolo').textContent = giornoLungo(data);
  $('giornoIntro').textContent = `${delGiorno.length} eventi: scegli quale vedere.`;
  $('giornoOpzioni').innerHTML = delGiorno
    .map((e) => {
      const dettagli = [statoBreve(e), e.orario, e.luogo].filter(Boolean).map(escapeHtml).join(' · ');
      return `<li><a href="${linkEvento(e)}" class="scelta-opzione" data-evento="${escapeHtml(e.slug)}"><span class="scelta-opzione-testo"><span class="scelta-opzione-nome valore">${escapeHtml(e.titolo)}</span>${dettagli ? `<small class="testo-piccolo">${dettagli}</small>` : ''}</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a></li>`;
    })
    .join('');
  dialogGiorno.showModal();
  dialogGiorno.focus();
  $('giornoOpzioni').querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
}

dialogGiorno.addEventListener('click', (ev) => {
  const opzione = (ev.target as Element).closest<HTMLElement>('[data-evento]');
  if (!opzione) return;
  ev.preventDefault();
  ritorno = toccoGiorno;
  dialogGiorno.close();
  apriEvento(opzione.dataset.evento!);
});

if (aperto) apriEvento(aperto);

if (eventi.length) {
  const meseOggi = oggi.slice(0, 7);

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
  const prossimo = eventi.find((e) => !e.passato)?.data.slice(0, 7);
  const iniziale = mesi.indexOf(prossimo && prossimo > meseOggi ? prossimo : meseOggi);
  let meseIndex = iniziale >= 0 ? iniziale : mesi.length - 1;

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
        `<a class="cal-evento${e.passato ? ' passato' : ''}${e.stato === 'annullato' ? ' annullato' : ''}" href="${linkEvento(e)}" data-evento="${escapeHtml(e.slug)}" title="${escapeHtml(e.titolo)}">${escapeHtml(e.titolo)}</a>`;
      const nome = `${g} ${MESI[m - 1].toLowerCase()}: ${evG.length === 1 ? evG[0].titolo : `${evG.length} eventi`}`;
      html += `<div class="${cls.join(' ')}">
        <span class="cal-numero">${g}</span>
        ${evG.map(link).join('')}
        ${evG.length ? `<span class="cal-punti" aria-hidden="true">${'<span></span>'.repeat(Math.min(evG.length, 3))}</span><button type="button" class="cal-tocco" data-giorno="${data}" aria-label="${escapeHtml(nome)}"></button>` : ''}
      </div>`;
    }
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

  mostraVista('calendario');
  $('vistaSwitch').hidden = false;
  $('vistaSwitch').addEventListener('click', (ev) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button[data-vista]');
    if (b) mostraVista(b.dataset.vista!);
  });
  $('btnMesePrev').addEventListener('click', () => cambiaMese(-1));
  $('btnMeseNext').addEventListener('click', () => cambiaMese(1));
}
