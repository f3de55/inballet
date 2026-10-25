/**
 * Content collections. `corsi`: le 22 pagine corso, una voce per corso in
 * src/data/corsi.json (la chiave è lo slug della pagina, es. "hip-hop").
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/** Punto focale per desktop, tablet e mobile (vedi Fuoco in src/lib/images.ts). */
const fuoco = z.object({ desktop: z.string(), tablet: z.string(), mobile: z.string() }).partial().optional();

/** Una foto per tutti i formati, o foto diverse per desktop/tablet/mobile (vedi Sorgenti in src/lib/images.ts). */
const sorgenti = z.union([z.string(), z.object({ desktop: z.string(), tablet: z.string().optional(), mobile: z.string().optional() })]);

const corsi = defineCollection({
  loader: file('src/data/corsi.json'),
  schema: z.object({
    // <head>
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    // Hero
    badge: z.string(),
    titolo: z.string(),
    tagline: z.string(),
    /** Foto dell'hero: stringa, oppure { desktop, tablet, mobile } (tablet: 601-900px, mobile: <=600px). */
    heroImage: sorgenti,
    /** Punto focale dell'hero per formato (CSS position, es. "100% 30%" per banner con soggetto a destra). */
    heroFuoco: fuoco,
    // Intro (HTML)
    /** Titolo della sezione intro (HTML, con <em> per l'accento), es. "Cos'è l'<em>Hip-Hop</em>". */
    introTitolo: z.string().optional(),
    introImage: z.string(),
    /** Descrizione della foto dell'intro (alt). */
    introAlt: z.string(),
    introFuoco: fuoco,
    intro: z.string(),
    eta: z.string(),
    frequenza: z.string(),
    // Metodo e obiettivi
    metodoTitolo: z.string(),
    metodo: z.array(z.object({ titolo: z.string(), testo: z.string() })),
    imparaTitolo: z.string(),
    impara: z.array(z.string()),
    /** Sfondo della sezione contatti in fondo alla pagina (default: foto generica della scuola): stringa, oppure { desktop, tablet, mobile }. */
    ctaImage: sorgenti.optional(),
    ctaFuoco: fuoco,
  }),
});

export const collections = { corsi };
