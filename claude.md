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
- `cache/`, `ratelimit/` — chatbot caches and rate limit counters

In Docker, this directory is a named volume (`inballet-data`) so data survives rebuilds.

### Chatbot (BELLA)

`src/lib/chatbot.ts`. Flow per message: sanitize → injection/bad-words/spam filter → rate limit (30/hr, 100/day per IP hash) → cache check → Groq API call → cache store → log analytics.

Uses `GROQ_API_KEY` and `GROQ_MODEL` from env. Default model: `openai/gpt-oss-120b`. Cache TTL is 2 hours; cache key includes a `SITE_VERSION` (set at process start) so deploys invalidate it.

### Content collections

Course pages use Astro Content Collections: `src/data/corsi.json` defines 22 courses, each keyed by slug. `src/pages/[corso].astro` renders them. Schema is in `src/content.config.ts`.

### Icons

`scripts/icons.mjs` generates a Font Awesome subset from `@fortawesome/fontawesome-free`. It scans source files for `fa-*` class usage and builds a minimal subset. Run `npm run icons` after adding any new Font Awesome icon class.

### Session & Auth

Sessions via Astro's built-in session API (fsLite driver, 24h TTL). `src/lib/auth.ts` wraps session read/write. Login is password-only (`DASHBOARD_PASSWORD` from env).

### Security config

`security.allowedDomains` in `astro.config.mjs` controls which hosts the Origin check trusts. Add new domains there for new deployments. No trailing quotes around `.env` values or they break.

---

## Deploy (Docker + Cloudflare Tunnel)

### First deploy

```bash
# 1. Check Docker is running
docker info

# 2. Build image (~1 min, includes WebP image optimization)
docker build -t inballet-site .

# 3. Start container
docker rm -f inballet-web
docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site

# 4. Start Cloudflare tunnel
docker run -d --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000

# 5. Get public URL (wait a few seconds first)
docker logs <cloudflared-container-id> | grep "https://"
```

### After code changes (one-liner)

```bash
docker build -t inballet-site . && docker rm -f inballet-web && docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

The Cloudflare tunnel keeps running — no need to restart it.

### Notes

- The tunnel URL changes every time cloudflared restarts
- Login is accepted only from `localhost`, `*.trycloudflare.com`, and `inballet.it` (see `security.allowedDomains` in `astro.config.mjs` to add more)
- `docker volume rm inballet-data` permanently deletes events and uploads
- Port conflict: use `-p 3001:8080` and `--url http://localhost:3001` in the tunnel

### Troubleshooting

- **Login 403**: host not in `allowedDomains`
- **Password rejected**: check `.env` — no quotes around `DASHBOARD_PASSWORD`
- **Tunnel no URL**: `docker logs <container-id>` for errors
