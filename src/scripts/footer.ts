/* ========================================
   FOOTER (Modale Corsi + anno corrente)
   ======================================== */
const modal = document.getElementById('corsiModal');
const corsiTitle = document.querySelector('.footer-corsi-title');

function toggleCorsiModal() {
  if (!modal) return;
  const open = modal.classList.toggle('open');
  corsiTitle?.classList.toggle('active', open);
  // Blocca lo scroll quando la modale è aperta
  document.body.style.overflow = open ? 'hidden' : '';
}

corsiTitle?.addEventListener('click', toggleCorsiModal);
modal?.querySelector('.corsi-modal-close')?.addEventListener('click', toggleCorsiModal);

// Chiudi cliccando fuori dal contenuto
modal?.addEventListener('click', (e) => {
  if (e.target === modal) toggleCorsiModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) toggleCorsiModal();
});

// Anno corrente (la pagina è statica: aggiorna se il build è di un anno precedente)
const year = document.getElementById('footerYear');
if (year) year.textContent = String(new Date().getFullYear());
