import { categorieCorsi, faqHome, FONDAZIONE, scuola, sedi, type Sede } from '../data/scuola';
import { stripTags } from './text';

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
    teaches: corso.impara.map((t) => stripTags(t)),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      courseSchedule: { '@type': 'Schedule', description: corso.frequenza },
      location: sedi.map((s) => ({ '@type': 'Place', name: `${scuola.nome} - ${s.citta}`, address: indirizzo(s) })),
    },
  };
}

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
        description: `Scuola di danza multidisciplinare a Lainate e Rho (MI), fondata nel ${FONDAZIONE} da ${scuola.fondatrice}: danza classica, modern, contemporanea, hip-hop, breaking, yoga e pilates per bambini dai 3 anni, ragazzi e adulti. Classi integrate, progetto NoiConVoi per persone con disabilità ed ente formativo CSEN e CONI per insegnanti di danza.`,
        url: `${site}/`,
        logo: `${site}/assets/images/logo.png`,
        image: immagine,
        telephone: scuola.telefonoSchema,
        email: scuola.email,
        foundingDate: String(FONDAZIONE),
        founder: { '@type': 'Person', name: scuola.fondatrice, jobTitle: 'Direttrice Artistica' },
        address: indirizzo(principale),
        ...(principale.geo && {
          geo: { '@type': 'GeoCoordinates', latitude: principale.geo.lat, longitude: principale.geo.lng },
        }),
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
        mainEntity: faqHome.map((f) => ({
          '@type': 'Question',
          name: f.domanda,
          acceptedAnswer: { '@type': 'Answer', text: f.risposta },
        })),
      },
    ],
  };
}
