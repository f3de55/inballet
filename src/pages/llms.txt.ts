/**
 * llms.txt: riepilogo in Markdown dei fatti chiave della scuola per assistenti
 * e motori di ricerca basati su AI (https://llmstxt.org). Generato dai dati
 * ufficiali in src/data/scuola.ts.
 */
import type { APIRoute } from 'astro';
import { ANNI_ATTIVITA, categorieCorsi, faq, FONDAZIONE, iscrizioni, orari, scuola, sedi } from '../data/scuola';

const strip = (html: string) => html.replace(/<[^>]+>/g, '');

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const md = `# InBallet - Scuola di danza a Lainate e Rho

> ${scuola.nome} (anche "I.N. Ballet") è una scuola di danza multidisciplinare con sede a Lainate e Rho, in provincia di Milano. Fondata nel ${FONDAZIONE} da ${scuola.fondatrice}, da ${ANNI_ATTIVITA} anni propone corsi per bambini dai 3 anni, ragazzi e adulti ed è Ente Formativo riconosciuto CSEN e CONI per la formazione degli insegnanti di danza.

L'inclusione è centrale per tutte le fasce d'età: dal 2013 il [progetto NoiConVoi](${url('/progetto-noiconvoi')}) accoglie ragazzi con disabilità in esperienze di danza con supporto psicomotorio, insieme a un team di volontari. La scuola propone anche formazioni per professionisti dell'ambito educativo e terapeutico.

## Contatti

- Telefono: ${scuola.telefono}
- E-mail: ${scuola.email}
- WhatsApp: ${scuola.whatsapp}
- Instagram: ${scuola.social.instagram}
- Facebook: ${scuola.social.facebook}

## Sedi

${sedi.map((s) => `- ${s.titolo}: ${s.indirizzo}`).join('\n')}

## Orari

${orari.map((o) => `- ${o.etichetta}: ${o.apre}-${o.chiude}`).join('\n')}
- Domenica: chiuso

## Corsi

${categorieCorsi.map((c) => `### ${c.nome}\n\n${strip(c.descrizione)}\n\n${c.corsi.map((k) => `- [${k.nome}](${url(k.url)})`).join('\n')}`).join('\n\n')}

## Formazione

- [Corso di formazione per insegnanti di danza](${url('/formazione-insegnanti')}): percorso biennale riconosciuto CSEN e CONI
- [Formazioni personalizzate](${url('/formazioni-personalizzate')}): workshop e percorsi su misura per insegnanti, scuole ed enti

## Iscrizioni ${iscrizioni.anno}

- [Documenti per l'iscrizione](${url('/documenti')}): quota associativa annuale ${iscrizioni.quota} €, certificato medico per attività non agonistica dai 6 anni (sotto i 6 anni autocertificazione dei genitori), corso pagato in tre rate.
${iscrizioni.documenti.map((d) => `- [${d.titolo}](${url(d.file)}): ${d.nota.toLowerCase()}`).join('\n')}

## Pagine principali

- [Tutti i corsi](${url('/corsi')})
- [Chi siamo](${url('/chi-siamo')})
- [Spettacoli ed eventi](${url('/spettacoli-eventi')})
- [Contatti](${url('/contatti')})

## Domande frequenti

${faq.map((f) => `### ${f.domanda}\n\n${f.risposta}`).join('\n\n')}
`;
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
