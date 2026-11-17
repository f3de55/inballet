import type { APIRoute } from 'astro';
import { isLoggedIn } from '../../lib/auth';
import { leggiProposte } from '../../lib/revisione';

export const prerender = false;

const COLONNE = [
  'Data',
  'Pagina',
  'Indirizzo',
  'Sezione del testo',
  'Testo',
  'Sezione di immagini e video',
  'Immagini e video',
  'Google Fogli',
  'Email',
] as const;

const cella = (valore: string) => `"${valore.replace(/"/g, '""')}"`;

export const GET: APIRoute = async ({ session }) => {
  if (!(await isLoggedIn(session))) return new Response('Accesso riservato', { status: 401 });
  const righe = (await leggiProposte()).map((p) =>
    [p.data, p.pagina, p.indirizzo, p.sezioneTesto, p.testo, p.sezioneFile, p.file.map((f) => `${f.nome}: ${f.url}`).join('\n'), p.foglio, p.email]
      .map(cella)
      .join(';'),
  );
  return new Response(`﻿${[COLONNE.map(cella).join(';'), ...righe].join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="revisioni-inballet.csv"',
      'Cache-Control': 'no-store',
    },
  });
};
