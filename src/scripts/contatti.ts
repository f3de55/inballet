/* Contatti: orari di apertura e stato aperto/chiuso.
 * La pagina arriva già con gli orari di src/data/scuola.ts; qui si evidenzia il giorno
 * corrente e si calcola lo stato, poi si prova ad aggiornarli da Google Places. */
import { PUBLIC_GOOGLE_PLACE_ID } from 'astro:env/client';
import { loadGoogleMaps, whenNear } from './google-maps';

/** Nome del giorno (inglese o italiano, come restituito da Google) → abbreviazione. */
const GIORNI: Record<string, string> = {
  monday: 'Lun', lunedì: 'Lun',
  tuesday: 'Mar', martedì: 'Mar',
  wednesday: 'Mer', mercoledì: 'Mer',
  thursday: 'Gio', giovedì: 'Gio',
  friday: 'Ven', venerdì: 'Ven',
  saturday: 'Sab', sabato: 'Sab',
  sunday: 'Dom', domenica: 'Dom',
};
const ORDINE = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const grid = document.getElementById('orari-grid');
const statusEl = document.getElementById('open-status');

// Giorno e ora di Roma, non del dispositivo: gli orari sono quelli della segreteria
const parti = Object.fromEntries(
  new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date())
    .map((p) => [p.type, p.value]),
);
const giornoSettimana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parti.weekday);
const oggi = ORDINE[giornoSettimana === 0 ? 6 : giornoSettimana - 1];
const adesso = Number(parti.hour) * 100 + Number(parti.minute);
const hhmm = (s: string) => Number(s.replace(':', ''));

function mostraStato(aperto: boolean) {
  if (!statusEl) return;
  statusEl.innerHTML = `<i class="fas fa-circle" aria-hidden="true"></i> ${aperto ? 'Aperto ora' : 'Chiuso ora'}`;
  statusEl.className = `orari-status ${aperto ? 'aperto' : 'chiuso'}`;
}

/** Orari già nella pagina: giorno corrente evidenziato e stato calcolato dai dati. */
function initStatici() {
  if (!grid) return;
  let aperto = false;
  grid.querySelectorAll<HTMLElement>('.orario-item').forEach((li) => {
    if (li.dataset.giorno !== oggi) return;
    li.classList.add('oggi');
    const { apre, chiude } = li.dataset;
    if (apre && chiude) aperto = adesso >= hhmm(apre) && adesso <= hhmm(chiude);
  });
  mostraStato(aperto);
}

async function initGoogle() {
  if (!grid || !statusEl) return;
  try {
    await loadGoogleMaps();
    const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
    const place = new Place({ id: PUBLIC_GOOGLE_PLACE_ID, requestedLanguage: 'it' });
    await place.fetchFields({ fields: ['regularOpeningHours'] });
    const hours = place.regularOpeningHours;
    if (!hours?.weekdayDescriptions) return;

    // Aperto ora?
    mostraStato(
      hours.periods.some((p) => {
        if (p.open.day !== giornoSettimana) return false;
        const open = p.open.hour * 100 + (p.open.minute || 0);
        const close = p.close ? p.close.hour * 100 + (p.close.minute || 0) : 2359;
        return adesso >= open && adesso <= close;
      }),
    );

    // Griglia orari, da lunedì, con evidenziato il giorno corrente
    const items = hours.weekdayDescriptions
      .map((text) => {
        const [nome, orario = 'Chiuso'] = text.split(': ');
        const giorno = GIORNI[nome.toLowerCase()] ?? nome;
        return { giorno, orario, ordine: ORDINE.indexOf(giorno) };
      })
      .sort((a, b) => a.ordine - b.ordine);

    grid.replaceChildren(
      ...items.map(({ giorno, orario }) => {
        const card = document.createElement('li');
        card.className = `orario-item${giorno === oggi ? ' oggi' : ''}`;
        const chiuso = /closed|chiuso/i.test(orario);
        const d = Object.assign(document.createElement('p'), { className: 'orario-day', textContent: giorno });
        const t = Object.assign(document.createElement('p'), { className: chiuso ? 'orario-time chiuso' : 'orario-time', textContent: orario });
        card.append(d, t);
        return card;
      }),
    );
  } catch (error) {
    // Restano gli orari della pagina
    console.error('Errore nel caricamento degli orari:', error);
  }
}

initStatici();
if (grid) whenNear(grid, () => void initGoogle());
