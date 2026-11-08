import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

const container = `inballet-demo-test-${process.pid}`;
const dataDir = '/tmp/inballet-demo-test';
const original = 'demo-2026-11-05-aabbcc.jpg';
const miniature = 'demo-2026-11-05-aabbcc.mini.webp';
const missing = 'demo-2026-11-06-ddeeff.jpg';
const real = 'demo-2026-11-07-112233.jpg';
const legacy = 'demo-2026-11-08-445566.jpg';
const longTitle = 'demo-2026-11-09-778899.jpg';
const prefix = '/assets/images/eventi/';
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const inside = (source) => execFileSync('docker', ['exec', '-i', container, 'node', '--input-type=module'], { input: source, encoding: 'utf8' }).trim();

test('locandine demo: file persi, miniature e generazione nel runtime Docker', { timeout: 180_000 }, async (t) => {
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
      'DASHBOARD_PASSWORD=demo-image-test-only',
      'inballet-site',
    );
    started = true;
    const port = docker('port', container, '8080/tcp').split(':').at(-1);
    const base = `http://127.0.0.1:${port}`;
    const url = (name) => base + prefix + name;
    for (let i = 0; ; i++) {
      try {
        docker('exec', container, 'wget', '-q', '-O', '/dev/null', 'http://127.0.0.1:8080/login');
        break;
      } catch {}
      if (i >= 40) throw new Error('Il container di test non risponde');
      await setTimeout(250);
    }

    const fixture = (id, file, demo = true) => ({
      id,
      slug: id,
      titolo: 'Workshop di danza contemporanea',
      data: '2026-11-05',
      ora: '10:30',
      dataFine: '',
      oraFine: '',
      stato: 'pubblicato',
      tipo: 'Workshop',
      luogo: 'Sede di Rho, Via Tevere 19',
      descrizione: 'Evento di verifica',
      immagine: prefix.slice(1) + file,
      destinatari: '',
      costo: '',
      prenotazione: '',
      creato: '2026-11-05T10:00:00+01:00',
      modificato: '2026-11-05T10:00:00+01:00',
      demo,
    });
    const events = [
      fixture('demo-originale', original),
      fixture('demo-libreria', missing),
      fixture('evento-reale', real, false),
      { ...fixture('demo-legacy', legacy), titolo: 'Lezione di prova di Breaking', tipo: 'Lezione di prova' },
      { ...fixture('demo-titolo-lungo', longTitle), titolo: 'Incontro di danza, musica e movimento & scoperta '.repeat(5).slice(0, 200) },
    ];
    inside(
      `import fs from 'node:fs'; fs.mkdirSync('${dataDir}', { recursive: true }); fs.writeFileSync('${dataDir}/eventi.json', ${JSON.stringify(JSON.stringify(events))}); fs.writeFileSync('${dataDir}/tipi_evento.json', '["Workshop"]');`,
    );
    const snapshot = inside(`import fs from 'node:fs'; process.stdout.write(fs.readFileSync('${dataDir}/eventi.json', 'utf8'));`);

    const loginPage = await fetch(base + '/login');
    const form = /<form[^>]+action="([^"]+)"/.exec(await loginPage.text());
    assert.ok(form, 'Form login presente');
    const login = await fetch(new URL(form[1].replaceAll('&amp;', '&'), base + '/login'), {
      method: 'POST',
      redirect: 'manual',
      headers: { Origin: base, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ password: 'demo-image-test-only' }),
    });
    assert.ok(login.status === 302 || login.status === 303, 'Login nel container di test riuscito');
    const cookie = login.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    assert.ok(cookie, 'Sessione del test ricevuta');
    const action = (name, input = {}) =>
      fetch(base + '/_actions/' + name, {
        method: 'POST',
        headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

    await t.test('la libreria elenca i demo recuperabili prima che esistano i file', async () => {
      const response = await action('immagini.lista');
      assert.equal(response.status, 200);
      const body = await response.text();
      assert.ok(body.includes(original) && body.includes(missing));
      assert.ok(!body.includes(real), 'Nessuna immagine inventata per eventi reali');
    });

    await t.test('originale e miniatura si recuperano anche con richieste simultanee', async () => {
      const responses = await Promise.all([original, miniature, original, miniature].map((name) => fetch(url(name))));
      for (const [index, response] of responses.entries()) {
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), index % 2 ? 'image/webp' : 'image/jpeg');
        assert.ok((await response.arrayBuffer()).byteLength > 1000);
      }
      const metadata = JSON.parse(
        inside(
          `import sharp from 'sharp'; const full=await sharp('${dataDir}/uploads/eventi/${original}').metadata(); const mini=await sharp('${dataDir}/uploads/eventi/${miniature}').metadata(); const stats=await sharp('${dataDir}/uploads/eventi/${original}').stats(); console.log(JSON.stringify({full:[full.width,full.height],mini:[mini.width,mini.height],deviation:stats.channels[0].stdev}));`,
        ),
      );
      assert.deepEqual(metadata.full, [1080, 1350]);
      assert.ok(Math.max(...metadata.mini) <= 480);
      assert.ok(metadata.deviation > 10, 'Locandina effettivamente disegnata, non un rettangolo vuoto');
      assert.equal(
        inside(`import fs from 'node:fs'; process.stdout.write(fs.readFileSync('${dataDir}/eventi.json', 'utf8'));`),
        snapshot,
        'Recupero senza modificare eventi o riferimenti',
      );
    });

    await t.test('la miniatura mancante si rigenera senza sostituire la locandina', async () => {
      const before = Buffer.from(await (await fetch(url(original))).arrayBuffer());
      inside(`import fs from 'node:fs'; fs.unlinkSync('${dataDir}/uploads/eventi/${miniature}');`);
      assert.equal((await fetch(url(miniature))).status, 200);
      assert.deepEqual(Buffer.from(await (await fetch(url(original))).arrayBuffer()), before);
      const response = await fetch(url(original));
      assert.equal((await fetch(url(original), { headers: { 'If-None-Match': response.headers.get('etag') } })).status, 304);
    });

    await t.test('immagini reali mancanti e nomi demo non associati restano 404', async () => {
      assert.equal((await fetch(url(real))).status, 404);
      assert.equal((await fetch(url('demo-2026-11-05-ffffff.jpg'))).status, 404);
    });

    await t.test('si recuperano anche vecchi modelli e titoli modificati o molto lunghi', async () => {
      for (const name of [legacy, longTitle]) {
        const response = await fetch(url(name));
        assert.equal(response.status, 200);
        assert.ok((await response.arrayBuffer()).byteLength > 1000);
      }
    });

    await t.test('un demo ancora senza file può essere tolto dalla libreria', async () => {
      const response = await action('immagini.elimina', { nome: missing });
      assert.ok(response.ok);
      const updated = JSON.parse(inside(`import fs from 'node:fs'; process.stdout.write(fs.readFileSync('${dataDir}/eventi.json', 'utf8'));`));
      assert.equal(updated.find((e) => e.id === 'demo-libreria').immagine, '');
      assert.equal(updated.find((e) => e.id === 'evento-reale').immagine, prefix.slice(1) + real);
      assert.equal((await fetch(url(missing))).status, 404);
    });

    await t.test('anche i nuovi eventi demo hanno originale e miniatura validi', async () => {
      const response = await action('demo.eventi', { quanti: 1 });
      assert.equal(response.status, 200);
      const updated = JSON.parse(inside(`import fs from 'node:fs'; process.stdout.write(fs.readFileSync('${dataDir}/eventi.json', 'utf8'));`));
      const generated = updated.find((e) => !events.some((fixture) => fixture.id === e.id));
      assert.ok(generated?.demo && generated.immagine);
      const name = generated.immagine.split('/').at(-1);
      assert.equal((await fetch(url(name))).status, 200);
      assert.equal((await fetch(url(name.replace(/\.jpg$/, '.mini.webp')))).status, 200);
    });
  } finally {
    if (started) docker('stop', container);
  }
});
