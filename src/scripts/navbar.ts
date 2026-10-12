/* ========================================
   NAVIGAZIONE: menu a tendina (desktop) e menu mobile
   ======================================== */

/** Deve coincidere con il breakpoint CSS della navbar (Navbar.astro). */
const DESKTOP = window.matchMedia('(min-width: 1201px)');
/** Hover solo su dispositivi con puntatore preciso (mouse/trackpad). */
const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)');
const CHIUSURA_MS = 150;

// --- Menu a tendina (desktop) ---
interface Tendina {
  item: HTMLElement;
  trigger: HTMLElement;
  pannello: HTMLElement;
  timer?: number;
}

const tendine: Tendina[] = [...document.querySelectorAll<HTMLElement>('.nav-item[data-menu]')].flatMap((item) => {
  const trigger = item.querySelector<HTMLElement>('.nav-link');
  const pannello = document.getElementById(`mega-menu-${item.dataset.menu}`);
  return trigger && pannello ? [{ item, trigger, pannello }] : [];
});

function imposta(t: Tendina, aperta: boolean) {
  clearTimeout(t.timer);
  t.pannello.classList.toggle('active', aperta);
  t.pannello.inert = !aperta;
  t.trigger.setAttribute('aria-expanded', String(aperta));
}

function apri(t: Tendina) {
  tendine.forEach((altra) => altra !== t && imposta(altra, false));
  imposta(t, true);
}

const chiudiTutte = () => tendine.forEach((t) => imposta(t, false));
const aperta = (t: Tendina) => t.pannello.classList.contains('active');

for (const t of tendine) {
  imposta(t, false);
  // Le voci con pagina propria (Corsi → /corsi) navigano al clic; le altre aprono la tendina
  const conPagina = t.trigger instanceof HTMLAnchorElement;

  t.item.addEventListener('pointerenter', () => HOVER.matches && apri(t));
  t.item.addEventListener('pointerleave', () => {
    if (!HOVER.matches) return;
    // Breve ritardo: passando dalla voce alla tendina (o uscendo per sbaglio) non si chiude
    t.timer = window.setTimeout(() => imposta(t, false), CHIUSURA_MS);
  });

  t.trigger.addEventListener('click', (e) => {
    if (conPagina) return;
    e.preventDefault();
    aperta(t) ? imposta(t, false) : apri(t);
  });

  t.trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      apri(t);
      t.pannello.querySelector<HTMLElement>('a')?.focus();
    }
  });

  // Chiudi quando il focus esce dalla voce (navigazione da tastiera)
  t.item.addEventListener('focusout', (e) => {
    if (!t.item.contains(e.relatedTarget as Node | null)) imposta(t, false);
  });
}

document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.nav-item')) chiudiTutte();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const t = tendine.find(aperta);
  if (t) {
    imposta(t, false);
    t.trigger.focus();
  }
});

// --- Menu mobile ---
const root = document.documentElement;
const menuBtn = document.getElementById('mobileMenuBtn')!;
const menu = document.getElementById('mobileMenu')!;
const overlay = document.getElementById('mobileOverlay')!;
const chiudiBtn = document.getElementById('mobileMenuClose')!;
const sezioni = [...document.querySelectorAll<HTMLElement>('.mobile-nav-toggle')].map((toggle) => ({
  toggle,
  submenu: document.getElementById(toggle.dataset.target!)!,
}));

function impostaSezione(s: (typeof sezioni)[number], aperta: boolean) {
  s.submenu.classList.toggle('active', aperta);
  s.submenu.inert = !aperta;
  s.toggle.classList.toggle('active', aperta);
  s.toggle.setAttribute('aria-expanded', String(aperta));
}

function impostaMenu(aperto: boolean) {
  menu.classList.toggle('active', aperto);
  overlay.classList.toggle('active', aperto);
  menu.inert = !aperto;
  menu.setAttribute('aria-hidden', String(!aperto));
  menuBtn.setAttribute('aria-expanded', String(aperto));
  root.classList.toggle('menu-aperto', aperto);
  (aperto ? chiudiBtn : menuBtn).focus({ preventScroll: true });
}

menu.inert = true;
sezioni.forEach((s) => impostaSezione(s, false));

menuBtn.addEventListener('click', () => impostaMenu(!menu.classList.contains('active')));
chiudiBtn.addEventListener('click', () => impostaMenu(false));
overlay.addEventListener('click', () => impostaMenu(false));

// Una sola sezione aperta alla volta
for (const s of sezioni) {
  s.toggle.addEventListener('click', () => {
    const apri = !s.submenu.classList.contains('active');
    sezioni.forEach((altra) => impostaSezione(altra, altra === s && apri));
  });
}

menu.addEventListener('click', (e) => {
  if ((e.target as Element).closest('a')) impostaMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('active')) impostaMenu(false);
});

// Passando alla versione desktop chiudi il menu mobile, e viceversa le tendine
DESKTOP.addEventListener('change', (e) => {
  if (e.matches && menu.classList.contains('active')) impostaMenu(false);
  if (!e.matches) chiudiTutte();
});

// --- Header più scuro dopo lo scroll ---
const header = document.querySelector<HTMLElement>('.main-header');
const sentinella = () => header?.classList.toggle('is-scrolled', window.scrollY > 50);
window.addEventListener('scroll', sentinella, { passive: true });
sentinella();

// --- Skip link: porta il focus al contenuto principale ---
document.getElementById('skip-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  const main = document.getElementById('main-content');
  if (!main) return;
  main.setAttribute('tabindex', '-1');
  main.focus();
  main.scrollIntoView({ block: 'start' });
});
