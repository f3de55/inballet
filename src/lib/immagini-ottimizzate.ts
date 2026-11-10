import { createHash } from 'node:crypto';
import { nonTrovato } from './storage';

const LATO_MASSIMO = 2560;
const BYTE_MASSIMI = 64 * 1024 * 1024;
const NUOVE_AL_MINUTO = 90;
const FORMATI = ['webp', 'jpg', 'jpeg', 'png'];
const PARAMETRI = ['href', 'w', 'h', 'f', 'fit'];

interface Voce {
  corpo: Uint8Array<ArrayBuffer>;
  tipo: string;
  etag: string;
}

const pronte = new Map<string, Voce>();
const inCorso = new Map<string, Promise<Voce | null>>();
let byte = 0;
let minuto = { da: 0, nuove: 0 };

const hrefValido = (href: string) => /^\/_astro\/[^/\\?#]+$/.test(href) && !href.includes('..');

function chiaveDi(p: URLSearchParams): string | null {
  const lato = (k: string) => !p.has(k) || (/^[1-9]\d{0,3}$/.test(p.get(k)!) && Number(p.get(k)) <= LATO_MASSIMO);
  const valida =
    [...p.keys()].every((k) => PARAMETRI.includes(k)) && lato('w') && lato('h') && FORMATI.includes(p.get('f') ?? '') && (p.get('fit') ?? 'cover') === 'cover';
  return valida ? PARAMETRI.map((k) => `${k}=${p.get(k) ?? ''}`).join('&') : null;
}

function nuovaAmmessa(): boolean {
  const ora = Date.now();
  if (ora - minuto.da >= 60_000) minuto = { da: ora, nuove: 0 };
  return minuto.nuove++ < NUOVE_AL_MINUTO;
}

function conserva(chiave: string, voce: Voce) {
  pronte.set(chiave, voce);
  byte += voce.corpo.byteLength;
  for (const [k, v] of pronte) {
    if (byte <= BYTE_MASSIMI) break;
    pronte.delete(k);
    byte -= v.corpo.byteLength;
  }
}

async function crea(chiave: string, genera: () => Promise<Response>): Promise<Voce | null> {
  const res = await genera();
  if (!res.ok) return null;
  const corpo = new Uint8Array(await res.arrayBuffer());
  const voce = {
    corpo,
    tipo: res.headers.get('content-type') ?? 'application/octet-stream',
    etag: `"${createHash('sha1').update(corpo).digest('base64url')}"`,
  };
  conserva(chiave, voce);
  return voce;
}

export async function immagineOttimizzata(request: Request, url: URL, genera: () => Promise<Response>): Promise<Response> {
  const href = url.searchParams.get('href') ?? '';
  if (!hrefValido(href)) return nonTrovato();
  const originale = () => new Response(null, { status: 302, headers: { Location: encodeURI(href), 'Cache-Control': 'no-store' } });
  const chiave = chiaveDi(url.searchParams);
  if (!chiave) return originale();

  let voce = pronte.get(chiave) ?? null;
  if (voce) {
    pronte.delete(chiave);
    pronte.set(chiave, voce);
  } else {
    let lavoro = inCorso.get(chiave);
    if (!lavoro) {
      if (!nuovaAmmessa()) return originale();
      lavoro = crea(chiave, genera)
        .catch(() => null)
        .finally(() => inCorso.delete(chiave));
      inCorso.set(chiave, lavoro);
    }
    voce = await lavoro;
  }
  if (!voce) return nonTrovato();

  const intestazioni = { 'Content-Type': voce.tipo, 'Cache-Control': 'public, max-age=31536000, immutable', ETag: voce.etag };
  if (request.headers.get('if-none-match') === voce.etag) return new Response(null, { status: 304, headers: intestazioni });
  return new Response(voce.corpo, { headers: intestazioni });
}
