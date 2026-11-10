import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { carica } from './carica.mjs';

const protezioni = (header = '') =>
  carica('lib/chatbot/protezioni.ts', {
    'node:crypto': crypto,
    'astro:env/server': { CHATBOT_IP_HEADER: header },
    '../text': carica('lib/text.ts'),
    '../../data/scuola': { scuola: { telefono: '000' } },
  });

test('gli indirizzi IPv6 della stessa rete /64 contano come un solo visitatore', () => {
  const { reteDi } = protezioni();
  assert.equal(reteDi('203.0.113.7'), '203.0.113.7');
  assert.equal(reteDi('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(reteDi('2001:db8:1:2:aaaa::1'), '2001:db8:1:2::/64');
  assert.equal(reteDi('2001:0DB8:0001:0002:bbbb:cccc:dddd:eeee'), '2001:db8:1:2::/64');
  assert.equal(reteDi('[2001:db8::1]'), '2001:db8:0:0::/64');
  assert.equal(reteDi('::1'), '0:0:0:0::/64');
  assert.equal(reteDi('fe80::1%eth0'), 'fe80:0:0:0::/64');
});

test("l'indirizzo viene dall'intestazione configurata, ultimo valore, altrimenti dalla connessione", () => {
  const richiesta = new Headers({ 'x-real-ip': '198.51.100.1, 203.0.113.9', 'x-forwarded-for': '10.0.0.1' });
  assert.equal(protezioni('x-real-ip').ipVisitatore(richiesta, '192.0.2.1'), '203.0.113.9');
  assert.equal(protezioni().ipVisitatore(richiesta, '192.0.2.1'), '192.0.2.1');
  assert.equal(protezioni('x-assente').ipVisitatore(richiesta, '192.0.2.1'), '192.0.2.1');
});

test('un visitatore non può mandare due messaggi nello stesso secondo', () => {
  const { controllaLimiti } = protezioni();
  assert.equal(controllaLimiti('a'), null);
  assert.match(controllaLimiti('a'), /Aspetta/);
  assert.equal(controllaLimiti('b'), null);
});

test('chi insiste oltre il limite viene bloccato per un’ora', () => {
  const { bloccato, controllaLimiti } = protezioni();
  for (let i = 0; i < 60; i++) controllaLimiti('a');
  assert.equal(bloccato('a'), true);
  assert.equal(bloccato('b'), false);
});

test('i tetti globali fermano le richieste oltre la soglia anche da indirizzi diversi', () => {
  const { tetto } = protezioni();
  const passate = (ammetti, tentativi) => Array.from({ length: tentativi }, ammetti).filter(Boolean).length;
  assert.equal(passate(tetto.modello, 500), 20);
  assert.equal(passate(tetto.messaggi, 500), 60);
  assert.equal(passate(tetto.rifiuti, 500), 300);
});
