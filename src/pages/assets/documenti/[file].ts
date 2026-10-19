/**
 * GET /assets/documenti/<file> — serve i PDF caricati dalla dashboard
 * (salvati fuori da dist/, in DATA_DIR/uploads/documenti).
 */
import { readFile, stat } from 'node:fs/promises';
import type { APIRoute } from 'astro';
import { nomePdfSicuro, percorsoPdf } from '../../../lib/documenti';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const nome = nomePdfSicuro(params.file ?? '');
  if (!nome) return new Response('Not found', { status: 404 });
  try {
    const st = await stat(percorsoPdf(nome));
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nome}"`,
      // Il nome cambia a ogni nuovo caricamento: si può tenere in cache a lungo
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      ETag: etag,
    };
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
    return new Response(await readFile(percorsoPdf(nome)), { headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
