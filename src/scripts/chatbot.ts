/* Chat con Étoile, l'assistente virtuale di InBallet */

export {}; // modulo: nomi non condivisi con gli altri script

type Tipo = 'usr' | 'bot';
interface Messaggio {
  type: Tipo;
  content: string;
  time: string;
}

const STORAGE_KEY = 'inballet_chatbot_session';
/** ID della conversazione sul server: la memoria della chat sta lì, qui solo i messaggi da mostrare */
const CONV_KEY = 'inballet_chatbot_conv';
const WELCOME = "Ciao! Sono <b>Étoile</b>, l'assistente di InBallet. Posso aiutarti con corsi, sedi, orari e iscrizioni: cosa vorresti sapere?";
const PAUSA_MIN = 2000; // ms tra un messaggio e l'altro (i limiti veri li applica il server)

const box = document.getElementById('cb-box')!;
const toggle = document.getElementById('cb-toggle')!;
const msgs = document.getElementById('cb-msgs')!;
const form = document.getElementById('cb-inp') as HTMLFormElement;
const input = document.getElementById('cb-txt') as HTMLInputElement;
const invia = document.getElementById('cb-send') as HTMLButtonElement;
const suggerimenti = document.getElementById('cb-suggerimenti')!;
const mobile = matchMedia('(max-width: 600px)');

let ultimoInvio = 0;
let inAttesa = false;
let caricata = false;

const leggi = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const scrivi = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {}
};

const ora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const inFondo = () => msgs.scrollTo({ top: msgs.scrollHeight });

function appendMsg(type: Tipo, html: string, time = ora()) {
  const d = document.createElement('div');
  d.className = `cb-m ${type}`;
  d.innerHTML = `<span class="cb-txt">${html}</span><span class="cb-time">${time}</span>`;
  msgs.appendChild(d);
  inFondo();
  return d;
}

/** Domande suggerite: solo finché la conversazione non è iniziata. */
function aggiornaSuggerimenti() {
  suggerimenti.hidden = msgs.querySelectorAll('.cb-m.usr').length > 0;
}

// Conversazione salvata nel browser (ultimi 100 messaggi)
function loadSession() {
  try {
    const saved: Messaggio[] = JSON.parse(leggi(STORAGE_KEY) ?? '[]');
    saved.forEach((m) => appendMsg(m.type, m.content, m.time));
  } catch (e) {
    console.error('Errore caricamento sessione chatbot:', e);
  }
  // Contatore della versione precedente (bloccava la chat dopo 50 messaggi)
  scrivi('inballet_chatbot_count', null);
}

function saveMessage(type: Tipo, content: string) {
  try {
    const messages: Messaggio[] = JSON.parse(leggi(STORAGE_KEY) ?? '[]');
    messages.push({ type, content, time: ora() });
    scrivi(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
  } catch (e) {
    console.error('Errore salvataggio messaggio:', e);
  }
}

function addBot(html: string) {
  saveMessage('bot', html);
  return appendMsg('bot', html);
}

function addUser(text: string) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  appendMsg('usr', escaped);
  saveMessage('usr', escaped);
}

/** Risposta in preparazione: tre puntini. */
function addAttesa() {
  const d = document.createElement('div');
  d.className = 'cb-m bot load';
  d.setAttribute('aria-label', 'Étoile sta scrivendo');
  d.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(d);
  inFondo();
  return d;
}

// === APERTURA E CHIUSURA ===

/** Su telefono la chat segue l'area visibile: la tastiera non copre il campo di scrittura. */
function adattaAllaTastiera() {
  const vv = window.visualViewport;
  if (!vv || !mobile.matches || box.hidden) {
    box.style.height = '';
    box.style.top = '';
    return;
  }
  box.style.height = `${vv.height}px`;
  box.style.top = `${vv.offsetTop}px`;
  inFondo();
}
window.visualViewport?.addEventListener('resize', adattaAllaTastiera);
window.visualViewport?.addEventListener('scroll', adattaAllaTastiera);

function apri() {
  box.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  document.documentElement.classList.add('cb-aperto');
  if (!caricata) {
    caricata = true;
    loadSession();
    if (!msgs.children.length) addBot(WELCOME);
  }
  aggiornaSuggerimenti();
  inFondo();
  adattaAllaTastiera();
  // Su telefono la tastiera aspetta che si tocchi il campo (prima si vedono le domande suggerite)
  if (!mobile.matches) input.focus();
  else box.focus();
}

function chiudi() {
  box.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  document.documentElement.classList.remove('cb-aperto');
  adattaAllaTastiera();
  toggle.focus();
}

function nuovaConversazione() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  msgs.replaceChildren();
  addBot(WELCOME);
  aggiornaSuggerimenti();
  if (!mobile.matches) input.focus();
}

// === INVIO ===

async function send(testo = input.value.trim()) {
  if (!testo || inAttesa) return;
  // Troppo veloce: il testo resta nel campo, si riprova tra poco
  if (Date.now() - ultimoInvio < PAUSA_MIN) return;
  ultimoInvio = Date.now();

  if (conteggio >= MAX_MESSAGGI) {
    const tel = box.dataset.tel!;
    addBot(`Hai raggiunto il limite di messaggi per oggi. Per altre domande chiamaci al <a href="${box.dataset.telHref}" class="cb-link">${tel}</a>.`);
    return;
  }
  conteggio++;
  addUser(testo);
  input.value = '';
  aggiornaSuggerimenti();

  inAttesa = true;
  invia.disabled = true;
  const attesa = addAttesa();
  try {
    // Client delle Actions scaricato solo al primo messaggio
    const { actions } = await import('astro:actions');
    const { data, error } = await actions.chatbot.invia({ message: testo });
    attesa.remove();
    addBot(data?.response ?? (error ? 'Non riesco a rispondere in questo momento. Riprova tra poco!' : 'Non ho capito, puoi riformulare?'));
  } catch {
    attesa.remove();
    addBot('Problema di connessione. Controlla la rete e riprova.');
  } finally {
    inAttesa = false;
    invia.disabled = false;
  }
}

toggle.addEventListener('click', apri);
document.getElementById('cb-close')!.addEventListener('click', chiudi);
document.getElementById('cb-reset')!.addEventListener('click', nuovaConversazione);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  void send();
});
suggerimenti.addEventListener('click', (e) => {
  const chip = (e.target as Element).closest<HTMLButtonElement>('.cb-chip');
  if (chip) void send(chip.textContent!.trim());
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !box.hidden) chiudi();
});

// Pulisci conversazione e contatore (utile da console)
Object.assign(window, {
  cbClearSession() {
    try {
      localStorage.removeItem(COUNT_KEY);
    } catch {}
    conteggio = 0;
    nuovaConversazione();
  },
});
