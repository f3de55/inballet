/* Chatbot Bella - Assistente AI InBallet */

type Tipo = 'usr' | 'bot';
interface Messaggio {
  type: Tipo;
  content: string;
  time: string;
}

const STORAGE_KEY = 'inballet_chatbot_session';
const COUNT_KEY = 'inballet_chatbot_count';
const WELCOME = "Ciao! 👋 Sono <b>Bella</b>, l'assistente virtuale di InBallet.<br><br>Chiedimi di <b>corsi</b>, <b>sedi</b>, <b>orari</b> o <b>iscrizioni</b>! 💃";
const MAX_MESSAGGI = 50;

const box = document.getElementById('cb-box')!;
const toggle = document.getElementById('cb-toggle')!;
const msgs = document.getElementById('cb-msgs')!;
const input = document.getElementById('cb-txt') as HTMLInputElement;

let ultimoInvio = 0;
let conteggio = 0;

const ora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function appendMsg(type: Tipo, html: string, time = ora()) {
  const d = document.createElement('div');
  d.className = `cb-m ${type}`;
  d.innerHTML = `<span class="cb-txt">${html}</span><span class="cb-time">${time}</span>`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

// Sessione salvata nel browser (ultimi 100 messaggi)
function loadSession() {
  try {
    conteggio = parseInt(localStorage.getItem(COUNT_KEY) ?? '', 10) || 0;
    const saved: Messaggio[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    saved.forEach((m) => appendMsg(m.type, m.content, m.time));
  } catch (e) {
    console.error('Errore caricamento sessione chatbot:', e);
  }
}

function saveMessage(type: Tipo, content: string) {
  try {
    const messages: Messaggio[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    messages.push({ type, content, time: ora() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    localStorage.setItem(COUNT_KEY, String(conteggio));
  } catch (e) {
    console.error('Errore salvataggio messaggio:', e);
  }
}

function addBot(html: string, skipSave = false) {
  const d = appendMsg('bot', html);
  if (!skipSave) saveMessage('bot', html);
  return d;
}

function addUser(text: string) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  appendMsg('usr', escaped);
  saveMessage('usr', escaped);
}

function toggleChat() {
  const isOpen = box.classList.toggle('open');
  box.setAttribute('aria-hidden', String(!isOpen));
  toggle.setAttribute('aria-pressed', String(isOpen));
  toggle.style.display = isOpen ? 'none' : 'flex';
  if (isOpen) {
    input.focus();
    // Carica sessione o mostra benvenuto
    if (!msgs.children.length) {
      loadSession();
      if (!msgs.children.length) addBot(WELCOME);
    }
  }
}

async function send() {
  const testo = input.value.trim();
  if (!testo) return;
  const now = Date.now();
  if (now - ultimoInvio < 2000) {
    alert('Aspetta 2 secondi tra i messaggi');
    return;
  }
  ultimoInvio = now;
  if (conteggio >= MAX_MESSAGGI) {
    addBot('Hai raggiunto il limite di messaggi. Contattaci: <a href="tel:+393937802996" class="cb-link">+39 393 780 2996</a> 📞');
    return;
  }
  conteggio++;
  addUser(testo);
  input.value = '';
  const loading = addBot('<i>Sto scrivendo...</i>', true);
  loading.classList.add('load');

  try {
    // Client delle Actions scaricato solo al primo messaggio
    const { actions } = await import('astro:actions');
    const { data, error } = await actions.chatbot.invia({ message: testo });
    addBot(data?.response ?? (error ? 'Errore di connessione. Riprova!' : 'Errore'));
  } catch {
    addBot('Errore di connessione. Riprova!');
  } finally {
    loading.remove();
  }
}

toggle.addEventListener('click', toggleChat);
document.getElementById('cb-close')!.addEventListener('click', toggleChat);
document.getElementById('cb-inp')!.addEventListener('submit', (e) => {
  e.preventDefault();
  void send();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && box.classList.contains('open')) toggleChat();
});

// Pulisci sessione (utile da console)
Object.assign(window, {
  cbClearSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNT_KEY);
    conteggio = 0;
    msgs.innerHTML = '';
    addBot(WELCOME);
  },
});
