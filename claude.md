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

**Astro 7** with hybrid rendering. Default output is `static` (prerendered HTML), but pages with `export const prerender = false` are SSR. Currently SSR: `/login`, `/dashboard`, and the image asset route.

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
- `uploads/eventi/` — uploaded event posters
- `documenti.json` — texts and PDF list of `/documenti` (defaults in `src/data/documenti.ts` until first save)
- `uploads/documenti/` — PDFs uploaded from the dashboard, served on `/assets/documenti/<file>`
- `cache/`, `ratelimit/` — chatbot caches and rate limit counters

In Docker, this directory is a named volume (`inballet-data`) so data survives rebuilds.

### Chatbot (BELLA)

`src/lib/chatbot.ts`. Flow per message: sanitize → injection/bad-words/spam filter → rate limit (30/hr, 100/day per IP hash) → cache check → Groq API call → cache store → log analytics.

Uses `GROQ_API_KEY` and `GROQ_MODEL` from env. Default model: `openai/gpt-oss-120b`. Cache TTL is 2 hours; cache key includes a `SITE_VERSION` (set at process start) so deploys invalidate it.

### Content collections

Course pages use Astro Content Collections: `src/data/corsi.json` defines 22 courses, each keyed by slug. `src/pages/[corso].astro` renders them. Schema is in `src/content.config.ts`.

### UI system (use it, don't invent new styles)

Shared classes and tokens live at the top of `src/styles/global.css`. Every content section uses them; page `<style>` blocks define layout only (grid, spacing, alignment), never their own label/title/button typography or colors.

- Section header: `<span class="eyebrow">` → `<h2 class="titolo-sezione">` (optional `<em>` for the light italic accent) → `<p class="intro-sezione">`
- Dark or photo-background section: add `sezione-scura` on the `<section>` (eyebrow, title and intro switch to light colors)
- Buttons: `btn-primary` (blue pill), `btn-secondary` (white outline, on photos/dark); text action link: `link-cta`
- Tokens: `--section-y` (section vertical padding), `--bg-soft` (alternate section background), `--radius-card` / `--border-card` / `--shadow-card` / `--shadow-card-hover` (cards), `--radius-img` (photos, with the offset blue frame used in Contatti/Corsi/homepage story)
- Page hero: the shared `chisiamo-hero` markup (see any inner page): photo, bottom gradient, `<Breadcrumb />` then title, text left-aligned and vertically centered (same space above and below). No glass panels.
- Navigation data lives in `src/data/navigazione.ts`: the navbar (desktop + mobile, active page highlight) and the breadcrumbs (+ BreadcrumbList JSON-LD) are generated from it. Add new pages there; pages outside the menu go in `altrePagine`.
- Intro section of an inner page: add `intro-editoriale` to the wrapper (eyebrow, title and text stacked, never text to the right of the title; centered on desktop, left-aligned at ≤900px; a `*-highlight` quote becomes a blue rule)
- Lists of points (pillars, values, timeline…): `voce` / `voce-icona` / `voce-anno` / `voce-titolo` / `voce-testo` (columns with a blue top rule). No cards with icons in colored circles.
- Style: editorial, not template-like. No decorative bold inside sentences, no gradient icon tiles, no floating badges over photos, no invented metrics.

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
