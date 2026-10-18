/**
 * llms.txt: riepilogo in Markdown dei fatti chiave della scuola per assistenti
 * e motori di ricerca basati su AI (https://llmstxt.org). Generato dai dati
 * ufficiali in src/data/scuola.ts.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ANNI_ATTIVITA, categorieCorsi, faq, FONDAZIONE, iscrizioni, orari, scuola, sedi } from '../data/scuola';

const strip = (html: string) => html.replace(/<[^>]+>/g, '');

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  // Età e frequenza di ogni corso, dalla collection delle pagine corso
  const corsi = new Map((await getCollection('corsi')).map((c) => [`/${c.id}`, c.data]));
  const dettagli = (path: string) => {
    const c = corsi.get(path);
    return c ? `: ${c.eta}; ${c.frequenza.toLowerCase()}` : '';
  };
  const md = `# InBallet - Scuola di danza a Lainate e Rho

> ${scuola.nome} (anche "I.N. Ballet") è una scuola di danza multidisciplinare con sede a Lainate e Rho, in provincia di Milano. Fondata nel ${FONDAZIONE} da ${scuola.fondatrice}, da ${ANNI_ATTIVITA} anni propone corsi per bambini dai 3 anni, ragazzi e adulti ed è Ente Formativo riconosciuto CSEN e CONI per la formazione degli insegnanti di danza.

L'inclusione è centrale per tutte le fasce d'età: dal 2013 il [progetto NoiConVoi](${url('/progetto-noiconvoi')}) accoglie ragazzi con disabilità in esperienze di danza con supporto psicomotorio, insieme a un team di volontari. La scuola propone anche formazioni per professionisti dell'ambito educativo e terapeutico.

## Storia

- ${FONDAZIONE}: ${scuola.fondatrice} fonda la scuola a Lainate
- 2013: nasce il progetto NoiConVoi per ragazzi con disabilità
- 2023: riconoscimento come ente formativo per il titolo di Insegnante di Danza (CSEN e CONI)
- 2024: avvio del volontariato d'impresa con aziende ed enti
- Ogni anno: spettacolo di fine anno in teatro con gli allievi della scuola

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

${categorieCorsi.map((c) => `### ${c.nome}\n\n${strip(c.descrizione)}\n\n${c.corsi.map((k) => `- [${k.nome}](${url(k.url)})${dettagli(k.url)}`).join('\n')}`).join('\n\n')}

## Inclusione e servizi

- [Progetto NoiConVoi](${url('/progetto-noiconvoi')}): dal 2013, il lunedì sera, ragazzi con disabilità e volontari (anche non danzatori) in sala; ogni lezione unisce Pratica Psicomotoria Aucouturier (PPA) e didattica artistica
- [Classi multidisciplinari integrate](${url('/classi-integrate')}): quasi tutti i corsi accolgono casi speciali, dopo un consulto con la Direzione e un colloquio con la famiglia
- [Sportello psicologico](${url('/sportello-psicologico')}): incontri con una psicoterapeuta per singoli, coppie e soprattutto per la tutela del rapporto genitore-figlio, su richiesta alla Direzione
- [Sostenitori dei progetti sociali](${url('/sostenitori')}): donazioni e, dal 2024, volontariato d'impresa per aziende ed enti
- [Collaborazioni con le scuole](${url('/collaborazioni-scuole')}): progetti su misura con supporto psicomotorio per nidi, scuole dell'infanzia, primarie e secondarie di primo e secondo grado
- [Spettacoli ed eventi](${url('/spettacoli-eventi')}): spettacolo annuale in teatro, eventi celebrativi, eventi nelle scuole, team building aziendali ed eventi formativi

## Formazione

- [Corso di formazione per insegnanti di danza](${url('/formazione-insegnanti')}): ente formativo dal 2023; percorso biennale con specializzazione Modern e sei master successivi, titolo di Insegnante di Danza riconosciuto CSEN e CONI a valenza nazionale
- [Formazioni personalizzate](${url('/formazioni-personalizzate')}): corsi su misura per professionisti dell'ambito educativo e terapeutico, pedagogisti e insegnanti, tra linguaggi espressivi, corporeità, motricità ed esplorazione del sé

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
