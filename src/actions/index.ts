/**
 * Astro Actions: tutto il backend del sito (chatbot, calendario eventi,
 * login e gestione dalla dashboard). Chiamate dal browser con
 * `import { actions } from 'astro:actions'` o come action di un <form>.
 */
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'astro/zod';
import { isLoggedIn, login, logout, passwordValida } from '../lib/auth';
import { rispondi } from '../lib/chatbot';
import { aggiungiTipo, eliminaEvento, ErroreEvento, eventiOrdinati, leggiTipi, rimuoviTipo, salvaEvento } from '../lib/eventi';
import { caricaImmagini, elencaImmagini, eliminaImmagine } from '../lib/uploads';

/** Blocca le azioni della dashboard senza sessione valida. */
async function soloAdmin(context: ActionAPIContext) {
  if (!(await isLoggedIn(context.session))) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sessione scaduta: effettua di nuovo il login' });
  }
}

/** Converte gli errori di validazione in errori leggibili dal client. */
async function conErrori<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ErroreEvento) throw new ActionError({ code: 'BAD_REQUEST', message: e.message });
    throw e;
  }
}

const campo = z.string().max(2000).optional();

export const server = {
  chatbot: {
    invia: defineAction({
      input: z.object({ message: z.string().max(2048) }),
      handler: async ({ message }, context) => ({
        response: await rispondi(message, {
          ip: context.request.headers.get('cf-connecting-ip') ?? context.clientAddress,
          userAgent: context.request.headers.get('user-agent') ?? '',
          origin: context.url.origin,
        }),
      }),
    }),
  },

  eventi: {
    /** Lista pubblica per il calendario di /spettacoli-eventi. */
    pubblici: defineAction({
      handler: async () => ({ eventi: await eventiOrdinati() }),
    }),

    salva: defineAction({
      input: z.object({
        id: campo,
        titolo: campo,
        data: campo,
        ora: campo,
        tipo: campo,
        luogo: campo,
        descrizione: z.string().max(20000).optional(),
        immagine: campo,
        destinatari: campo,
        costo: campo,
      }),
      handler: async (input, context) => {
        await soloAdmin(context);
        return conErrori(() => salvaEvento(input));
      },
    }),

    elimina: defineAction({
      input: z.object({ id: z.string() }),
      handler: async ({ id }, context) => {
        await soloAdmin(context);
        await conErrori(() => eliminaEvento(id.trim()));
      },
    }),
  },

  tipi: {
    lista: defineAction({
      handler: async (_, context) => {
        await soloAdmin(context);
        return { tipi: await leggiTipi() };
      },
    }),

    aggiungi: defineAction({
      input: z.object({ tipo: z.string().max(200) }),
      handler: async ({ tipo }, context) => {
        await soloAdmin(context);
        return { tipi: await conErrori(() => aggiungiTipo(tipo)) };
      },
    }),

    rimuovi: defineAction({
      input: z.object({ tipo: z.string().max(200) }),
      handler: async ({ tipo }, context) => {
        await soloAdmin(context);
        return { tipi: await conErrori(() => rimuoviTipo(tipo)) };
      },
    }),
  },

  immagini: {
    lista: defineAction({
      handler: async (_, context) => {
        await soloAdmin(context);
        return { immagini: await elencaImmagini() };
      },
    }),

    carica: defineAction({
      accept: 'form',
      input: z.object({ immagini: z.array(z.instanceof(File)) }),
      handler: async ({ immagini: files }, context) => {
        await soloAdmin(context);
        const valid = files.filter((f) => f.size > 0);
        if (!valid.length) throw new ActionError({ code: 'BAD_REQUEST', message: 'Nessun file caricato' });
        const { immagini, errori } = await caricaImmagini(valid);
        if (!immagini.length) throw new ActionError({ code: 'BAD_REQUEST', message: errori.join(', ') || 'Nessun file caricato' });
        return { immagini, errori };
      },
    }),

    elimina: defineAction({
      input: z.object({ nome: z.string() }),
      handler: async ({ nome }, context) => {
        await soloAdmin(context);
        const errore = await eliminaImmagine(nome);
        if (errore) throw new ActionError({ code: 'BAD_REQUEST', message: errore });
      },
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
