import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/carosello.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

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
    constructor() {
      dialogs.push(this);
    }
    close() {
      this.open = false;
      document.emit('close', { target: this }, true);
    }
  }
  const rows = Array.from({ length: 2 }, () => {
    const row = new Target();
    const classes = new Set();
    const track = { scrollWidth: 2000, style: {}, querySelectorAll: () => [] };
    Object.assign(row, {
      dataset: { giro: '40' },
      scrollLeft: 0,
      classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value), contains: (value) => classes.has(value) },
      querySelector: () => track,
      contains: (target) => target === row,
    });
    return row;
  });
  document.hidden = false;
  document.querySelectorAll = () => rows;
  document.querySelector = () => dialogs.find((dialog) => dialog.open) ?? null;
  document.elementFromPoint = (x, y) => {
    if (x < 0 || x >= 400) return null;
    return rows.find((_, index) => y >= 100 + index * 200 && y < 200 + index * 200) ?? null;
  };
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
    window,
    document,
    HTMLDialogElement: Dialog,
    exports: {},
    performance: { now: () => now },
    requestAnimationFrame: (callback) => frames.push(callback),
    setTimeout,
    clearTimeout: (id) => timers.delete(id),
    setInterval: () => 0,
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        this.callback([{ isIntersecting: true }]);
      }
    },
  });
  const frame = (elapsed = 16) => {
    now += elapsed;
    for (const [id, timer] of timers) {
      if (timer.at <= now) {
        timers.delete(id);
        timer.callback();
      }
    }
    const pending = frames;
    frames = [];
    pending.forEach((callback) => callback(now));
  };
  frame();
  frame();
  return { rows, window, Dialog, frame, timers };
}

const mouse = { pointerType: 'mouse', button: 0, clientX: 200, clientY: 150 };
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

test('chiudendo con il mouse già sulle card la fila resta ferma senza uscire e rientrare', () => {
  const { rows, window, Dialog, frame, timers } = setup();
  rows[0].emit('pointerenter', mouse);
  rows[0].emit('pointerdown', mouse);
  window.emit('pointerup');
  assert.equal(timers.size, 1);
  const dialog = new Dialog();
  rows[0].emit('pointerleave', mouse);
  window.emit('pointermove', mouse);
  const before = positions(rows);
  frame();
  assert.deepEqual(positions(rows), before);
  dialog.close();
  assert.equal(timers.size, 0);
  frame();
  assert.equal(rows[0].scrollLeft, before[0]);
  assert.ok(rows[1].scrollLeft > before[1]);
  frame(2200);
  assert.equal(rows[0].scrollLeft, before[0]);
  rows[0].emit('pointerleave', mouse);
  window.emit('pointermove', { ...mouse, clientY: 700 });
  const outside = positions(rows);
  frame();
  assertMoving(rows, outside);
});

test('chiudendo fuori dalle card entrambe le file ripartono al primo frame', () => {
  const { rows, window, Dialog, frame } = setup();
  rows[0].emit('pointerenter', mouse);
  const dialog = new Dialog();
  window.emit('pointermove', { ...mouse, clientY: 700 });
  const before = positions(rows);
  dialog.close();
  frame();
  assertMoving(rows, before);
});

test('il puntatore sulla seconda fila ferma quella fila anche se la modale è partita dalla prima', () => {
  const { rows, window, Dialog, frame } = setup();
  rows[0].emit('pointerenter', mouse);
  const dialog = new Dialog();
  window.emit('pointermove', { ...mouse, clientY: 350 });
  const before = positions(rows);
  dialog.close();
  frame();
  assert.ok(rows[0].scrollLeft > before[0]);
  assert.equal(rows[1].scrollLeft, before[1]);
});

test('una chiusura touch non eredita la pausa del mouse usato prima', () => {
  const { rows, window, Dialog, frame } = setup();
  rows[0].emit('pointerenter', mouse);
  const dialog = new Dialog();
  window.emit('pointerdown', { ...mouse, pointerType: 'touch' });
  const before = positions(rows);
  dialog.close();
  frame();
  assertMoving(rows, before);
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
  window.emit('pointermove', { ...mouse, clientY: 700 });
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
