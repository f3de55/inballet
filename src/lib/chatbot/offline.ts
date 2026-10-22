/**
 * Ultima rete di sicurezza: quando nessun fornitore risponde (o il tetto di
 * spesa è raggiunto) Étoile risponde lo stesso, senza AI: i prossimi eventi se
 * la domanda riguarda eventi, altrimenti la domanda
 * frequente più simile, il link al corso citato e i contatti della segreteria.
 */
import { prossimiEventi } from '../eventi';
import { decodeHtml } from '../text';
import { categorieCorsi, faq, scuola } from '../../data/scuola';

const PAROLE_VUOTE = new Set(
  'che chi con come cosa dal dalla dei del della delle degli di dove era fare gli hai hanno il la le lo mi mio mia nel nella non per piu puo qual quale quali quando quanto questo sono sul sulla una uno vorrei voglio sapere avete fate posso info informazioni ciao salve buongiorno buonasera grazie anche ancora'.split(' '),
);

const normalizza = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Radici delle parole significative: le prime 5 lettere bastano per "iscrizione"/"iscriversi". */
const radici = (s: string) => new Set(normalizza(s).split(' ').filter((p) => p.length > 2 && !PAROLE_VUOTE.has(p)).map((p) => p.slice(0, 5)));

const indice = faq.map((f) => ({ ...f, domande: radici(f.domanda), testo: radici(f.risposta) }));
const corsi = categorieCorsi.flatMap((c) => c.corsi).map((c) => ({ ...c, chiave: normalizza(c.nome.replace(/\(.*\)/, '')) }));

const contatti = `chiama la segreteria al ${scuola.telefono}, scrivi su WhatsApp o a ${scuola.email}`;

const dataBreve = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long' });

/** Prossimi 3 eventi del calendario, se la domanda riguarda eventi. */
async function prossimi(testo: string): Promise<string | null> {
  if (!/ (event|spettacol|saggi|stage|workshop|open day|lezion[ei] apert|calendario|gala|rassegn)/.test(testo)) return null;
  const eventi = await prossimiEventi(3);
  if (!eventi.length) return `Al momento non ci sono eventi in programma: trovi il calendario nella pagina /spettacoli-eventi.`;
  const righe = eventi.map(({ evento: e, ts }) => `- ${decodeHtml(e.titolo)}: ${dataBreve.format(ts)}${e.ora ? ` alle ${e.ora}` : ''}${e.luogo ? `, ${decodeHtml(e.luogo)}` : ''}`);
  return `I prossimi eventi in programma:\n${righe.join('\n')}\n\nTutto il calendario è nella pagina /spettacoli-eventi.`;
}

export async function rispostaOffline(domanda: string): Promise<string> {
  const eventi = await prossimi(` ${normalizza(domanda)} `).catch(() => null);
  if (eventi) return `${eventi}\n\nPer altre domande ${contatti}.`;
  const parole = radici(domanda);
  const conta = (insieme: Set<string>) => [...parole].filter((p) => insieme.has(p)).length;
  const migliore = indice
    .map((f) => ({ f, punti: conta(f.domande) * 2 + conta(f.testo) }))
    .sort((a, b) => b.punti - a.punti)[0];

  const testo = ` ${normalizza(domanda)} `;
  const corso = corsi.find((c) => testo.includes(` ${c.chiave} `) || testo.includes(` ${c.chiave.replace(/ /g, '')} `));
  const link = corso ? `\n\nTrovi tutto su ${corso.nome} nella pagina ${corso.url}.` : '';

  if (migliore && migliore.punti >= 3) return `${migliore.f.risposta}${link}\n\nPer altre domande ${contatti}.`;
  return `In questo momento posso darti solo informazioni di base.${link}\n\nPer una risposta precisa ${contatti}.`;
}
