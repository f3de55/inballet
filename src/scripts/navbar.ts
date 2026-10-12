/* ========================================
   NAVIGATION (MEGA MENU + MOBILE MENU)
   ======================================== */
const MOBILE_BREAKPOINT = 1200;

const setTabindex = (root: ParentNode, selector: string, value: string | null) =>
  root.querySelectorAll(selector).forEach((el) => (value === null ? el.removeAttribute('tabindex') : el.setAttribute('tabindex', value)));

// --- Mega menu (desktop) ---
const navItems = document.querySelectorAll<HTMLElement>('.nav-item[data-menu]');
const megaMenus = document.querySelectorAll<HTMLElement>('.mega-menu');
let currentMenu: HTMLElement | null = null;
let hoverTimeout = 0;

function closeAllMegaMenus() {
  megaMenus.forEach((menu) => {
    menu.classList.remove('active');
    setTabindex(menu, 'a', '-1');
  });
  document.querySelectorAll('.nav-link').forEach((link) => link.setAttribute('aria-expanded', 'false'));
  currentMenu = null;
}

// Link dei mega menu chiusi fuori dalla navigazione da tastiera
megaMenus.forEach((menu) => setTabindex(menu, 'a', '-1'));

navItems.forEach((item) => {
  const megaMenu = document.getElementById(`mega-menu-${item.dataset.menu}`);
  const navLink = item.querySelector<HTMLElement>('.nav-link');
  if (!megaMenu || !navLink) return;

  function openMenu() {
    clearTimeout(hoverTimeout);
    closeAllMegaMenus();
    megaMenu!.classList.add('active');
    navLink!.setAttribute('aria-expanded', 'true');
    setTabindex(megaMenu!, 'a', null);
    currentMenu = megaMenu;
  }
  function closeMenu() {
    megaMenu!.classList.remove('active');
    navLink!.setAttribute('aria-expanded', 'false');
    setTabindex(megaMenu!, 'a', '-1');
    currentMenu = null;
  }
  const toggleMenu = () => (megaMenu.classList.contains('active') ? closeMenu() : openMenu());

  item.addEventListener('mouseenter', openMenu);
  item.addEventListener('mouseleave', () => {
    hoverTimeout = window.setTimeout(() => {
      if (currentMenu && !currentMenu.matches(':hover')) closeMenu();
    }, 100);
  });
  // Una voce con pagina propria (CORSI → /corsi) si apre al clic; il mega menu resta al passaggio del mouse
  const conPagina = navLink instanceof HTMLAnchorElement;
  navLink.addEventListener('click', (e) => {
    if (conPagina) return;
    e.preventDefault();
    toggleMenu();
  });
  navLink.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' && !conPagina) || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
    if (e.key === 'Escape') closeMenu();
  });
});

megaMenus.forEach((menu) => {
  menu.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
  menu.addEventListener('mouseleave', () => {
    menu.classList.remove('active');
    setTabindex(menu, 'a', '-1');
    currentMenu = null;
  });
});

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  if (!target.closest('.nav-item') && !target.closest('.mega-menu')) closeAllMegaMenus();
});

// --- Menu mobile ---
const navMenu = document.querySelector<HTMLElement>('.nav-menu');
const ctaBtn = document.querySelector<HTMLElement>('.cta-btn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn')!;
const mobileMenu = document.getElementById('mobileMenu')!;
const mobileOverlay = document.getElementById('mobileOverlay')!;
const mobileNavToggles = document.querySelectorAll<HTMLElement>('.mobile-nav-toggle');

const HIDDEN = { display: 'none', visibility: 'hidden', opacity: '0', pointerEvents: 'none', position: 'absolute', left: '-9999px' };
const RESET = { display: '', visibility: '', opacity: '', pointerEvents: '', position: '', left: '' };

function forceHideNavElements() {
  const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
  if (navMenu) Object.assign(navMenu.style, mobile ? HIDDEN : RESET);
  if (ctaBtn) Object.assign(ctaBtn.style, mobile ? HIDDEN : RESET);
  mobileMenuBtn.style.display = mobile ? 'block' : 'none';
}
forceHideNavElements();

setTabindex(mobileMenu, 'a, button', '-1');
document.querySelectorAll('.mobile-submenu').forEach((submenu) => setTabindex(submenu, 'a', '-1'));

function openMobileMenu() {
  mobileMenuBtn.style.display = 'none';
  mobileMenu.classList.add('active');
  mobileMenu.setAttribute('aria-hidden', 'false');
  setTabindex(mobileMenu, 'a, button', null);
  mobileOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenuBtn.style.display = 'block';
  mobileMenu.classList.remove('active');
  mobileMenu.setAttribute('aria-hidden', 'true');
  setTabindex(mobileMenu, 'a, button', '-1');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

mobileMenuBtn.addEventListener('click', () => (mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu()));
document.getElementById('mobileMenuClose')!.addEventListener('click', closeMobileMenu);
mobileOverlay.addEventListener('click', closeMobileMenu);

mobileNavToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const submenu = document.getElementById(toggle.dataset.target!)!;
    const isActive = submenu.classList.contains('active');
    mobileNavToggles.forEach((other) => {
      if (other === toggle) return;
      const otherSubmenu = document.getElementById(other.dataset.target!)!;
      otherSubmenu.classList.remove('active');
      setTabindex(otherSubmenu, 'a', '-1');
      other.classList.remove('active');
      other.setAttribute('aria-expanded', 'false');
    });
    submenu.classList.toggle('active');
    setTabindex(submenu, 'a', isActive ? '-1' : null);
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(!isActive));
  });
});
document.querySelectorAll('.mobile-submenu a, .mobile-cta a').forEach((link) => link.addEventListener('click', closeMobileMenu));

let resizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    forceHideNavElements();
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMobileMenu();
      mobileMenuBtn.style.display = 'none';
      closeAllMegaMenus();
    } else if (!mobileMenu.classList.contains('active')) {
      mobileMenuBtn.style.display = 'block';
    }
  });
});

// --- Ancore interne con scroll morbido ---
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const hash = anchor.getAttribute('href')!;
    const target = hash.length > 1 ? document.querySelector(hash) : null;
    e.preventDefault();
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Header più scuro dopo lo scroll ---
const header = document.querySelector<HTMLElement>('.main-header')!;
let scrolled: boolean | null = null;
window.addEventListener(
  'scroll',
  () => {
    const isScrolled = window.scrollY > 50;
    if (isScrolled === scrolled) return;
    scrolled = isScrolled;
    header.style.background = isScrolled ? 'rgba(42, 42, 42, 0.98)' : 'var(--header-dark)';
    header.style.boxShadow = isScrolled ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 20px rgba(0,0,0,0.3)';
  },
  { passive: true },
);

// --- Skip link: porta il focus al contenuto principale ---
document.getElementById('skip-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  const main = document.getElementById('main-content');
  if (!main) return;
  main.setAttribute('tabindex', '-1');
  main.focus();
  main.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
