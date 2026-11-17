import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { carica } from './carica.mjs';
import { problemiStile } from '../src/lib/regole-stile.mjs';

const require = createRequire(import.meta.url);
const T = carica('lib/sviluppatori/testi.ts');
const S = carica('lib/sviluppatori/stili.ts', { postcss: require('postcss') });

const cambia = (file, src, vecchio, nuovo) => {
  const [occ] = T.trova(file, src, vecchio);
  assert.ok(occ, `«${vecchio}» non trovato`);
  return T.sostituisci(src, occ, vecchio, nuovo);
};

test('il testo visibile si ritrova nel markup anche su più righe', () => {
  const src = '---\nconst a = 1;\n---\n<p class="x">\n    Accedi per gestire\n    eventi e calendario.\n</p>\n';
  assert.equal(
    cambia('a.astro', src, 'Accedi per gestire eventi e calendario.', 'Accedi per gestire il calendario.'),
    src.replace('eventi e calendario', 'il calendario'),
  );
});

test("l'escape segue il contesto: stringhe con apice, attributi, JSON, markup", () => {
  assert.equal(cambia('a.ts', "const t = 'Ciao mondo';", 'Ciao mondo', "Ciao all'universo"), "const t = 'Ciao all\\'universo';");
  assert.equal(cambia('a.astro', '<Base title="Scuola di danza" />', 'Scuola di danza', 'Scuola "InBallet"'), '<Base title="Scuola &quot;InBallet&quot;" />');
  assert.equal(cambia('a.json', '{"t": "Danza classica"}', 'Danza classica', 'Danza "classica"'), '{"t": "Danza \\"classica\\""}');
  assert.equal(cambia('a.astro', '<h1>Area riservata</h1>', 'Area riservata', 'Area <riservata>'), '<h1>Area &lt;riservata&gt;</h1>');
});

test('entità e sequenze di escape del sorgente corrispondono al testo visibile', () => {
  assert.equal(T.trova('a.astro', '<p>Rock &amp; Roll&nbsp;oggi</p>', 'Rock & Roll oggi').length, 1);
  assert.equal(T.trova('a.ts', "const t = 'l\\'arte';", "l'arte")[0].contesto, 'js1');
});

test('i valori calcolati restano intatti e si può cambiare il testo intorno', () => {
  const src = 'const d = `Fondata nel ${FONDAZIONE} da Ilenia`;';
  assert.equal(cambia('a.ts', src, 'Fondata nel 2007 da Ilenia', 'Nata nel 2007 da Ilenia'), 'const d = `Nata nel ${FONDAZIONE} da Ilenia`;');
  const [occ] = T.trova('a.ts', src, 'Fondata nel 2007 da Ilenia');
  assert.throws(() => T.sostituisci(src, occ, 'Fondata nel 2007 da Ilenia', 'Fondata nel 2008 da Ilenia'), T.TestoCalcolato);
});

test('il markup dentro le espressioni Astro resta markup', () => {
  const src = '---\n---\n{errore && (\n  <p class="e">Password errata</p>\n)}\n';
  assert.equal(T.trova('a.astro', src, 'Password errata')[0].contesto, 'markup');
  assert.equal(T.contesto('a.ts', 'const x = 1; // nota', 18), null);
});

test('le regole CSS si leggono e si modificano senza toccare il resto', () => {
  const css = ':root {\n  --a: red;\n}\n\n@media (max-width: 900px) {\n  .b {\n    color: var(--a);\n  }\n}\n';
  const regole = S.regole('x.css', css);
  assert.deepEqual(JSON.parse(JSON.stringify(regole.map((r) => [r.selettore, r.contesti]))), [
    [':root', []],
    ['.b', ['@media (max-width: 900px)']],
  ]);
  const b = regole[1];
  const nuovo = S.applica(css, b.percorso, b.selettore, [
    { prop: 'color', valore: 'blue' },
    { prop: 'gap', valore: '1rem' },
  ]);
  assert.match(nuovo, /color: blue;\s*gap: 1rem;/);
  assert.ok(nuovo.startsWith(':root {\n  --a: red;\n}'));
  assert.throws(() => S.applica(css, b.percorso, '.altro', [{ prop: 'color', valore: 'red' }]), S.ErroreCss);
  assert.throws(() => S.applica(css, b.percorso, b.selettore, [{ prop: 'color', valore: 'red; } body { x: y' }]), S.ErroreCss);
  const conRegola = S.aggiungiRegola(css, '.b:hover', ['@media (max-width: 900px)'], [{ prop: 'opacity', valore: '0.8' }]);
  assert.equal(S.regole('x.css', conRegola).filter((r) => r.contesti.length).length, 2);
});

test('le regole di stile bloccano ciò che fermerebbe la build', () => {
  assert.equal(problemiStile('src/styles/pages/x.css', '.a { color: #fff; }').length, 1);
  assert.equal(problemiStile('src/styles/base/variables.css', ':root { --x: #fff; }').length, 0);
  assert.equal(problemiStile('src/styles/pages/x.css', '.a { font-size: 12px; }').length, 1);
  assert.equal(problemiStile('src/lib/x.ts', '// commento\nconst a = 1;').length, 1);
  assert.equal(problemiStile('scripts/x.mjs', '// libero').length, 0);
});
