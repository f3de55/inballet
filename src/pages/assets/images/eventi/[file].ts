/**
 * GET /assets/images/eventi/<file> — serve le locandine caricate dalla
 * dashboard (salvate fuori da dist/, in DATA_DIR/uploads/eventi).
 */
import { readFile, stat } from 'node:fs/promises';
import type { APIRoute } from 'astro';
import { filePath, MIME, safeName } from '../../../../lib/uploads';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const nome = safeName(params.file ?? '');
  if (!nome) return new Response('Not found', { status: 404 });
  try {
    const st = await stat(filePath(nome));
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      'Content-Type': MIME[nome.split('.').pop()!.toLowerCase()],
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      ETag: etag,
    };
    if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
    return new Response(await readFile(filePath(nome)), { headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
