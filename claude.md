# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # http://localhost:4321 with hot reload
npm run build      # production build to dist/
npm start          # run dist/ reading .env
npm run check      # TypeScript type check
npm run icons      # regenerate Font Awesome icon subset (run after using a new fa-… icon)
```

`predev`, `prebuild`, `precheck` auto-run `npm run icons` — no need to run it manually before those.

## Architecture

**Astro 7** with hybrid rendering. Default output is `static` (prerendered HTML), but pages with `export const prerender = false` are SSR. Currently SSR: `/login`, `/dashboard`, `/documenti`, `/spettacoli-eventi` (+ `/spettacoli-eventi/<slug>/calendario.ics`), and the image asset route.

### Request flow

```
Browser → middleware.ts → Astro page / Action
```

`src/middleware.ts` handles two things:
1. Legacy PHP URL redirects (`/chi-siamo.php` → `/chi-siamo`, 301)
2. CSRF protection: POST to `/_actions/*` must have matching `Origin` header

### Backend: Astro Actions

All backend logic lives in `src/actions/index.ts` — no separate API routes. Actions are grouped: `chatbot`, `eventi`, `tipi`, `immagini`, `auth`. Admin actions guard themselves with `soloAdmin()` (checks session). Called from the browser via `import { actions } from 'astro:actions'` or as `<form>` action.

### Data layer

Everything is JSON files on disk in `DATA_DIR` (default `./data/`, set in `.env`). The `src/lib/storage.ts` module provides:
- `readJson` / `writeJson` (atomic: write temp file → rename)
- `serialized()` — a promise queue that prevents concurrent read→modify→write races

File layout in `data/`:
- `eventi.json`, `tipi_evento.json` — event data
- `analytics.json` — chatbot logs (capped at 10000 entries)
- `sessions/` — fsLite session driver
- `uploads/eventi/` — event posters: uploads are resized (1600px) and converted to WebP, plus a `<name>.mini.webp` thumbnail for the dashboard library
- `documenti.json` — texts and PDF list of `/documenti` (defaults in `src/data/documenti.ts` until first save)
- `uploads/documenti/` — PDFs uploaded from the dashboard, served on `/assets/documenti/<file>`
- `insegnanti.json` — header and teacher cards (name, role, bio, competenze list, photo) of the «Insegnanti» carousel in `/chi-siamo` (dashboard › Insegnanti; defaults in `src/data/insegnanti.ts`, no teachers by default: the section is hidden while the list is empty). `/chi-siamo` is therefore rendered on demand. Demo teachers (dashboard › Insegnanti › Dati demo, `generaInsegnanti` in `src/lib/demo.ts`) carry `demo: true` and are removed with their photos in one click
- `uploads/insegnanti/` — teacher photos, cropped 4:5 (800x1000) and converted to WebP on upload, served on `/assets/images/insegnanti/<file>`
- `conversazioni/` — chatbot conversations, one `<uuid>.json` per chat (deleted after 30 days)

In Docker, this directory is a named volume (`inballet-data`) so data survives rebuilds.

### Events

`src/lib/eventi.ts` is the single source: the zod schema `inputEvento` (used as the `eventi.salva` Action input; the dashboard shows its per-field errors), read/write, time rules and presentation helpers.

- Model: `data`/`ora` start, optional `dataFine`/`oraFine`, `stato` (`pubblicato`, `bozza` = hidden from the site, `annullato`, `esaurito`), `prenotazione` link, `slug` (+ `alias` of old slugs).
- No per-event pages on purpose: details open in a modal on `/spettacoli-eventi` (SSR list + `scripts/calendario.ts`). `?evento=<slug>` (or an old slug / the id) opens the modal and sets og:title/og:image to that event, so shared links preview the poster. The page also carries schema.org/Event JSON-LD for upcoming non-demo events (`datiStrutturati()`).
- Text fields are stored as plain text and escaped when rendered. Legacy PHP entries (no `stato`, HTML-escaped text) are converted on read and persisted at the next write.
- One rule for "past" everywhere (site, banner, dashboard, chatbot): `passato()` = the end (`dataFine`/`oraFine`, default 23:59 Rome time) is over.
- Removing a type keeps it on the events that use it; deleting a poster clears it from the events that use it.

### Chatbot (Étoile)

`src/lib/chatbot/`, one file per concern; `index.ts` (`rispondi()`) runs the flow: sanitize → insult/spam filter → in-memory rate limit per IP hash (1s, 6/min, 30/h, 100/day) → conversation memory (last 6 exchanges, max 20 per chat) → response cache (first message of a chat only, in memory, 24h, key includes the knowledge version) → daily spend cap → provider chain → FAQ fallback → log + save exchange.

- `fornitori.ts`: provider chain from `CHATBOT_MODELLI` (`fornitore:modello,...`, in priority order). Two adapters: official `@anthropic-ai/sdk` for Claude, OpenAI-compatible chat completions for gemini/mistral/groq/openrouter/openai/cerebras/`compatibile` (any URL in `CHATBOT_COMPATIBILE_URL`). Providers without a key are skipped. Hedged requests: a provider that fails hands over at once, one still silent after 5s gets the next one started in parallel, first valid answer wins and the others are aborted (the beaten one counts an error). Per-provider timeout 12s; 502/503/529 retried once at the end of the queue; circuit breaker (3 errors or slow losses → 5 min pause, 429 → `retry-after`, 4xx config errors → 30 min). Speed is bound by the provider queue, not prompt size or streaming (measured: Gemini free tier ~4s to first token whether the prompt is 4k or 19k tokens), so no streaming and no prompt trimming.
- Opening the chat calls `actions.chatbot.prepara` (crawl + prompt build), so the first question doesn't wait for it.
- `conoscenza.ts`: no training, no RAG/vector DB on purpose — the whole knowledge base (~20k tokens) goes in the system prompt, cached by the providers (Claude: 1h cache on the fixed part). Fixed part: official data (`src/lib/riepilogo.ts`, shared with `/llms.txt`) + the text of every page. Variable part last: date, documents, next 30 events, demo ones included because the site shows them (rebuilt every 5 min).
- `pagine.ts`: the server crawls its own site (from `/`, following internal links, max 150 pages; first `localhost:$PORT`, then the request origin) and keeps the `<main>` text of each page, dropping lines repeated on many pages. Re-read every 30 min in production (1 min in dev) in the background. Any new page linked from the site is covered automatically; text outside `<main>` (navbar, footer) is not, contacts come from the official data.
- `offline.ts`: answer from `faq` in `src/data/scuola.ts` (keyword match) when no provider answers or the spend cap is hit. The bot always answers.
- `registro.ts`: `analytics.json` entries with provider, tokens, cost (`PREZZI` in `src/data/chatbot.ts`), latency, fallbacks.
- `formato.ts`: escape everything, then rebuild bold/lists/links; links only to site paths, tel/mailto and a few known hosts.
- Dashboard (Chatbot tab): spend, provider chain status, quality check (`VERIFICHE` in `src/data/chatbot.ts`, run per provider via `actions.chatbot.verifica`), last conversations.

All chatbot env vars are `access: 'secret'` on purpose: read at runtime, so they can change without a rebuild (public server vars are inlined at build time). See `.env.example`.

### Content collections

Course pages use Astro Content Collections: `src/data/corsi.json` defines 22 courses, each keyed by slug. `src/pages/[corso].astro` renders them. Schema is in `src/content.config.ts`.

### UI system (use it, don't invent new styles)

### CSS structure (`src/styles/`)

No `<style>` blocks and no `style=` with real properties in `.astro` files: all CSS lives in `src/styles/`, and the file that uses it imports it in its frontmatter (`import '../styles/pages/chi-siamo.css'`), so each page loads only its own CSS. Plain CSS (no scoping): class names must be unique across files, prefix them with the page or component.

```
styles/
  global.css        only an ordered @import list of the shared modules (imported by layouts/Base.astro)
  base/             variables.css (ALL tokens: palette, type scale, radii, shadows, motion, header and wave sizes,
                    decorative image paths) · reset.css (reset, html/body, focus, skip link) · typography.css
  layout/           container, intro-editoriale, decori (decoro-onde + veils), onde (wavy edges, fascia-onda)
  components/       shared by several pages: buttons, citazione, voci, foto-cornice, carosello, hero, sfondo,
                    breadcrumb, cta-contatto, intro-split · one file per component with its own markup
                    (navbar incl. the fixed header, footer, banner, chatbot, galleria, insegnanti-*, corsi-simili, …)
  pages/            one file per page, imported by the page; only layout (grid, spacing, alignment), never its own
                    label/title/button typography or colours
  admin/            dashboard and login (own tokens in admin/variables.css, not loaded by the public site)
  icons.css         generated by `npm run icons` (gitignored)
```

New values (colours, sizes, shadows) go in `base/variables.css`; a rule needed by two or more pages goes in `components/` or `layout/`, not copied. `npm run verifica:stile` enforces this.

Shared classes and tokens: every content section uses them.

- Section header: `<span class="eyebrow">` → `<h2 class="titolo-sezione">` (optional `<em>` for the light italic accent) → `<p class="intro-sezione">`
- Dark or photo-background section: add `sezione-scura` on the `<section>` (eyebrow, title and intro switch to light colors)
- Buttons: `btn-primary` (blue pill), `btn-secondary` (white outline, on photos/dark); text action link: `link-cta`; round icon buttons `btn-icon` (see Type scale and single style system)
- Tokens: `--section-y` (section vertical padding), `--bg-soft` (alternate section background), `--radius-card` / `--shadow-card` (cards), `--radius-img` (photos, with the offset blue frame used in Contatti/Corsi/homepage story)
- Page hero: the shared `chisiamo-hero` markup (see any inner page): photo, bottom gradient, `<Breadcrumb />` then title, text left-aligned and vertically centered (same space above and below). No glass panels.
- Navigation data lives in `src/data/navigazione.ts`: the navbar (desktop + mobile, active page highlight) and the breadcrumbs (+ BreadcrumbList JSON-LD) are generated from it. Add new pages there; pages outside the menu go in `altrePagine`.
- Intro section of an inner page: add `intro-editoriale` to the wrapper (eyebrow, title and text stacked, never text to the right of the title; centered on desktop, left-aligned at ≤900px; a `*-highlight` quote becomes a blue rule)
- Header + list sections: the owner chooses case by case (the six pages with an intro «text + photo» and a «header + list» section share `components/intro-split.css`: `intro-split-*`, `split-section` / `split-layout` / `split-header` [+ `--sticky`, `--soft`]). Side by side (header left, sticky if long, list right; stacked at ≤900px) in homepage Formazione/Dicono di noi/FAQ, Collaborazioni progetti, Sportello accesso, Classi integrate, NoiConVoi destinatari, Sostenitori destinazioni, Formazione insegnanti aree. Stacked (`intro-editoriale` above, content below in a centered `max-width: 48rem` column) elsewhere, e.g. Chi siamo numeri, Diploma, Dona. Ask before switching one to the other.
- Lists of points (pillars, values, timeline…): `voce` / `voce-icona` / `voce-anno` / `voce-titolo` / `voce-testo` (columns with a blue top rule). No cards with icons in colored circles.
- CTA section before the footer (one shared block, `components/cta-contatto.css`: `cta-contatto` > `cta-bg`, `cta-overlay`, `cta-wrapper` > title, text, `cta-pulsanti`): background from `sfondo()` in `src/lib/images.ts`, one photo or `{ desktop, tablet, mobile }` plus focal point per format (`{ desktop: '50% 35%', mobile: '50% 40%' }`); on course pages it is `ctaImage` / `ctaFuoco` in `corsi.json`. Breakpoints: desktop >900px, tablet 601-900px, mobile ≤600px. Measured section sizes (cover-cropped, dark overlay on top): desktop 1015-1910 × 356-433, tablet 591-890 × 307-387, mobile 360-590 × 307-462. Source files to supply: desktop 2560×640, tablet 1600×800, mobile 1200×1400 px; keep the subject inside the central safe zone (desktop 50% width / 70% height, tablet 70% / 80%, mobile 80% / 55%).
- Decorative waves (desktop >1024px only, faded, covering the whole section): add `decoro-onde` or `decoro-onde decoro-onde--sinistra` (mirrored) on a white `<section>`. Images `src/assets/images/decorazioni/onde-destra.webp` / `onde-sinistra.webp` (mirrored, WebP made from the `.png` sources), already faded to 22% in the file, set as section `background-image` via the `--decoro-onde*` variables in `base/variables.css` (rules in `layout/decori.css`). Never on two adjacent sections; one or two per page (Chi siamo has three: Ilenia Nobile, timeline, sedi).
- Section edges: no accent lines or borders at the top/bottom of a section. Sections are told apart only by alternating background (white / `--bg-soft`); never put two sections with the same background next to each other (the footer and `sezione-scura` blocks are dark). Hairlines (`rgba(26,26,26,.12)`) are only for rows inside a section.
- Wavy section edges: every `main > section` after the first and the footer get a small decorative wave on their top edge (`layout/onde.css`, `--onda-h` / `--onda-w` in `base/variables.css`): transparent `border-top` + negative `margin-top` + `mask`, so layout doesn't change and the previous section shows through. Don't set your own `border-top`/`margin-top` on top-level sections. Sections whose background photo is a child element named `*-bg` / `*-overlay` are extended into the wave band automatically; for a new kind of background child, give it `top: calc(var(--onda-h) * -1)` and `height: calc(100% + var(--onda-h))`, and avoid `overflow: hidden` on the section. Each section also gets a transparent `border-bottom: var(--onda-h)` so the wave of the next one does not eat its bottom padding (the hero has it in its padding instead). Bands inside a section (like the alternating percorsi on /corsi) use `.fascia-onda` (optionally `--fascia` for the colour): a full-width band with the double wave on top and a mirrored one at the bottom; the containing section needs `overflow-x: clip` and the band's block needs vertical padding ≥ `--onda-h`.
- Style: editorial, not template-like. No gradient icon tiles, no floating badges over photos, no invented metrics.
- Bold (`<strong>`) in body text: 1-3 key words or short phrases per paragraph (ages, qualifications, course and project names, the action to take), never whole sentences, never trailing punctuation inside the tag, never inside links or headings. Styled globally in `global.css` (`main strong`: 600, dark; white on dark sections and heroes). Where text lives in data used elsewhere (chatbot, schema.org, llms.txt) keep it plain and list the phrases in `evidenzia` (see `faq` and `categorieCorsi` in `src/data/scuola.ts`), rendered with `enfatizza()` from `src/lib/text.ts`; course pages (`src/data/corsi.json`) carry `<strong>` directly. Texts edited from the dashboard use `**word**` (`grassettoDaTesto()`).

### Icons

`scripts/icons.mjs` generates a Font Awesome subset from `@fortawesome/fontawesome-free`. It scans source files for `fa-*` class usage and builds a minimal subset. Run `npm run icons` after adding any new Font Awesome icon class.

### Session & Auth

Sessions via Astro's built-in session API (fsLite driver, 24h TTL). `src/lib/auth.ts` wraps session read/write. Login is password-only (`DASHBOARD_PASSWORD` from env).

### Security config

`security.allowedDomains` in `astro.config.mjs` controls which hosts the Origin check trusts. Add new domains there for new deployments. No trailing quotes around `.env` values or they break.

---

## Deploy (Docker)

### First deploy

```bash
# 1. Check Docker is running
docker info

# 2. Build image (~1 min, includes WebP image optimization)
docker build -t inballet-site .

# 3. Start container
docker rm -f inballet-web
docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

### After code changes (one-liner)

```bash
docker build -t inballet-site . && docker rm -f inballet-web && docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

### Notes

- Login is accepted only from `localhost`, `*.up.railway.app`, and `inballet.it` (see `security.allowedDomains` in `astro.config.mjs` to add more)
- `docker volume rm inballet-data` permanently deletes events and uploads
- Port conflict: use `-p 3001:8080`

### Troubleshooting

- **Login 403**: host not in `allowedDomains`
- **Password rejected**: check `.env` — no quotes around `DASHBOARD_PASSWORD`

## Deploy check
Railway builds on every push to `main`. To see which commit is live, compare `curl -sI https://inballet-production.up.railway.app/ | grep -i last-modified` (UTC) with `git log -1 --format=%cd --date=format:%H:%M`: if the page is older than the last commit, that build failed or is still running (check the Railway deploy log).

## Type scale and single style system
One system, all in `src/styles/` (tokens in `base/variables.css`, headings and text in `base/typography.css`); pages and components only lay things out. Run `npm run verifica:stile` before pushing: it fails on a `<style>` block in an `.astro` file, a literal `font-size` / `font-weight`, a hand-written colour, an inline style with real properties, or a heading restyled outside `base/typography.css`.

- **Roles, not sizes**: pages never pick a size, weight, line-height or colour for text. `base/variables.css` ("Ruoli tipografici") defines each role and `base/typography.css` applies it: titles `--h1-*` … `--h4-*` (h1 56px, h2 46, h3 32, h4 26 on desktop; one style per level on every page), body text `--body-*` (22px, 1.7, one colour for every paragraph/list), small text `--small-*` (`.testo-piccolo`: notes, ages, frequencies, captions), lead `--lead-*` (`.hero-lead`, `.testo-evidenza`), label `--label-*` (`.eyebrow`/`.titoletto`), buttons/links `--ui-*`, numbers `--numero-*`. Changing a role in the variables file changes the whole site. The raw scale `--text-5xl` … `--text-xs` feeds the roles and sizes icons/numerals; dashboard/login (`admin/`) and the chat panel (`components/chatbot.css`) keep their own scales.
- **Tags carry the role**: titles are `h1`-`h4` (card/course/document/sede names `h3`, titles under an `h3` `h4`), text is `<p>` (or `li`, `dd`…), labels `<p class="eyebrow">`. Never a `<span>`/`<div>` for a title or a paragraph: `span` only for an inline fragment inside text (e.g. `sede-tag`, a count-up number) or an icon wrapper inside a button. Don't wrap button/link labels in a span. `h2`/`.titolo-sezione` section title, dialog `h2` uses the `h3` style, `.valore` = `h4` style on a non-title (phone, email). Components never set size/weight/line-height/letter-spacing/colour on titles or paragraphs; short highlighted statements `.testo-evidenza`; big numbers `.numero-grande` / `.numero-medio`.
- **Labels**: one uppercase label style, `.titoletto` (and `.eyebrow`, same look plus margin): menu group titles, categories, table headers, footer column titles, any h2/h3 that is only a label.
- **Hero lead** under the h1: `.hero-lead` (home and inner pages).
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.link-cta`; round icon buttons `.btn-icon` + `--scuro` (on photos/dark), `--contorno` (carousel arrows), `--nudo` (menu). 44px, same icon size. The navbar "Contattaci" is a `btn-primary` (`aria-current="page"` turns it white).
- **Icons** follow the text next to them or a scale step: `--icona-in-testo`, `--icona-mini`, `--icona-punto`, never px/rem in components.
- **Colours** only from the palette tokens: `--white`, `--dark-navy`, `--primary-blue*`, `--text-*`, greys `--grigio-*`, states `--stato-*`, lines: ONE hairline colour `--linea` for every separator on light backgrounds (same as the home accordion; never invent another), `--linea-su-scuro` on dark, text on dark `--testo-su-scuro*`, and for transparencies `rgb(var(--navy-rgb) / .4)` (also `--bianco-rgb`, `--nero-rgb`, `--scuro-rgb`, `--blu-rgb`, `--blu-scuro-rgb`, `--header-rgb`).
- **Font weights** only from the tokens `--font-light` … `--font-bold` (300-700) or the role tokens (`--heading-weight`, `--ui-weight`…). Text colours from the role tokens (`--body-color`, `--small-color`, `--heading-color`, `--label-color`, and the `*-su-scuro` variants for dark sections) or `--text-body` / `--text-muted`.
- **Inline `style=`** is left only for the image data computed at build time, as CSS variables (`--sfondo-*` / `--fuoco-*` from `sfondo()` and `<Img fuoco>`); the rules that use them are in `components/sfondo.css`. Counters and per-item tweaks (index, number of items, logo scale, veil) are CSS: `:nth-child`, `:has()`, modifier classes or data attributes. The few `element.style` writes in `src/scripts` are runtime values (measured heights, drag offset, carousel slide state).

## Corsi simili
Every course page (`[corso].astro`) shows `src/components/CorsiSimili.astro` right after "Gli obiettivi": the other courses of the same `categorieCorsi` entry (scuola.ts), current course excluded; age label and frequency come from the course's own data in corsi.json. A new course only needs to be listed in a category to appear there.
