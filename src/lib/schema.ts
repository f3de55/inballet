/**
 * Dati strutturati Schema.org (JSON-LD) generati dai dati ufficiali della
 * scuola: una DanceSchool principale (sede di Lainate) con la sede di Rho come
 * reparto, catalogo corsi e FAQ.
 */
import { categorieCorsi, faq, FONDAZIONE, orari, scuola, sedi, type Sede } from '../data/scuola';

const site = scuola.sito;
const ID = `${site}/#scuola`;

const indirizzo = (s: Sede) => ({
  '@type': 'PostalAddress',
  streetAddress: s.via,
  addressLocality: s.citta,
  postalCode: s.cap,
  addressRegion: s.provincia,
  addressCountry: 'IT',
});

const orariSchema = orari.map((o) => ({
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: o.giorni,
  opens: o.apre,
  closes: o.chiude,
}));

/** JSON-LD di una pagina corso: il corso, tenuto in sede a Lainate e Rho dalla scuola. */
export function schemaCorso(corso: { titolo: string; description: string; eta: string; frequenza: string; impara: string[] }, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${url}#corso`,
    name: corso.titolo,
    description: corso.description,
    url,
    inLanguage: 'it-IT',
    provider: { '@type': 'DanceSchool', '@id': ID, name: scuola.nome, url: `${site}/` },
    audience: { '@type': 'PeopleAudience', audienceType: corso.eta },
    teaches: corso.impara,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      courseSchedule: { '@type': 'Schedule', description: corso.frequenza },
      location: sedi.map((s) => ({ '@type': 'Place', name: `${scuola.nome} - ${s.citta}`, address: indirizzo(s) })),
    },
  };
}

/** Grafo JSON-LD della homepage. */
export function schemaHome(immagine: string) {
  const [principale, ...altre] = sedi;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DanceSchool',
        '@id': ID,
        name: scuola.nome,
        legalName: scuola.ragioneSociale,
        taxID: scuola.codiceFiscale,
        alternateName: scuola.nomiAlternativi,
        description:
          'Scuola di danza multidisciplinare a Lainate e Rho (MI): danza classica, modern, contemporanea, hip-hop, breaking, yoga e pilates per bambini dai 3 anni, ragazzi e adulti. Ente formativo CSEN e CONI per insegnanti di danza.',
        url: `${site}/`,
        logo: `${site}/assets/images/logo.png`,
        image: immagine,
        telephone: scuola.telefonoSchema,
        email: scuola.email,
        foundingDate: String(FONDAZIONE),
        founder: { '@type': 'Person', name: scuola.fondatrice },
        address: indirizzo(principale),
        ...(principale.geo && {
          geo: { '@type': 'GeoCoordinates', latitude: principale.geo.lat, longitude: principale.geo.lng },
        }),
        openingHoursSpecification: orariSchema,
        areaServed: sedi.map((s) => ({ '@type': 'City', name: s.citta })),
        sameAs: Object.values(scuola.social),
        department: altre.map((s) => ({
          '@type': 'DanceSchool',
          '@id': `${site}/#sede-${s.id}`,
          name: `${scuola.nome} - ${s.citta}`,
          address: indirizzo(s),
          telephone: scuola.telefonoSchema,
          parentOrganization: { '@id': ID },
        })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Corsi di danza',
          itemListElement: categorieCorsi.map((cat) => ({
            '@type': 'OfferCatalog',
            name: cat.nome,
            itemListElement: cat.corsi.map((c) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: c.nome, url: `${site}${c.url}`, provider: { '@id': ID } },
            })),
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site}/#sito`,
        url: `${site}/`,
        name: 'InBallet',
        inLanguage: 'it-IT',
        publisher: { '@id': ID },
      },
      {
        '@type': 'FAQPage',
        '@id': `${site}/#faq`,
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.domanda,
          acceptedAnswer: { '@type': 'Answer', text: f.risposta },
        })),
      },
    ],
  };
}
