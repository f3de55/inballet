# Procedura Deploy InBallet con Cloudflare Tunnel

Il sito è un progetto **Astro 7** (`src/`): pagine pubbliche pre-renderizzate in HTML statico,
dashboard e login renderizzati on-demand dal server Node (`@astrojs/node`).
Backend = **Astro Actions** (`src/actions/index.ts`): chatbot, calendario eventi, login, gestione dashboard.
Icone: sottoinsieme di Font Awesome generato da `scripts/icons.mjs` (automatico prima di dev/build/check).
Dati runtime (eventi, tipi evento, analytics chatbot, sessioni, locandine caricate) in `data/`.
Segreti in `.env` (vedi `.env.example`), **senza apici** attorno ai valori.

## Sviluppo locale (senza Docker)

```bash
npm install
npm run dev        # http://localhost:4321 con hot reload
npm run build      # build di produzione in dist/
npm start          # avvia dist/ leggendo .env
npm run check      # controllo tipi
npm run icons      # rigenera solo il set di icone (dopo aver usato una nuova icona fa-…)
```

---

## Passaggi da eseguire (per Claude)

### 1. Verifica Docker attivo
```bash
docker info
```
Se fallisce: chiedere all'utente di avviare Docker Desktop e attendere 10 secondi.

---

### 2. Dockerfile
Già presente in `c:\Users\feder\Documents\GitHub\inballet\Dockerfile` (multi-stage
`node:22-alpine`: `npm ci` + `astro build`, runtime Node non-root sulla porta **8080**).

---

### 3. Build immagine Docker
```bash
cd "c:\Users\feder\Documents\GitHub\inballet" && docker build -t inballet-site .
```

**Tempo:** ~1 minuto (include ottimizzazione immagini in WebP)

---

### 4. Rimuovi container esistente (se presente) e avvia nuovo
```bash
docker rm -f inballet-web
docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

- **Porta locale:** 3000 (→ 8080 nel container)
- `--env-file .env`: chiavi Groq/Google e password dashboard
- `-v inballet-data:/app/data`: eventi e upload **persistono** tra un rebuild e l'altro
- **Verifica:** il container deve restituire un ID (es: `d5eba632e328...`)

---

### 5. Avvia Cloudflare Tunnel
```bash
docker run -d --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```

**Output:** Restituisce un container ID (es: `77088fb3df60...`)

---

### 6. Recupera URL pubblico
```bash
sleep 3 && docker logs [CONTAINER_ID] | grep "https://"
```

Sostituire `[CONTAINER_ID]` con l'ID del container cloudflared appena creato.

**Esempio output:**
```
https://cotton-spies-lights-temp.trycloudflare.com
```

---

### 7. Fornisci URL all'utente

**Messaggio da inviare:**
```
✅ Sito ONLINE su: https://[URL-GENERATO].trycloudflare.com

- Nessuna password richiesta
- Tunnel attivo finché Docker è in esecuzione
- Per fermare: docker stop [CONTAINER_ID]
```

---

## 🔄 AGGIORNAMENTO DOPO MODIFICHE AL CODICE

Quando l'utente modifica file in `src/` (pagine `.astro`, CSS, JS, dati), seguire questa procedura:

```bash
# 1. Rebuild immagine con nuove modifiche
cd "c:\Users\feder\Documents\GitHub\inballet"
docker build -t inballet-site .

# 2. Stop e rimuovi vecchio container (i dati restano nel volume inballet-data)
docker rm -f inballet-web

# 3. Avvia nuovo container con codice aggiornato
docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

**Tempo totale:** ~1 minuto

### Il tunnel Cloudflare

**IMPORTANTE:** Il tunnel cloudflared continua a funzionare! NON serve riavviarlo.

**Verifica:** Ricarica la pagina nel browser, vedrai le modifiche.

### Se il tunnel si è chiuso

Solo se necessario (tunnel non funziona):

```bash
# 1. Trova e ferma vecchio tunnel
docker ps | grep cloudflared
docker stop [CLOUDFLARED_CONTAINER_ID]

# 2. Avvia nuovo tunnel
docker run -d --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000

# 3. Recupera nuovo URL
docker ps | grep cloudflared  # prendi l'ID
docker logs [NUOVO_ID] | grep "https://"
```

**NOTA:** Nuovo URL = nuovo link da condividere

---

## Note Importanti

- **URL cambia ogni volta** che si riavvia cloudflared
- **Tunnel si chiude** se Docker Desktop si chiude o PC si spegne
- **Non adatto** per uso permanente oltre qualche giorno
- **Soluzione temporanea** per demo/test veloci
- Login dashboard accettato solo da `localhost`, `*.trycloudflare.com` e `inballet.it`
  (`security.allowedDomains` in `astro.config.mjs`): per un nuovo dominio aggiungerlo lì

---

## Troubleshooting

### Porta 3000 già occupata
```bash
docker rm -f inballet-web
docker run -d --name inballet-web -p 3001:8080 --env-file .env -v inballet-data:/app/data inballet-site
# Poi usa --url http://localhost:3001 nel tunnel
```

### Docker non risponde
Chiedere all'utente di:
1. Aprire Docker Desktop
2. Attendere che sia completamente avviato (icona verde)
3. Riprovare

### Cloudflare non genera URL
```bash
docker logs [CONTAINER_ID]
```
Cercare errori. Potrebbe essere un problema di rete.

### Login dashboard: "403" o password rifiutata
- 403: l'host non è in `allowedDomains` (vedi Note Importanti)
- Password rifiutata: in `.env` il valore di `DASHBOARD_PASSWORD` non deve avere apici

---

## Comandi Rapidi

**Aggiornamento dopo modifiche (1 comando):**
```bash
cd "c:\Users\feder\Documents\GitHub\inballet" && docker build -t inballet-site . && docker rm -f inballet-web && docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site
```

**Stop tutto:**
```bash
docker stop inballet-web
docker ps | grep cloudflared  # trova ID tunnel
docker stop [CLOUDFLARED_CONTAINER_ID]
```

**Riavvio rapido (se immagine già pronta):**
```bash
docker start inballet-web
docker run -d --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```

**Pulizia completa** (⚠️ `docker volume rm` cancella eventi e locandine):
```bash
docker rm -f inballet-web
docker rmi inballet-site
docker volume rm inballet-data
```

---

**Ultimo aggiornamento:** 2026-10-11 (migrazione PHP → Astro)
