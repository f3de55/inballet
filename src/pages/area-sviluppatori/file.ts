import type { APIRoute } from 'astro';
import { isSviluppatore } from '../../lib/auth';
import { leggi, prepara } from '../../lib/sviluppatori/deposito';

export const prerender = false;

const TIPI: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  pdf: 'application/pdf',
  woff2: 'font/woff2',
};

export const GET: APIRoute = async ({ session, url }) => {
  if (!(await isSviluppatore(session))) return new Response('Accesso riservato', { status: 401 });
  const percorso = url.searchParams.get('p') ?? '';
  const estensione = (percorso.split('.').pop() ?? '').toLowerCase();
  try {
    await prepara();
    const dati = await leggi(percorso);
    const scarica = url.searchParams.has('scarica');
    return new Response(new Uint8Array(dati), {
      headers: {
        'Content-Type': TIPI[estensione] ?? 'application/octet-stream',
        'Content-Security-Policy': 'sandbox',
        'Cache-Control': 'no-store',
        ...(scarica && { 'Content-Disposition': `attachment; filename="${encodeURIComponent(percorso.split('/').pop() ?? 'file')}"` }),
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
