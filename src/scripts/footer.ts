/* ========================================
   FOOTER (anno corrente)
   ======================================== */
// La pagina è statica: aggiorna l'anno se il build è di un anno precedente
const year = document.getElementById('footerYear');
if (year) year.textContent = String(new Date().getFullYear());
