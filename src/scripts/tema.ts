type Tema = 'chiaro' | 'scuro';

const CHIAVE = 'inballet-tema';
const radice = document.documentElement;
const sistema = window.matchMedia('(prefers-color-scheme: dark)');
const movimentoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)');

function scelto(): Tema | null {
  try {
    const tema = localStorage.getItem(CHIAVE);
    return tema === 'scuro' || tema === 'chiaro' ? tema : null;
  } catch {
    return null;
  }
}

function ricorda(tema: Tema) {
  try {
    localStorage.setItem(CHIAVE, tema);
  } catch {}
}

const preferito = (): Tema => scelto() ?? (sistema.matches ? 'scuro' : 'chiaro');

function applica(tema: Tema) {
  const cambiato = radice.dataset.tema !== tema;
  radice.dataset.tema = tema;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = tema === 'scuro' ? getComputedStyle(radice).getPropertyValue('--sfondo').trim() : meta.dataset.chiaro!;
  for (const b of document.querySelectorAll('[data-tema-interruttore]')) b.setAttribute('aria-pressed', String(tema === 'scuro'));
  if (cambiato) document.dispatchEvent(new CustomEvent<Tema>('tema', { detail: tema }));
}

function senzaTransizioni(cambia: () => void) {
  radice.classList.add('tema-cambio');
  cambia();
  void radice.offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => radice.classList.remove('tema-cambio')));
}

function cambia(tema: Tema, origine: HTMLElement) {
  if (!document.startViewTransition || movimentoRidotto.matches || document.visibilityState !== 'visible') return senzaTransizioni(() => applica(tema));
  const r = origine.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  radice.style.setProperty('--tema-x', `${x}px`);
  radice.style.setProperty('--tema-y', `${y}px`);
  radice.style.setProperty('--tema-raggio', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  radice.classList.add('tema-cambio');
  const transizione = document.startViewTransition(() => applica(tema));
  transizione.finished.finally(() => radice.classList.remove('tema-cambio'));
}

document.addEventListener('click', (e) => {
  const interruttore = (e.target as Element).closest<HTMLElement>('[data-tema-interruttore]');
  if (!interruttore) return;
  const tema: Tema = radice.dataset.tema === 'scuro' ? 'chiaro' : 'scuro';
  ricorda(tema);
  cambia(tema, interruttore);
});

sistema.addEventListener('change', () => {
  if (!scelto()) senzaTransizioni(() => applica(preferito()));
});

window.addEventListener('storage', (e) => {
  if (e.key === CHIAVE || e.key === null) senzaTransizioni(() => applica(preferito()));
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) senzaTransizioni(() => applica(preferito()));
});

applica(preferito());
