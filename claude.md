# Procedura Deploy InBallet con Cloudflare Tunnel

## Passaggi da eseguire (per Claude)

### 1. Verifica Docker attivo
```bash
docker info
```
Se fallisce: chiedere all'utente di avviare Docker Desktop e attendere 10 secondi.

---

### 2. Verifica esistenza Dockerfile
Il Dockerfile è già presente in: `c:\Users\feder\Documents\GitHub\inballet\Dockerfile`

Contenuto:
```dockerfile
FROM php:8.2-apache

# Abilita mod_rewrite
RUN a2enmod rewrite

# Copia tutti i file del sito
COPY . /var/www/html/

# Permessi
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Porta 80
EXPOSE 80

CMD ["apache2-foreground"]
```

---

### 3. Build immagine Docker
```bash
cd "c:\Users\feder\Documents\GitHub\inballet" && docker build -t inballet-site .
```

**Tempo:** ~30 secondi (se immagine base già scaricata)

---

### 4. Rimuovi container esistente (se presente) e avvia nuovo
```bash
docker rm -f inballet-web
docker run -d --name inballet-web -p 3000:80 inballet-site
```

**Porta locale:** 3000
**Verifica:** Il container deve restituire un ID (es: `d5eba632e328...`)

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

Quando l'utente modifica file (HTML, CSS, JS, PHP), seguire questa procedura:

### Procedura Completa di Aggiornamento

```bash
# 1. Rebuild immagine con nuove modifiche
cd "c:\Users\feder\Documents\GitHub\inballet"
docker build -t inballet-site .

# 2. Stop e rimuovi vecchio container
docker rm -f inballet-web

# 3. Avvia nuovo container con codice aggiornato
docker run -d --name inballet-web -p 3000:80 inballet-site
```

**Tempo totale:** ~30-40 secondi

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

---

## Troubleshooting

### Porta 3000 già occupata
```bash
docker rm -f inballet-web
docker run -d --name inballet-web -p 3001:80 inballet-site
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

---

## Comandi Rapidi

**Aggiornamento dopo modifiche (1 comando):**
```bash
cd "c:\Users\feder\Documents\GitHub\inballet" && docker build -t inballet-site . && docker rm -f inballet-web && docker run -d --name inballet-web -p 3000:80 inballet-site
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

**Pulizia completa:**
```bash
docker rm -f inballet-web
docker rmi inballet-site
```

---

**Ultimo aggiornamento:** 2026-03-17
