import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const fuoco = z.object({ desktop: z.string(), tablet: z.string(), mobile: z.string() }).partial().optional();

const sorgenti = z.union([z.string(), z.object({ desktop: z.string(), tablet: z.string().optional(), mobile: z.string().optional() })]);

const corsi = defineCollection({
  loader: file('src/data/corsi.json'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    badge: z.string(),
    titolo: z.string(),
    tagline: z.string(),
    heroImage: sorgenti,
    heroFuoco: fuoco,
    introTitolo: z.string().optional(),
    introImage: z.string(),
    introImageDesktop: z.string().optional(),
    introAlt: z.string(),
    introFuoco: fuoco,
    intro: z.string(),
    eta: z.string(),
    frequenza: z.string(),
    metodoTitolo: z.string(),
    metodo: z.array(z.object({ titolo: z.string(), testo: z.string() })),
    imparaTitolo: z.string(),
    imparaTitoli: z.array(z.string().min(1)),
    impara: z.array(z.string()),
    ctaTema: z.enum(['danza', 'urban', 'bambini', 'benessere', 'formazione', 'comunita', 'ascolto']).default('danza'),
  }),
});

export const collections = { corsi };
