import { defineMiddleware } from 'astro:middleware';

const vecchieHtml: Record<string, string> = {
  avviamento_alla_danza: '/avviamento-danza',
  educazione_alla_danza: '/educazione-danza',
  danza_classica_accademica: '/danza-classica',
  danza_contemporanea: '/danza-contemporanea',
  danza_contemporanea_adulti: '/contemporanea-adulti',
  contact_improvisation: '/contact-improvisation',
  movimento_creativo: '/movimento-creativo',
  hip_hop: '/hip-hop',
  danza_acrobatica: '/danza-acrobatica',
  classi_multidisciplinari_integrate: '/classi-integrate',
  progetto_noiconvoi: '/progetto-noiconvoi',
  sportello_psicologico: '/sportello-psicologico',
  sostenitori_progetti_sociali: '/sostenitori',
  lezioni_individuali: '/lezioni-individuali',
  corso_di_formazione_per_insegnanti_di_danza: '/formazione-insegnanti',
  formazioni_personalizzate: '/formazioni-personalizzate',
  spettacoli_ed_eventi: '/spettacoli-eventi',
  collaborazioni_con_scuole: '/collaborazioni-scuole',
};

export const onRequest = defineMiddleware((context, next) => {
  const { request, url } = context;

  if (request.method === 'GET') {
    const php = /^\/(.+)\.php$/.exec(url.pathname);
    if (php) {
      const page = php[1] === 'index' ? '' : php[1];
      return context.redirect(`/${page}${url.search}`, 301);
    }

    const html = /^\/([\w-]+)\.html$/.exec(url.pathname);
    const nuova = html && vecchieHtml[html[1].toLowerCase()];
    if (nuova) return context.redirect(`${nuova}${url.search}`, 301);
  }

  if (request.method === 'POST' && url.pathname.startsWith('/_actions/')) {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return new Response('Forbidden', { status: 403 });
  }

  return next();
});
