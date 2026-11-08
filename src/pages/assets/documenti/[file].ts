import type { APIRoute } from 'astro';
import { nomePdfSicuro, percorsoPdf } from '../../../lib/documenti';
import { nonTrovato, serviFile } from '../../../lib/storage';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const nome = nomePdfSicuro(params.file ?? '');
  if (!nome) return nonTrovato();
  return serviFile(percorsoPdf(nome), request, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${nome}"`,
  }).catch(nonTrovato);
};
