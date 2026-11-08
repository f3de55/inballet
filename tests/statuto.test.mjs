import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { get } from 'node:http';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

const container = `inballet-statuto-test-${process.pid}`;
const dataDir = '/tmp/inballet-statuto-test';
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const inside = (source) => execFileSync('docker', ['exec', '-i', container, 'node', '--input-type=module'], { input: source, encoding: 'utf8' }).trim();
const ready = (url) =>
  new Promise((resolve) => {
    const request = get(url, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.setTimeout(1000, () => request.destroy());
    request.on('error', () => resolve(false));
  });

test('statuto: sezione pubblica e gestione del PDF nella dashboard', { timeout: 120_000 }, async (t) => {
  const keepAlive = setInterval(() => {}, 1000);
  let started = false;
  try {
    docker(
      'run',
      '-d',
      '--rm',
      '--name',
      container,
      '-p',
      '127.0.0.1::8080',
      '-e',
      `DATA_DIR=${dataDir}`,
      '-e',
      'DASHBOARD_PASSWORD=statuto-test-only',
      'inballet-site',
    );
    started = true;
    const base = `http://127.0.0.1:${docker('port', container, '8080/tcp').split(':').at(-1)}`;
    for (let i = 0; ; i++) {
      if (await ready(base + '/login')) break;
      if (i >= 80) throw new Error('Il container di test non risponde');
      await setTimeout(250);
    }

    const page = () => fetch(base + '/documenti').then((r) => r.text());
    const section = (html) => /<section id="statuto"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    const before = await page();
    const modules = [...before.matchAll(/href="([^"]+\.pdf)"/g)].map((m) => m[1]);
    assert.ok(modules.length > 0, 'Moduli esistenti presenti');
    const pdf = new Blob([await (await fetch(base + modules[0])).arrayBuffer()], { type: 'application/pdf' });

    await t.test('senza PDF si mostra il contatto, senza download fittizi', () => {
      assert.match(section(before), /Richiedi lo statuto/);
      assert.match(section(before), /href="mailto:/);
      assert.doesNotMatch(section(before), /\sdownload(?:\s|=|>)/);
    });

    const loginHtml = await (await fetch(base + '/login')).text();
    const loginAction = /<form[^>]+action="([^"]+)"/.exec(loginHtml)?.[1];
    assert.ok(loginAction);
    const login = await fetch(new URL(loginAction.replaceAll('&amp;', '&'), base + '/login'), {
      method: 'POST',
      redirect: 'manual',
      headers: { Origin: base, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ password: 'statuto-test-only' }),
    });
    assert.ok([302, 303].includes(login.status));
    const cookie = login.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    assert.ok(cookie);
    const save = (fields, withFile = true) => {
      const body = new FormData();
      for (const [key, value] of Object.entries(fields)) body.append(key, value);
      if (withFile) body.append('file', pdf, 'documento-di-verifica.pdf');
      return fetch(base + '/_actions/documenti.salva', { method: 'POST', headers: { Cookie: cookie, Origin: base }, body });
    };
    const records = () => JSON.parse(inside(`import fs from 'node:fs'; console.log(fs.readFileSync('${dataDir}/documenti.json', 'utf8'));`)).documenti;
    const files = () => inside(`import fs from 'node:fs'; console.log(JSON.stringify(fs.readdirSync('${dataDir}/uploads/documenti').sort()));`);
    let statute;

    await t.test('la dashboard offre la destinazione dedicata e pubblica il PDF solo nello statuto', async () => {
      const dashboard = await (await fetch(base + '/dashboard?s=documenti', { headers: { Cookie: cookie } })).text();
      assert.match(dashboard, /id="docCategoria"/);
      assert.match(dashboard, /value="statuto"/);
      const response = await save({ titolo: 'Statuto di verifica', nota: 'Solo test isolato', categoria: 'statuto' });
      assert.equal(response.status, 200, await response.text());
      statute = records().find((d) => d.categoria === 'statuto');
      assert.ok(statute?.file);
      const html = await page();
      assert.match(section(html), /Statuto di verifica/);
      assert.match(section(html), /\sdownload(?:\s|=|>)/);
      assert.doesNotMatch(section(html), /Richiedi lo statuto/);
      assert.equal(html.split('Statuto di verifica').length - 1, 1, 'Statuto non duplicato nella modulistica');
      for (const module of modules) assert.ok(html.includes(module), 'Moduli precedenti conservati');
      const download = await fetch(base + statute.file);
      assert.equal(download.status, 200);
      assert.match(download.headers.get('content-type'), /application\/pdf/);
    });

    await t.test('un secondo statuto viene rifiutato senza salvare file aggiuntivi', async () => {
      const previousFiles = files();
      const response = await save({ titolo: 'Duplicato', nota: '', categoria: 'statuto' });
      assert.equal(response.status, 400);
      assert.equal(records().filter((d) => d.categoria === 'statuto').length, 1);
      assert.equal(files(), previousFiles);
    });

    await t.test('sostituire il PDF conserva la categoria anche senza inviarla nuovamente', async () => {
      const previous = statute.file;
      const response = await save({ id: statute.id, titolo: 'Statuto aggiornato di verifica', nota: '' });
      assert.equal(response.status, 200, await response.text());
      statute = records().find((d) => d.id === statute.id);
      assert.equal(statute.categoria, 'statuto');
      assert.notEqual(statute.file, previous);
      assert.equal((await fetch(base + previous)).status, 404);
      assert.equal((await fetch(base + statute.file)).status, 200);
      assert.match(section(await page()), /Statuto aggiornato di verifica/);
    });

    await t.test('cambiare destinazione e cancellare ripristina il contatto e preserva i moduli', async () => {
      let response = await save({ id: statute.id, titolo: statute.titolo, nota: '', categoria: 'modulo' }, false);
      assert.equal(response.status, 200, await response.text());
      let html = await page();
      assert.match(section(html), /Richiedi lo statuto/);
      assert.doesNotMatch(section(html), /Statuto aggiornato di verifica/);
      assert.ok(html.includes(statute.file));
      response = await fetch(base + '/_actions/documenti.elimina', {
        method: 'POST',
        headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: statute.id }),
      });
      assert.equal(response.status, 204, await response.text());
      html = await page();
      assert.match(section(html), /Richiedi lo statuto/);
      for (const module of modules) assert.ok(html.includes(module));
      assert.equal((await fetch(base + statute.file)).status, 404);
    });
  } finally {
    try {
      if (started) docker('stop', container);
    } finally {
      clearInterval(keepAlive);
    }
  }
});
