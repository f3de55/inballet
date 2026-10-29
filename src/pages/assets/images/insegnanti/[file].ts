/**
 * GET /assets/images/insegnanti/<file> — serve le foto degli insegnanti caricate
 * dalla dashboard (salvate fuori da dist/, in DATA_DIR/uploads/insegnanti).
 */
import { readFile, stat } from 'node:fs/promises';
import type { APIRoute } from 'astro';
import { nomeFotoSicuro, percorsoFoto } from '../../../../lib/insegnanti';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const nome = nomeFotoSicuro(params.file ?? '');
  if (!nome) return new Response('Not found', { status: 404 });
  try {
    const st = await stat(percorsoFoto(nome));
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      'Content-Type': 'image/webp',
      // Il nome cambia a ogni nuovo caricamento: si può tenere in cache a lungo
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      ETag: etag,
    };
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
    return new Response(await readFile(percorsoFoto(nome)), { headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
