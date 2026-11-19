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

function deposito(file) {
  const disco = new Map(Object.entries(file));
  const salvati = new Map();
  class ErroreSviluppatori extends Error {}
  const R = carica('lib/sviluppatori/riferimenti.ts', {
    'node:path': require('node:path'),
    './deposito': {
      ErroreSviluppatori,
      elenco: async () => [...disco.keys()].sort(),
      leggiTesto: async (p) => disco.get(p),
      percorsoSicuro: (p) => p,
      elimina: async (p) => disco.delete(p),
      rinomina: async (da, a) => {
        disco.set(a, disco.get(da));
        disco.delete(da);
      },
    },
    './index': { salvaTesto: async (p, t) => salvati.set(p, t) },
  });
  return { R, disco, salvati };
}

test('un file ancora importato o citato nei dati non si elimina', async () => {
  const { R, disco } = deposito({
    'src/assets/images/foto/sala.webp': '',
    'src/assets/images/foto/vecchia.webp': '',
    'src/lib/testo.ts': '',
    'src/pages/index.astro': "---\nimport foto from '../assets/images/foto/sala.webp';\nimport { x } from '../lib/testo';\n---\n",
  });
  await assert.rejects(R.eliminaFile('src/assets/images/foto/sala.webp'), /index\.astro:2/);
  await assert.rejects(R.eliminaFile('src/lib/testo.ts'), /index\.astro:3/);
  await R.eliminaFile('src/assets/images/foto/vecchia.webp');
  assert.equal(disco.has('src/assets/images/foto/vecchia.webp'), false);
});

test('i nomi costruiti dal codice bloccano solo i file citati nei dati', async () => {
  const { R } = deposito({
    'public/sponsor/comune-scuro.png': '',
    'public/sponsor/vecchio-scuro.png': '',
    'src/components/Loghi.astro': '<img src={`/sponsor/${s.file}-scuro.png`} />',
    'src/data/loghi.ts': "export const loghi = [{ file: 'comune' }];",
  });
  await assert.rejects(R.eliminaFile('public/sponsor/comune-scuro.png'), /Loghi\.astro:1/);
  await R.eliminaFile('public/sponsor/vecchio-scuro.png');
});

test('rinominare aggiorna import relativi, percorsi nei dati e url dei fogli di stile', async () => {
  const { R, disco, salvati } = deposito({
    'src/assets/images/prova/esempio-1.webp': '',
    'src/data/corsi.json': '{"immagine": "assets/images/prova/esempio-1.webp"}',
    'src/pages/corsi.astro': "---\nimport a from '../assets/images/prova/esempio-1.webp';\n---\n",
    'src/styles/pages/corsi.css': '.x { background: url(../../assets/images/prova/esempio-1.webp); }',
  });
  const aggiornati = await R.rinominaFile('src/assets/images/prova/esempio-1.webp', 'src/assets/images/prova/esempio-tecnica.webp');
  assert.equal(aggiornati.length, 3);
  assert.equal(disco.has('src/assets/images/prova/esempio-tecnica.webp'), true);
  assert.equal(salvati.get('src/data/corsi.json'), '{"immagine": "assets/images/prova/esempio-tecnica.webp"}');
  assert.match(salvati.get('src/pages/corsi.astro'), /'\.\.\/assets\/images\/prova\/esempio-tecnica\.webp'/);
  assert.match(salvati.get('src/styles/pages/corsi.css'), /url\(\.\.\/\.\.\/assets\/images\/prova\/esempio-tecnica\.webp\)/);
});
