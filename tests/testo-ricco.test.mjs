import assert from 'node:assert/strict';
import test from 'node:test';
import { carica } from './carica.mjs';

const { testoRicco, testoSemplice } = carica('lib/text.ts');

test('i vecchi testi con i doppi asterischi diventano grassetto', () => {
  assert.equal(testoRicco('Insegnanti **qualificati**, uniti'), 'Insegnanti <strong>qualificati</strong>, uniti');
  assert.equal(testoRicco('Rock & Roll <3'), 'Rock &amp; Roll &lt;3');
});

test("l'HTML dell'editor resta solo grassetto, corsivo e a capo", () => {
  assert.equal(testoRicco('A <b class="x">b</b> <i>c</i><div>riga</div><p>p</p>'), 'A <strong>b</strong> <em>c</em><br>riga<br>p');
  assert.equal(testoRicco('a<div>b</div><div><br></div><div>c</div>'), 'a<br>b<br><br>c');
  assert.equal(testoRicco('<script>alert(1)</script>ok <a href="x">link</a>'), 'ok link');
  assert.equal(testoRicco('<strong> </strong>x<br><br>'), 'x');
});

test('gli elenchi restano solo dove sono ammessi', () => {
  assert.equal(testoRicco('<ul><li>uno</li><li>due</li></ul>'), 'uno<br>due');
  assert.equal(testoRicco('<ul><li>uno</li><li>due</li></ul>', true), '<ul><li>uno</li><li>due</li></ul>');
});

test('pulire due volte non cambia il testo', () => {
  const una = testoRicco('a & b **c**');
  assert.equal(testoRicco(una), una);
  assert.equal(testoSemplice(una), 'a & b c');
});
