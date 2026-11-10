import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

export function carica(file, dipendenze = {}) {
  const codice = ts.transpileModule(readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(codice, { module, exports: module.exports, require: (nome) => dipendenze[nome] }, { filename: file });
  return module.exports;
}
