import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function carica(file, dipendenze = {}) {
  const codice = ts.transpileModule(readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(codice, { module, exports: module.exports, require: (nome) => dipendenze[nome] }, { filename: file });
  return module.exports;
}

const { cerca, creaIndice, dividi } = carica('lib/chatbot/ricerca.ts', { '../../data/chatbot': carica('data/chatbot.ts') });

const pagine = [
  {
    percorso: '/seconda-infanzia',
    titolo: 'Danza per bambini da 6 a 8 anni',
    testo: '## Danza per bambini da 6 a 8 anni\nDal gioco al primo stile: classica, modern e hip-hop, una o due volte a settimana.\n## I corsi da 6 a 8 anni\nOgni bambina e ogni bambino sceglie il suo stile con le insegnanti, dopo una lezione di prova.',
  },
  {
    percorso: '/adulti',
    titolo: 'Danza per adulti',
    testo: "## Danza per adulti\nNon c'è un'età giusta per iniziare: contemporanea dai 40 anni, movimento creativo e pilates.",
  },
  {
    percorso: '/breaking',
    titolo: 'Corso di Breaking',
    testo: '## Corso di Breaking\nPassi in piedi, movimenti a terra e freeze, due lezioni a settimana in classi per livello.',
  },
  {
    percorso: '/contatti',
    titolo: 'Contatti e sedi',
    testo: '## Le nostre sedi\nLa sede centrale è in Via Puccini 14 a Lainate, la seconda sede in Via Tevere 19 a Rho.',
  },
];

const indice = creaIndice(pagine.flatMap(dividi));
const primo = (domanda, opzioni) => cerca(indice, [{ testo: domanda, peso: 1 }], opzioni)[0]?.percorso;

test('ricerca: divide le pagine per sezione e unisce quelle troppo corte', () => {
  const passaggi = dividi(pagine[0]);
  assert.equal(passaggi.length, 1);
  assert.match(passaggi[0].testo, /## I corsi da 6 a 8 anni/);
  assert.equal(dividi({ percorso: '/x', titolo: 'X', testo: '## Solo titolo\n## Altro titolo' }).length, 0);
});

test("ricerca: un'età precisa trova la fascia che la contiene", () => {
  assert.equal(primo('mia figlia ha 7 anni, cosa può fare?'), '/seconda-infanzia');
});

test('ricerca: verbi, sinonimi e parole vuote', () => {
  assert.equal(primo('dove siete?'), '/contatti');
  assert.equal(primo('a che età si può iniziare da adulto?'), '/adulti');
  assert.equal(primo('fate breakdance?'), '/breaking');
  assert.deepEqual(cerca(indice, [{ testo: 'ciao, grazie!', peso: 1 }]), []);
});

test('ricerca: una domanda di seguito resta sul corso di cui si parlava', () => {
  const trovati = cerca(
    indice,
    [
      { testo: 'quante volte a settimana?', peso: 1 },
      { testo: 'mi interessa la breaking', peso: 0.5 },
    ],
    { pagine: new Set(['/breaking']) },
  );
  assert.equal(trovati[0]?.percorso, '/breaking');
});

test('ricerca: rispetta il limite di caratteri', () => {
  const trovati = cerca(indice, [{ testo: 'danza bambini adulti breaking sede', peso: 1 }], { caratteri: 200 });
  assert.ok(trovati.reduce((s, p) => s + p.testo.length, 0) <= 200);
});
