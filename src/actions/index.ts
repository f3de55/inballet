/**
 * Astro Actions: tutto il backend del sito (chatbot, gestione eventi,
 * login e gestione dalla dashboard). Chiamate dal browser con
 * `import { actions } from 'astro:actions'` o come action di un <form>.
 */
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'astro/zod';
import { isLoggedIn, login, logout, passwordValida } from '../lib/auth';
import { prepara, rispondi } from '../lib/chatbot';
import { ipVisitatore } from '../lib/chatbot/protezioni';
import { verifica } from '../lib/chatbot/verifica';
import { aggiungiTipo, eliminaEvento, ErroreEvento, inputEvento, leggiTipi, rimuoviTipo, salvaEvento } from '../lib/eventi';
import { caricaImmagini, elencaImmagini, eliminaImmagine } from '../lib/uploads';
import { generaChat, generaEventi, generaInsegnanti, MAX_EVENTI, MAX_INSEGNANTI_DEMO, MAX_MESSAGGI, rimuoviChatDemo, rimuoviEventiDemo } from '../lib/demo';
import { eliminaTutto, PAROLA_CONFERMA } from '../lib/pulizia';
import { eliminaDocumento, ErroreDocumenti, ordinaDocumenti, salvaDocumento, salvaTesti } from '../lib/documenti';
import * as insegnanti from '../lib/insegnanti';

/**
 * Azione della dashboard: senza sessione valida risponde UNAUTHORIZED, gli errori
 * di validazione (con messaggio per l'utente) diventano BAD_REQUEST.
 */
function admin<I, O>(handler: (input: I, context: ActionAPIContext) => Promise<O>) {
  return async (input: I, context: ActionAPIContext): Promise<O> => {
    if (!(await isLoggedIn(context.session))) {
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sessione scaduta: effettua di nuovo il login' });
    }
    try {
      return await handler(input, context);
    } catch (e) {
      if (e instanceof ErroreEvento || e instanceof ErroreDocumenti || e instanceof insegnanti.ErroreInsegnanti) {
        throw new ActionError({ code: 'BAD_REQUEST', message: e.message });
      }
      throw e;
    }
  };
}

const richiesta = (message: string) => new ActionError({ code: 'BAD_REQUEST', message });
const campo = z.string().max(2000).optional();
const perId = z.object({ id: z.string().max(40) });
const ordine = (max: number) => z.object({ ids: z.array(z.string().max(40)).max(max) });

export const server = {
  chatbot: {
    invia: defineAction({
      input: z.object({ message: z.string().max(2048), conversazione: z.string().max(64).optional() }),
      handler: async ({ message, conversazione }, context) => {
        const { html, conversazione: id } = await rispondi({
          testo: message,
          conversazione,
          ip: ipVisitatore(context.request.headers, context.clientAddress),
          userAgent: context.request.headers.get('user-agent') ?? '',
          origine: context.url.origin,
        });
        return { response: html, conversazione: id };
      },
    }),

    /** Chat aperta: il server prepara la conoscenza mentre il visitatore scrive. */
    prepara: defineAction({
      handler: async (_, context) => {
        await prepara(context.url.origin);
      },
    }),

    /** Verifica di qualità: una domanda di prova a un fornitore della catena (dashboard). */
    verifica: defineAction({
      input: z.object({ fornitore: z.string().max(40), modello: z.string().max(120), indice: z.number().int().min(0).max(100) }),
      handler: admin(({ fornitore, modello, indice }, context) => verifica({ fornitore, modello }, indice, context.url.origin)),
    }),
  },

  /** Calendario: le pagine pubbliche leggono gli eventi dal server, qui solo la gestione. */
  eventi: {
    /** Regole di validazione in `inputEvento` (src/lib/eventi.ts): errori per campo nel modulo. */
    salva: defineAction({
      input: inputEvento,
      handler: admin((input) => salvaEvento(input)),
    }),

    elimina: defineAction({
      input: z.object({ id: z.string() }),
      handler: admin(({ id }) => eliminaEvento(id.trim())),
    }),
  },

  tipi: {
    lista: defineAction({
      handler: admin(async () => ({ tipi: await leggiTipi() })),
    }),

    aggiungi: defineAction({
      input: z.object({ tipo: z.string().max(200) }),
      handler: admin(async ({ tipo }) => ({ tipi: await aggiungiTipo(tipo) })),
    }),

    rimuovi: defineAction({
      input: z.object({ tipo: z.string().max(200) }),
      handler: admin(async ({ tipo }) => ({ tipi: await rimuoviTipo(tipo) })),
    }),
  },

  immagini: {
    lista: defineAction({
      handler: admin(async () => ({ immagini: await elencaImmagini() })),
    }),

    carica: defineAction({
      accept: 'form',
      input: z.object({ immagini: z.array(z.instanceof(File)) }),
      handler: admin(async ({ immagini: files }) => {
        const valid = files.filter((f) => f.size > 0);
        if (!valid.length) throw richiesta('Nessun file caricato');
        const { immagini, errori } = await caricaImmagini(valid);
        if (!immagini.length) throw richiesta(errori.join(', ') || 'Nessun file caricato');
        return { immagini, errori };
      }),
    }),

    elimina: defineAction({
      input: z.object({ nome: z.string() }),
      handler: admin(async ({ nome }) => {
        const errore = await eliminaImmagine(nome);
        if (errore) throw richiesta(errore);
      }),
    }),
  },

  /** Pagina /documenti: testi e PDF da scaricare, modificabili dalla dashboard. */
  documenti: {
    salvaTesti: defineAction({
      input: z.object({ heroTitolo: campo, heroTesto: campo, eyebrow: campo, titolo: campo, accento: campo, intro: campo }),
      handler: admin(async (input) => {
        await salvaTesti(input);
      }),
    }),

    /** Crea o modifica un documento; con `file` carica (o sostituisce) il PDF. */
    salva: defineAction({
      accept: 'form',
      input: z.object({
        id: z.string().max(40).optional(),
        titolo: campo,
        nota: campo,
        categoria: z.enum(['modulo', 'statuto']).optional(),
        file: z.instanceof(File).optional(),
      }),
      handler: admin(async (input) => ({ documento: await salvaDocumento(input) })),
    }),

    elimina: defineAction({
      input: perId,
      handler: admin(({ id }) => eliminaDocumento(id)),
    }),

    ordina: defineAction({
      input: ordine(50),
      handler: admin(({ ids }) => ordinaDocumenti(ids)),
    }),
  },

  /** Sezione Insegnanti di Chi siamo: testi e schede, modificabili dalla dashboard. */
  insegnanti: {
    salvaTesti: defineAction({
      input: z.object({ eyebrow: campo, titolo: campo, accento: campo, intro: campo }),
      handler: admin(async (input) => {
        await insegnanti.salvaTesti(input);
      }),
    }),

    /** Crea o modifica un insegnante; con `foto` carica (o sostituisce) la foto. */
    salva: defineAction({
      accept: 'form',
      input: z.object({
        id: z.string().max(40).optional(),
        nome: campo,
        ruolo: campo,
        bio: campo,
        competenze: campo,
        foto: z.instanceof(File).optional(),
        togliFoto: z.string().max(5).optional(),
      }),
      handler: admin(async (input) => ({ insegnante: await insegnanti.salvaInsegnante({ ...input, togliFoto: input.togliFoto === 'true' }) })),
    }),

    elimina: defineAction({
      input: perId,
      handler: admin(({ id }) => insegnanti.eliminaInsegnante(id)),
    }),

    ordina: defineAction({
      input: ordine(60),
      handler: admin(({ ids }) => insegnanti.ordinaInsegnanti(ids)),
    }),
  },

  /** Dati demo della dashboard (sempre marcati `demo`, rimovibili senza toccare i dati veri). */
  demo: {
    eventi: defineAction({
      input: z.object({ quanti: z.number().int().min(1).max(MAX_EVENTI) }),
      handler: admin(async ({ quanti }) => ({ creati: await generaEventi(quanti) })),
    }),

    rimuoviEventi: defineAction({
      handler: admin(async () => ({ rimossi: await rimuoviEventiDemo() })),
    }),

    chatbot: defineAction({
      input: z.object({ quanti: z.number().int().min(1).max(MAX_MESSAGGI), giorni: z.number().int().min(1).max(365) }),
      handler: admin(async ({ quanti, giorni }) => ({ creati: await generaChat(quanti, giorni) })),
    }),

    rimuoviChatbot: defineAction({
      handler: admin(async () => ({ rimossi: await rimuoviChatDemo() })),
    }),

    insegnanti: defineAction({
      input: z.object({ quanti: z.number().int().min(1).max(MAX_INSEGNANTI_DEMO) }),
      handler: admin(async ({ quanti }) => ({ creati: await generaInsegnanti(quanti) })),
    }),

    rimuoviInsegnanti: defineAction({
      handler: admin(async () => ({ rimossi: await insegnanti.rimuoviInsegnantiDemo() })),
    }),

    /** Elimina TUTTI i dati scelti (anche quelli veri). Serve la parola di conferma. */
    eliminaTutto: defineAction({
      input: z.object({ eventi: z.boolean(), chatbot: z.boolean(), conferma: z.string() }),
      handler: admin(async ({ eventi, chatbot, conferma }) => {
        if (conferma.trim().toUpperCase() !== PAROLA_CONFERMA) throw richiesta(`Scrivi ${PAROLA_CONFERMA} per confermare`);
        if (!eventi && !chatbot) throw richiesta('Scegli cosa eliminare');
        return eliminaTutto({ eventi, chatbot });
      }),
    }),
  },

  auth: {
    /** Form di /login (funziona anche senza JavaScript). */
    login: defineAction({
      accept: 'form',
      input: z.object({ password: z.string().max(200) }),
      handler: async ({ password }, context) => {
        if (!passwordValida(password)) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Password non corretta' });
        await login(context.session);
      },
    }),

    logout: defineAction({
      accept: 'form',
      handler: async (_, context) => {
        logout(context.session);
      },
    }),
  },
};
