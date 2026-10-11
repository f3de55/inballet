/* Contatti: orari di apertura e stato aperto/chiuso da Google Places */
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

async function initOrari() {
  if (!grid || !statusEl) return;
  try {
    await loadGoogleMaps();
    const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
    const place = new Place({ id: PUBLIC_GOOGLE_PLACE_ID, requestedLanguage: 'it' });
    await place.fetchFields({ fields: ['regularOpeningHours'] });
    const hours = place.regularOpeningHours;
    if (!hours?.weekdayDescriptions) return;

    // Aperto ora?
    const now = new Date();
    const day = now.getDay();
    const time = now.getHours() * 100 + now.getMinutes();
    const isOpen = hours.periods.some((p) => {
      if (p.open.day !== day) return false;
      const open = p.open.hour * 100 + (p.open.minute || 0);
      const close = p.close ? p.close.hour * 100 + (p.close.minute || 0) : 2359;
      return time >= open && time <= close;
    });
    statusEl.innerHTML = `<i class="fas fa-circle"></i> ${isOpen ? 'Aperto ora' : 'Chiuso ora'}`;
    statusEl.className = `orari-status ${isOpen ? 'aperto' : 'chiuso'}`;

    // Griglia orari, da lunedì, con evidenziato il giorno corrente
    const oggi = ORDINE[day === 0 ? 6 : day - 1];
    const items = hours.weekdayDescriptions
      .map((text) => {
        const [nome, orario = 'Chiuso'] = text.split(': ');
        const giorno = GIORNI[nome.toLowerCase()] ?? nome;
        return { giorno, orario, ordine: ORDINE.indexOf(giorno) };
      })
      .sort((a, b) => a.ordine - b.ordine);

    grid.replaceChildren(
      ...items.map(({ giorno, orario }) => {
        const card = document.createElement('div');
        card.className = `orario-item${giorno === oggi ? ' oggi' : ''}`;
        const chiuso = /closed|chiuso/i.test(orario);
        const d = Object.assign(document.createElement('div'), { className: 'orario-day', textContent: giorno });
        const t = Object.assign(document.createElement('div'), { className: chiuso ? 'orario-time chiuso' : 'orario-time', textContent: orario });
        card.append(d, t);
        return card;
      }),
    );
  } catch (error) {
    console.error('Errore nel caricamento degli orari:', error);
    grid.innerHTML = '<div class="orario-item"><div class="orario-day">Errore</div><div class="orario-time">Contattaci</div></div>';
  }
}

if (grid) whenNear(grid, () => void initOrari());
