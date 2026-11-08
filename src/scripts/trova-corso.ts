export {};

const apri = document.getElementById('trova-apri');
const scelta = document.getElementById('trova-scelta');
const popup = document.getElementById('trova-popup') as HTMLDialogElement | null;

if (apri && scelta && popup) {
  const opzioni = [...popup.querySelectorAll<HTMLAnchorElement>('.trova-opzione')];

  const seleziona = (opzione?: HTMLAnchorElement) => {
    for (const voce of opzioni) voce.removeAttribute('aria-current');
    opzione?.setAttribute('aria-current', 'location');
  };

  const dalLink = () => seleziona(opzioni.find((opzione) => opzione.hash === location.hash));
  dalLink();
  window.addEventListener('hashchange', dalLink);
  scelta.hidden = false;

  apri.addEventListener('click', () => {
    popup.showModal();
    apri.setAttribute('aria-expanded', 'true');
    (opzioni.find((opzione) => opzione.hasAttribute('aria-current')) || opzioni[0])?.focus({ preventScroll: true });
  });

  popup.addEventListener('close', () => apri.setAttribute('aria-expanded', 'false'));

  popup.addEventListener('click', (event) => {
    if (event.target !== popup) return;
    const area = popup.getBoundingClientRect();
    if (event.clientX < area.left || event.clientX > area.right || event.clientY < area.top || event.clientY > area.bottom) popup.close();
  });

  for (const opzione of opzioni) {
    opzione.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      seleziona(opzione);
      popup.close();

      const titolo = document.getElementById(opzione.hash.slice(1))?.querySelector('h2');
      if (titolo)
        requestAnimationFrame(() => {
          const avevaTabindex = titolo.hasAttribute('tabindex');
          if (!avevaTabindex) titolo.setAttribute('tabindex', '-1');
          titolo.focus({ preventScroll: true });
          if (!avevaTabindex) titolo.addEventListener('blur', () => titolo.removeAttribute('tabindex'), { once: true });
        });
    });
  }
}
