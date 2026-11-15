import assert from 'node:assert/strict';
import test from 'node:test';
import { carica } from './carica.mjs';

const GIORNO = 86400_000;
const INIZIO = Date.parse('2026-01-01T09:00:00Z');

const rispostaGoogle = {
  rating: 4.9,
  userRatingCount: 31,
  reviews: [{ rating: 5, publishTime: '2026-01-01T00:00:00Z', text: { text: 'Bellissima scuola' }, authorAttribution: { displayName: 'Anna' } }],
  regularOpeningHours: { periods: [{ open: { day: 1, hour: 15 }, close: { day: 1, hour: 23 } }] },
};

function ambiente({ salvato = null, risposta = () => new Response(JSON.stringify(rispostaGoogle)) } = {}) {
  const stato = { ora: INIZIO, chiamate: 0, file: salvato };
  class Orologio extends Date {
    constructor(...a) {
      super(...(a.length ? a : [stato.ora]));
    }
    static now() {
      return stato.ora;
    }
  }
  const google = carica(
    'lib/google.ts',
    {
      'astro:env/client': { PUBLIC_GOOGLE_PLACE_ID: 'luogo' },
      'astro:env/server': { GOOGLE_PLACES_API_KEY: 'chiave' },
      './storage': {
        paths: { google: 'google.json' },
        readJson: async (_, vuoto) => structuredClone(stato.file ?? vuoto),
        writeJson: async (_, dati) => void (stato.file = structuredClone(dati)),
      },
    },
    {
      Date: Orologio,
      AbortSignal,
      Response,
      console: { error() {} },
      fetch: async () => {
        stato.chiamate++;
        return risposta();
      },
    },
  );
  return { ...google, stato };
}

const visite = (datiGoogle, n) => Promise.all(Array.from({ length: n }, () => datiGoogle()));
const finiscono = () => new Promise((r) => setImmediate(r));

test('senza dati salvati, 10.000 visitatori contemporanei fanno una sola chiamata a Google', async () => {
  const { datiGoogle, stato } = ambiente();
  const risposte = await visite(datiGoogle, 10_000);
  assert.equal(stato.chiamate, 1);
  assert.ok(risposte.every((d) => d?.voto === 4.9 && d.recensioni.length === 1));
  assert.equal(stato.file.voto, 4.9);
});

test('con dati salvati da meno di 30 giorni, nessuna chiamata, anche dopo un riavvio', async () => {
  const { datiGoogle, stato } = ambiente();
  await datiGoogle();
  const riavvio = ambiente({ salvato: stato.file });
  riavvio.stato.ora = INIZIO + 29 * GIORNO;
  await visite(riavvio.datiGoogle, 10_000);
  await finiscono();
  assert.equal(riavvio.stato.chiamate, 0);
});

test('dopo 30 giorni una sola chiamata, mentre i visitatori vedono subito i dati salvati', async () => {
  const { datiGoogle, stato } = ambiente();
  await datiGoogle();
  stato.ora += 30 * GIORNO + 1;
  const risposte = await visite(datiGoogle, 10_000);
  assert.ok(risposte.every((d) => d?.voto === 4.9));
  await finiscono();
  assert.equal(stato.chiamate, 2);
});

test('in un anno di visite continue Google viene chiamato una volta ogni 30 giorni', async () => {
  const { datiGoogle, stato } = ambiente();
  for (let ora = 0; ora < 365 * 24; ora += 6) {
    stato.ora = INIZIO + ora * 3600_000;
    await visite(datiGoogle, 10);
    await finiscono();
  }
  assert.equal(stato.chiamate, 13);
});

test('se Google non risponde, riprova dopo 1, 2, 4… ore e al massimo una volta al giorno', async () => {
  const { datiGoogle, stato } = ambiente({ risposta: () => new Response('errore', { status: 500 }) });
  for (let minuto = 0; minuto < 3 * 24 * 60; minuto += 5) {
    stato.ora = INIZIO + minuto * 60_000;
    await visite(datiGoogle, 5);
    await finiscono();
  }
  assert.ok(stato.chiamate <= 8, `${stato.chiamate} chiamate in tre giorni`);
});
