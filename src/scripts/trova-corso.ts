/** Il selettore naviga alle sezioni esistenti: non filtra o nasconde i corsi. */
export {};

const apri = document.getElementById('trova-apri');
const scelta = document.getElementById('trova-scelta');
const percorso = document.getElementById('trova-percorso');
const popup = document.getElementById('trova-popup') as HTMLDialogElement | null;

if (apri && scelta && percorso && popup) {
  const opzioni = [...popup.querySelectorAll<HTMLAnchorElement>('.trova-opzione')];

  const seleziona = (opzione?: HTMLAnchorElement) => {
    percorso.textContent = opzione?.dataset.percorso || 'Scegli un percorso';
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
    // Il clic sul backdrop chiude; il padding interno del dialogo resta cliccabile.
    if (event.target !== popup) return;
    const area = popup.getBoundingClientRect();
    if (event.clientX < area.left || event.clientX > area.right || event.clientY < area.top || event.clientY > area.bottom) popup.close();
  });

  for (const opzione of opzioni) {
    opzione.addEventListener('click', (event) => {
      // Mantiene il comportamento dei link per chi apre in un'altra scheda.
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      seleziona(opzione);
      popup.close();

      // Dopo il salto il focus segue il percorso, anche navigando da tastiera.
      const titolo = document.getElementById(opzione.hash.slice(1))?.querySelector('h2');
      if (titolo) requestAnimationFrame(() => {
        const avevaTabindex = titolo.hasAttribute('tabindex');
        if (!avevaTabindex) titolo.setAttribute('tabindex', '-1');
        titolo.focus({ preventScroll: true });
        if (!avevaTabindex) titolo.addEventListener('blur', () => titolo.removeAttribute('tabindex'), { once: true });
      });
    });
  }
}
