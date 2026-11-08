import type { APIRoute } from 'astro';
import { nomeFotoSicuro, percorsoFoto } from '../../../../lib/insegnanti';
import { nonTrovato, serviFile } from '../../../../lib/storage';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const nome = nomeFotoSicuro(params.file ?? '');
  if (!nome) return nonTrovato();
  return serviFile(percorsoFoto(nome), request, { 'Content-Type': 'image/webp' }).catch(nonTrovato);
};
