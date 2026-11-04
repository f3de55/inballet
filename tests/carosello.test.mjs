import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../src/scripts/carosello.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

// Il DOM minimo delle due file, con frame e timer controllati senza attese reali.
function setup({ reducedMotion = false } = {}) {
  class Target {
    listeners = new Map();
    addEventListener(type, callback, options) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push({ callback, capture: options === true || options?.capture === true });
      this.listeners.set(type, listeners);
    }
    emit(type, event = {}, captureOnly = false) {
      for (const listener of this.listeners.get(type) ?? []) {
        if (!captureOnly || listener.capture) listener.callback(event);
      }
    }
  }
  const document = new Target();
  const window = new Target();
  const dialogs = [];
  class Dialog {
    open = true;
    constructor() { dialogs.push(this); }
    close() {
      this.open = false;
      // L'evento nativo close non fa bubbling: lo ricevono solo gli osservatori in cattura.
      document.emit('close', { target: this }, true);
    }
  }
  const rows = Array.from({ length: 2 }, () => {
    const row = new Target();
    const classes = new Set();
    const track = { scrollWidth: 2000, style: {}, querySelectorAll: () => [] };
    Object.assign(row, {
      dataset: { giro: '40' }, scrollLeft: 0,
      classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value), contains: (value) => classes.has(value) },
      querySelector: () => track,
    });
    return row;
  });
  document.hidden = false;
  document.querySelectorAll = () => rows;
  document.querySelector = () => dialogs.find((dialog) => dialog.open) ?? null;
  window.matchMedia = () => ({ matches: reducedMotion });
  let now = 1000;
  let nextTimer = 0;
  let frames = [];
  const timers = new Map();
  const setTimeout = (callback, delay) => {
    const id = ++nextTimer;
    timers.set(id, { callback, at: now + delay });
    return id;
  };
  window.setTimeout = setTimeout;
  vm.runInNewContext(source, {
    window, document, HTMLDialogElement: Dialog, exports: {},
    performance: { now: () => now },
    requestAnimationFrame: (callback) => frames.push(callback),
    setTimeout, clearTimeout: (id) => timers.delete(id), setInterval: () => 0,
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { this.callback([{ isIntersecting: true }]); }
    },
  });
  const frame = (elapsed = 16) => {
    now += elapsed;
    for (const [id, timer] of timers) {
      if (timer.at <= now) { timers.delete(id); timer.callback(); }
    }
    const pending = frames;
    frames = [];
    pending.forEach((callback) => callback(now));
  };
  frame();
  frame();
  return { rows, window, Dialog, frame, timers };
}

const mouse = { pointerType: 'mouse', button: 0, clientX: 200 };
const positions = (rows) => rows.map((row) => row.scrollLeft);
const assertMoving = (rows, before) => rows.forEach((row, index) => assert.ok(row.scrollLeft > before[index]));

test('entrambe le file partono senza clic e la pausa al passaggio continua a funzionare', () => {
  const { rows, frame } = setup();
  assertMoving(rows, [500, 500]);
  rows.forEach((row) => row.emit('pointerenter', mouse));
  const before = positions(rows);
  frame();
  assert.deepEqual(positions(rows), before);
});

test('la chiusura nativa riparte al primo frame, annulla i timer e ignora il rientro sintetico del mouse', () => {
  const { rows, window, Dialog, frame, timers } = setup();
  rows.forEach((row) => {
    row.emit('pointerenter', mouse);
    row.emit('pointerdown', mouse);
  });
  window.emit('pointerup');
  assert.equal(timers.size, 2);
  const dialog = new Dialog();
  const before = positions(rows);
  frame();
  assert.deepEqual(positions(rows), before);
  dialog.close();
  assert.equal(timers.size, 0);
  rows.forEach((row) => row.emit('pointerenter', mouse));
  frame();
  assertMoving(rows, before);
  // Dopo un'uscita e un nuovo ingresso, l'hover torna a fermare la fila.
  rows.forEach((row) => { row.emit('pointerleave', mouse); row.emit('pointerenter', mouse); });
  const after = positions(rows);
  frame();
  assert.deepEqual(positions(rows), after);
});

test('un trascinamento interrotto non resta attivo dopo la chiusura', () => {
  const { rows, window, Dialog, frame } = setup();
  rows.forEach((row) => row.emit('pointerdown', mouse));
  window.emit('pointermove', { ...mouse, clientX: 170 });
  assert.ok(rows.every((row) => row.classList.contains('trascinando')));
  const dialog = new Dialog();
  dialog.close();
  const before = positions(rows);
  window.emit('pointermove', { ...mouse, clientX: 900 });
  assert.deepEqual(positions(rows), before);
  assert.ok(rows.every((row) => !row.classList.contains('trascinando')));
  frame();
  assertMoving(rows, before);
});

test('la ripresa aspetta che anche l’ultima modale sia chiusa', () => {
  const { rows, Dialog, frame } = setup();
  const first = new Dialog();
  const last = new Dialog();
  const before = positions(rows);
  first.close();
  frame();
  assert.deepEqual(positions(rows), before);
  last.close();
  frame();
  assertMoving(rows, before);
});

test('il movimento ridotto resta rispettato anche dopo una modale', () => {
  const { rows, Dialog, frame } = setup({ reducedMotion: true });
  const before = positions(rows);
  new Dialog().close();
  frame();
  assert.deepEqual(positions(rows), before);
});
