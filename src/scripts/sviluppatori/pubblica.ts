import { actions } from 'astro:actions';
import { $, chiama, conferma, el, emetti, toast } from './comune';
import { dimenticaFile, ricarica } from './anteprima';
import { dimentica } from './regole';

type Stato = { modalita: string; testa: string; online: string | null; modifiche: { percorso: string; stato: string }[]; font: string };

const lista = $('svModifiche');
const storia = $('svStoria');
const diff = $('svDiff');
const diffNome = $('svDiffNome');
const online = $('svOnline');
const form = $<HTMLFormElement>('svInvia');
const messaggio = $<HTMLInputElement>('svMessaggio');
const bottone = $<HTMLButtonElement>('svPubblica');
const ETICHETTE: Record<string, string> = { modificato: 'Modificato', nuovo: 'Nuovo', eliminato: 'Eliminato' };
let attesa = 0;

async function mostraDiff(percorso: string) {
  const testo = (await chiama(actions.sviluppatori.differenza({ percorso }))) ?? '';
  diffNome.textContent = percorso;
  const codice = el('code');
  for (const r of testo.split('\n')) {
    const tipo =
      r.startsWith('+++') || r.startsWith('---') || r.startsWith('diff') || r.startsWith('index')
        ? 'testa'
        : r[0] === '+'
          ? 'piu'
          : r[0] === '-'
            ? 'meno'
            : r.startsWith('@@')
              ? 'blocco'
              : '';
    codice.append(el('span', { class: tipo ? `sv-diff-${tipo}` : undefined, text: `${r}\n` }));
  }
  diff.replaceChildren(codice);
}

function disegnaModifiche(s: Stato) {
  $('svModo').textContent =
    s.modalita === 'locale'
      ? 'Lavori sul progetto di questo computer: le modifiche sono già nei file. «Pubblica» crea il commit e lo invia a GitHub, poi Railway aggiorna il sito.'
      : 'Lavori su una copia del codice sul server. «Pubblica» crea il commit su GitHub e Railway ricostruisce il sito in circa due minuti.';
  bottone.disabled = !s.modifiche.length;
  if (!s.modifiche.length) {
    lista.replaceChildren(el('li', { class: 'sv-spiega', text: 'Nessuna modifica in sospeso.' }));
    return;
  }
  lista.replaceChildren(
    ...s.modifiche.map((m) => {
      const vedi = el(
        'button',
        { type: 'button', class: 'sv-modifica' },
        el('span', { class: `sv-etichetta sv-etichetta--${m.stato}`, text: ETICHETTE[m.stato] ?? m.stato }),
        el('code', { text: m.percorso }),
      );
      vedi.addEventListener('click', () => void mostraDiff(m.percorso));
      const scarta = el('button', { type: 'button', class: 'btn btn-link btn-link--rosso', text: 'Scarta' });
      scarta.addEventListener('click', async () => {
        if (!(await conferma({ titolo: 'Scartare la modifica?', testo: `${m.percorso} torna com'è sul sito pubblicato.`, ok: 'Scarta', pericolo: true })))
          return;
        if ((await chiama(actions.sviluppatori.scarta({ percorso: m.percorso }), 'Modifica non scartata')) === undefined) return;
        dimenticaFile(m.percorso);
        if (m.percorso.endsWith('.css')) {
          dimentica();
          emetti('stili', '');
        }
        emetti('file-scartato', m.percorso);
        emetti('modificato');
        ricarica();
        void carica();
      });
      return el('li', {}, vedi, scarta);
    }),
  );
}

async function disegnaStoria(s: Stato) {
  const commit = (await chiama(actions.sviluppatori.storia())) ?? [];
  storia.replaceChildren(
    ...commit.map((c, i) => {
      const annulla = el('button', { type: 'button', class: 'btn btn-link', text: 'Annulla questa modifica' });
      annulla.addEventListener('click', async () => {
        if (
          !(await conferma({
            titolo: 'Annullare questa pubblicazione?',
            testo: `«${c.messaggio}»: le sue modifiche vengono tolte e potrai pubblicare il ritorno indietro.`,
            ok: 'Prepara l’annullamento',
          }))
        )
          return;
        if ((await chiama(actions.sviluppatori.annulla({ sha: c.sha }), 'Non annullata')) === undefined) return;
        emetti('modificato');
        toast('Annullamento pronto: controlla e pubblica', 'success');
        void carica();
      });
      const vivo = s.online && c.sha.startsWith(s.online.slice(0, 7));
      return el(
        'li',
        {},
        el(
          'div',
          {},
          el('strong', { text: c.messaggio }),
          el('small', { text: `${new Date(c.data).toLocaleString('it-IT')} · ${c.autore} · ${c.sha.slice(0, 7)}${vivo ? ' · online' : ''}` }),
        ),
        i < 10 ? annulla : null,
      );
    }),
  );
}

export async function carica() {
  const s = (await chiama(actions.sviluppatori.stato())) as Stato | undefined;
  if (!s) return;
  disegnaModifiche(s);
  void disegnaStoria(s);
}

function attendi(sha: string, locale: boolean) {
  clearInterval(attesa);
  if (locale) {
    online.textContent = `Inviato a GitHub (${sha.slice(0, 7)}): Railway pubblica il sito in circa due minuti.`;
    return;
  }
  const inizio = Date.now();
  const controlla = async () => {
    const s = (await chiama(actions.sviluppatori.stato())) as Stato | undefined;
    const secondi = Math.round((Date.now() - inizio) / 1000);
    if (s?.online === sha) {
      clearInterval(attesa);
      online.textContent = `Online da ora (${sha.slice(0, 7)}), dopo ${secondi} secondi.`;
      toast('Il sito è aggiornato', 'success');
      ricarica();
      return;
    }
    online.textContent =
      secondi > 480
        ? `Dopo ${Math.round(secondi / 60)} minuti il sito non è ancora aggiornato: la build potrebbe essere fallita, controlla Railway. Il sito online resta quello di prima.`
        : `Railway sta costruendo il sito… ${secondi} s`;
  };
  attesa = window.setInterval(() => void controlla(), 10_000);
  void controlla();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  bottone.disabled = true;
  online.textContent = 'Controllo e pubblicazione in corso…';
  const s = (await chiama(actions.sviluppatori.stato())) as Stato | undefined;
  const r = await chiama(actions.sviluppatori.pubblica({ messaggio: messaggio.value }), 'Pubblicazione non riuscita');
  if (!r) {
    online.textContent = '';
    bottone.disabled = false;
    return;
  }
  messaggio.value = '';
  diff.replaceChildren(el('code', { text: 'Scegli un file per vedere cosa cambia.' }));
  emetti('modificato');
  attendi(r.sha, s?.modalita === 'locale');
  void carica();
});

export function mostraPubblica() {
  void carica();
}
