/**
 * GET /spettacoli-eventi/<slug>/calendario.ics — file iCalendar di un evento
 * ("Apple / Outlook" nella pagina dell'evento). Servito dal server con il tipo
 * giusto: su iPhone si apre direttamente "Aggiungi al calendario".
 */
import type { APIRoute } from 'astro';
import { fileIcs, trovaEvento } from '../../../lib/eventi';

export const prerender = false;

export const GET: APIRoute = async ({ params, site, url }) => {
  const trovato = await trovaEvento(params.slug ?? '');
  if (!trovato || trovato.evento.stato === 'bozza') return new Response('Not found', { status: 404 });
  const e = trovato.evento;
  return new Response(fileIcs(e, site ?? new URL(url.origin)), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${e.slug}.ics"`,
      'Cache-Control': 'no-cache',
    },
  });
};
