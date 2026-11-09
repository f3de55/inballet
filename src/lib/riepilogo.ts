import { getCollection } from 'astro:content';
import { ANNI_ATTIVITA, categorieCorsi, faq, FONDAZIONE, iscrizioni, scuola, sedi } from '../data/scuola';
import type { Documento } from './documenti';
import { datiGoogle, testoOrari } from './google';

const strip = (html: string) => html.replace(/<[^>]+>/g, '');

interface Opzioni {
  url: (path: string) => string;
  documenti?: Documento[];
}

export async function riepilogoScuola({ url, documenti = [] }: Opzioni): Promise<string> {
  const [collezione, google] = await Promise.all([getCollection('corsi'), datiGoogle()]);
  const corsi = new Map(collezione.map((c) => [`/${c.id}`, c.data]));
  const orari = google?.orari.some((f) => f.length) ? testoOrari(google.orari) : `- Non disponibili in questo momento: chiedere alla segreteria (${scuola.telefono})`;
  const voto = google?.voto ? `\n- Valutazione su Google: ${google.voto.toFixed(1).replace('.', ',')} su 5 (${google.totale} recensioni)` : '';
  const dettagli = (path: string) => {
    const c = corsi.get(path);
    return c ? `: ${c.eta}; ${c.frequenza.toLowerCase()}` : '';
  };
  return `# InBallet - Scuola di danza a Lainate e Rho

> ${scuola.nome} (anche "I.N. Ballet") è una scuola di danza multidisciplinare con sede a Lainate e Rho, a nord-ovest di Milano. Fondata nel ${FONDAZIONE} da ${scuola.fondatrice}, da ${ANNI_ATTIVITA} anni propone corsi per bambini dai 3 anni, ragazzi e adulti ed è Ente Formativo riconosciuto CSEN e CONI per la formazione degli insegnanti di danza.

L'inclusione è centrale per tutte le fasce d'età: dal 2013 il [progetto NoiConVoi](${url('/progetto-noiconvoi')}) accoglie ragazzi con disabilità in esperienze di danza con supporto psicomotorio, insieme a un team di volontari. La scuola propone anche formazioni per professionisti dell'ambito educativo e terapeutico.

## Fondatrice

${scuola.fondatrice} è la fondatrice e Direttrice Artistica della scuola: professoressa di danza, psicomotricista, formatrice, operatrice per l'educazione speciale e insegnante certificata ContaKids World.

## Storia

- Gli inizi: né sede né nome, le prime lezioni allo skate park, poi Auditorium, oratori e palestre comunali
- ${FONDAZIONE}: ${scuola.fondatrice} fonda la scuola a Lainate
- 2013: nasce il progetto NoiConVoi per ragazzi con disabilità
- 2023: riconoscimento come ente formativo per il titolo di Insegnante di Danza (CSEN e CONI)
- 2024: avvio del volontariato d'impresa con aziende ed enti; una borsa di studio della scuola porta due allieve a lezione in cinque scuole di New York
- Ogni anno: spettacolo di fine anno in teatro con gli allievi della scuola

## Contatti

- Telefono: ${scuola.telefono}
- E-mail: ${scuola.email}
- WhatsApp: ${scuola.whatsapp}
- Instagram: ${scuola.social.instagram}
- Facebook: ${scuola.social.facebook}${voto}

## Sedi

${sedi.map((s) => `- ${s.titolo}: ${s.indirizzo}`).join('\n')}

## Orari della segreteria

${orari}

## Corsi

${categorieCorsi.map((c) => `### ${c.nome}\n\n${strip(c.descrizione)}\n\n${c.corsi.map((k) => `- [${k.nome}](${url(k.url)})${dettagli(k.url)}`).join('\n')}`).join('\n\n')}

## Inclusione e servizi

- [Progetto NoiConVoi](${url('/progetto-noiconvoi')}): dal 2013, il lunedì sera, ragazzi con disabilità e volontari (anche non danzatori) in sala; ogni lezione unisce Pratica Psicomotoria Aucouturier (PPA) e didattica artistica
- [Classi multidisciplinari integrate](${url('/classi-integrate')}): quasi tutti i corsi accolgono allievi con bisogni speciali, dopo un consulto con la Direzione e un colloquio con la famiglia
- [Sportello psicologico](${url('/sportello-psicologico')}): incontri con una psicoterapeuta per singoli, coppie e soprattutto per la tutela del rapporto genitore-figlio, su richiesta alla Direzione
- [Sostenitori dei progetti sociali](${url('/sostenitori')}): donazioni e, dal 2024, volontariato d'impresa per aziende ed enti
- [Collaborazioni con le scuole](${url('/collaborazioni-scuole')}): progetti su misura con supporto psicomotorio per nidi, scuole dell'infanzia, primarie e secondarie di primo e secondo grado
- [Spettacoli ed eventi](${url('/spettacoli-eventi')}): spettacolo annuale in teatro, eventi celebrativi, eventi nelle scuole, team building aziendali ed eventi formativi
- Borse di studio: la scuola premia ogni anno l'impegno degli allievi; le borse tengono conto anche dell'andamento scolastico
- Gruppo Pro: sezione pre-professionale della scuola, con accesso tramite audizione
- Only for Dad: il gruppo di papà delle allieve che propone coreografie

## Formazione

- [Corso di formazione per insegnanti di danza](${url('/formazione-insegnanti')}): ente formativo dal 2023; percorso biennale con specializzazione Modern e sei master successivi, titolo di Insegnante di Danza riconosciuto CSEN e CONI a valenza nazionale
- [Formazioni personalizzate](${url('/formazioni-personalizzate')}): corsi su misura per professionisti dell'ambito educativo e terapeutico, pedagogisti e insegnanti, tra linguaggi espressivi, corporeità, motricità ed esplorazione del sé

## Iscrizioni ${iscrizioni.anno}

- [Documenti per l'iscrizione](${url('/documenti')}): quota associativa annuale ${iscrizioni.quota} €, certificato medico per attività non agonistica dai 6 anni (sotto i 6 anni autocertificazione dei genitori), corso pagato in tre rate: ${iscrizioni.rate.map((r) => `entro il ${r.scadenza} (${r.periodo})`).join(', ')}.
${documenti.map((d) => `- [${d.titolo}](${url(d.file)})${d.nota ? `: ${d.nota.toLowerCase()}` : ''}`).join('\n')}

## Pagine principali

- [Tutti i corsi](${url('/corsi')})
- [Chi siamo](${url('/chi-siamo')})
- [Spettacoli ed eventi](${url('/spettacoli-eventi')})
- [Contatti](${url('/contatti')})

## Domande frequenti

${faq.map((f) => `### ${f.domanda}\n\n${f.risposta}`).join('\n\n')}
`;
}
