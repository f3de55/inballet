import type { APIRoute } from 'astro';
import { isLoggedIn } from '../../lib/auth';
import { SITO_ATTUALE, SITO_OGGI } from '../../data/presentazione';

export const prerender = false;

interface Copia {
  stato: number;
  tipo: string;
  corpo: Uint8Array;
  scade: number;
}

const ORIGINE = new URL(SITO_ATTUALE);
const DURATA = 60 * 60 * 1000;
const PESO_MASSIMO = 60 * 1024 * 1024;
const FILE_MASSIMO = 8 * 1024 * 1024;
const FERMO = '<style>*,*::before,*::after{animation:none!important;transition:none!important}.hidden.animated{visibility:visible!important}</style>';

const copie = new Map<string, Copia>();
const inCorso = new Map<string, Promise<Copia | null>>();
let peso = 0;

function conserva(chiave: string, copia: Copia) {
  if (copia.corpo.byteLength > FILE_MASSIMO) return;
  const vecchia = copie.get(chiave);
  if (vecchia) peso -= vecchia.corpo.byteLength;
  copie.set(chiave, copia);
  peso += copia.corpo.byteLength;
  for (const [altra, c] of copie) {
    if (peso <= PESO_MASSIMO) break;
    copie.delete(altra);
    peso -= c.corpo.byteLength;
  }
}

async function scarica(indirizzo: URL): Promise<Copia | null> {
  const risposta = await fetch(indirizzo, { headers: { accept: '*/*' } }).catch(() => null);
  if (!risposta || new URL(risposta.url).host !== ORIGINE.host) return null;
  const tipo = risposta.headers.get('content-type') ?? 'application/octet-stream';
  let corpo = new Uint8Array(await risposta.arrayBuffer());
  if (tipo.startsWith('text/html')) {
    const html = new TextDecoder().decode(corpo).replace(/<head(\s[^>]*)?>/i, (testa) => `${testa}<base href="${SITO_OGGI}/">${FERMO}`);
    corpo = new TextEncoder().encode(html);
  }
  return { stato: risposta.status, tipo, corpo, scade: Date.now() + DURATA };
}

async function copia(indirizzo: URL) {
  const chiave = indirizzo.href;
  const pronta = copie.get(chiave);
  if (pronta && pronta.scade > Date.now()) return pronta;
  const attesa = inCorso.get(chiave) ?? scarica(indirizzo).finally(() => inCorso.delete(chiave));
  inCorso.set(chiave, attesa);
  const nuova = await attesa;
  if (nuova?.stato === 200) conserva(chiave, nuova);
  return nuova;
}

export const GET: APIRoute = async ({ params, url, session }) => {
  if (!(await isLoggedIn(session))) return new Response('Forbidden', { status: 403 });
  const indirizzo = new URL(`${params.percorso ?? ''}${url.search}`, `${SITO_ATTUALE}/`);
  if (indirizzo.host !== ORIGINE.host) return new Response('Not found', { status: 404 });
  const c = await copia(indirizzo);
  if (!c) return new Response('Bad gateway', { status: 502 });
  return new Response(c.corpo, {
    status: c.stato,
    headers: { 'Content-Type': c.tipo, 'Cache-Control': 'private, max-age=86400', 'X-Robots-Tag': 'noindex' },
  });
};
