# ---- Build: genera HTML statico, immagini WebP e server Node ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Dipendenze di produzione (sharp serve per /_image a runtime) ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    DATA_DIR=/app/data
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# Dati iniziali (eventi, tipi evento); in produzione montare un volume su /app/data
COPY --chown=node:node data/eventi.json data/tipi_evento.json ./data/
RUN chown node:node /app/data
USER node

EXPOSE 8080
CMD ["node", "./dist/server/entry.mjs"]
