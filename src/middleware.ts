/**
 * - Compatibilità con i vecchi URL PHP: /chi-siamo.php → /chi-siamo (301).
 * - Le Actions accettano solo richieste dallo stesso sito (oltre al controllo
 *   Origin di Astro sui form, copre anche le chiamate JSON).
 */
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { request, url } = context;

  const php = /^\/(.+)\.php$/.exec(url.pathname);
  if (php && request.method === 'GET') {
    const page = php[1] === 'index' ? '' : php[1];
    return context.redirect(`/${page}${url.search}`, 301);
  }

  if (request.method === 'POST' && url.pathname.startsWith('/_actions/')) {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return new Response('Forbidden', { status: 403 });
  }

  return next();
});
