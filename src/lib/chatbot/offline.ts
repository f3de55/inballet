import { prossimiEventi, quando, urlEvento } from '../eventi';
import { categorieCorsi, faq, scuola } from '../../data/scuola';
import { cerca, creaIndice, normalizza, termini } from './ricerca';

const indiceFaq = creaIndice(faq.map((f) => ({ percorso: '', titolo: '', sezione: f.domanda, testo: f.risposta })));
const corsi = categorieCorsi.flatMap((c) => c.corsi).map((c) => ({ ...c, chiave: normalizza(c.nome.replace(/\(.*\)/, '')) }));

const contatti = `chiama la segreteria al ${scuola.telefono}, scrivi su WhatsApp o a ${scuola.email}`;

async function prossimi(testo: string): Promise<string | null> {
  if (!/ (event|spettacol|saggi|stage|workshop|open day|lezion[ei] apert|calendario|gala|rassegn)/.test(testo)) return null;
  const eventi = await prossimiEventi(3);
  if (!eventi.length) return `Al momento non ci sono eventi in programma: trovi il calendario nella pagina /spettacoli-eventi.`;
  const righe = eventi.map(
    (e) => `- ${e.titolo}${e.stato === 'annullato' ? ' (annullato)' : ''}: ${quando(e)}${e.luogo ? `, ${e.luogo}` : ''} (${urlEvento(e)})`,
  );
  return `I prossimi eventi in programma:\n${righe.join('\n')}\n\nTutto il calendario è nella pagina /spettacoli-eventi.`;
}

export async function rispostaOffline(domanda: string): Promise<string> {
  const testo = ` ${normalizza(domanda)} `;
  const eventi = await prossimi(testo).catch(() => null);
  if (eventi) return `${eventi}\n\nPer altre domande ${contatti}.`;

  const corso = corsi.find((c) => testo.includes(` ${c.chiave} `) || testo.includes(` ${c.chiave.replace(/ /g, '')} `));
  const link = corso ? `\n\nTrovi tutto su ${corso.nome} nella pagina ${corso.url}.` : '';

  const [migliore] = cerca(indiceFaq, [{ testo: domanda, peso: 1 }], { massimo: 1 });
  const necessari = Math.min(2, new Set(termini(domanda)).size);
  if (migliore && necessari && migliore.comuni >= necessari) return `${migliore.testo}${link}\n\nPer altre domande ${contatti}.`;
  return `In questo momento posso darti solo informazioni di base.${link}\n\nPer una risposta precisa ${contatti}.`;
}
