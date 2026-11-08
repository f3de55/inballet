/**
 * GET /assets/images/eventi/<file> — serve le locandine caricate dalla
 * dashboard (salvate fuori da dist/, in DATA_DIR/uploads/eventi).
 * Una locandina demo persa viene rigenerata al volo.
 */
import { access } from 'node:fs/promises';
import type { APIRoute } from 'astro';
import { nonTrovato, serviFile } from '../../../../lib/storage';
import { filePath, MIME, safeName } from '../../../../lib/uploads';

export const prerender = false;

const manca = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

export const GET: APIRoute = async ({ params, request }) => {
  const nome = safeName(params.file ?? '');
  if (!nome) return nonTrovato();
  try {
    await access(filePath(nome)).catch(async (e) => {
      if (!manca(e) || !nome.startsWith('demo-')) throw e;
      const { ripristinaLocandinaDemo } = await import('../../../../lib/demo');
      if (!(await ripristinaLocandinaDemo(nome))) throw e;
    });
    return await serviFile(filePath(nome), request, { 'Content-Type': MIME[nome.split('.').pop()!.toLowerCase()] });
  } catch (e) {
    if (manca(e)) return nonTrovato();
    console.error('Errore caricamento locandina', nome, e);
    return new Response('Image unavailable', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
};
