/**
 * Content collections. `corsi`: le 22 pagine corso, una voce per corso in
 * src/data/corsi.json (la chiave è lo slug della pagina, es. "hip-hop").
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const corsi = defineCollection({
  loader: file('src/data/corsi.json'),
  schema: z.object({
    // <head>
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    // Hero
    badge: z.string(),
    titolo: z.string(),
    tagline: z.string(),
    heroImage: z.string(),
    // Intro (HTML)
    introImage: z.string(),
    intro: z.string(),
    eta: z.string(),
    frequenza: z.string(),
    // Metodo e obiettivi
    metodoTitolo: z.string(),
    metodo: z.array(z.object({ titolo: z.string(), testo: z.string() })),
    imparaTitolo: z.string(),
    impara: z.array(z.string()),
  }),
});

export const collections = { corsi };
