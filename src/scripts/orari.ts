const minuti = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

customElements.define(
  'orari-segreteria',
  class extends HTMLElement {
    connectedCallback() {
      const giorni = [...this.querySelectorAll<HTMLElement>('.orario-item')];
      const stato = this.querySelector<HTMLElement>('.orari-status');
      if (giorni.length !== 7 || !stato) return;
      const parti = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
          .formatToParts(new Date())
          .map((p) => [p.type, p.value]),
      );
      const oggi = giorni[(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parti.weekday) + 6) % 7];
      const adesso = Number(parti.hour) * 60 + Number(parti.minute);
      oggi.classList.add('oggi');
      const aperto = (oggi.dataset.fasce ?? '')
        .split(' ')
        .filter(Boolean)
        .some((fascia) => {
          const [apre, chiude] = fascia.split('-').map(minuti);
          return adesso >= apre && adesso < chiude;
        });
      stato.innerHTML = `<i class="fas fa-circle" aria-hidden="true"></i> ${aperto ? 'Aperto ora' : 'Chiuso ora'}`;
      stato.className = `orari-status ${aperto ? 'aperto' : 'chiuso'}`;
    }
  },
);
