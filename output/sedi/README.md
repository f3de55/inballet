# Dove trovarci — InBallet

- `mappa-inballet.png`: composizione corrente esportata con la nuova mappa.
- `anteprima-desktop.png`, `anteprima-tablet.png`, `anteprima-mobile.png`: anteprime della sezione completa.
- `georeferenziazione-v3.json`: registrazione del nuovo screenshot 1111 × 852 a zoom 14.
- `georeferenziazione.json` e `georeferenziazione-v2.json`: registrazioni precedenti conservate per tracciabilità.

Il sito usa l'ultimo screenshot fornito dall'utente. Su desktop Lainate è a sinistra, Rho a destra e la mappa al centro. Su mobile le foto occupano tutta la larghezza: Lainate, mappa ingrandita, Rho. I pallini restano di 56 px; città e azioni usano dimensioni leggibili. Foto e segnaposto aprono Google Maps; «Vedi di più» e icona restano sotto ciascuna città. Nessun box aggiuntivo sotto la composizione.

I segnaposto sono figli della cartografia e seguono le percentuali dell'immagine: il ritaglio mobile non ne altera le coordinate. I collegamenti SVG si aggiornano sulle posizioni reali delle card e dei punti tramite `ResizeObserver`, anche dopo resize e caricamento dei font.

## Posizioni

Gli indirizzi sono quelli del [sito ufficiale InBallet](https://www.inballet.it/): Via Puccini 14, Lainate, e Via Tevere 19, Rho.

Geocodifica tramite [ArcGIS World Geocoding Service](https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates), parametro `SingleLine`, risultati di tipo `StreetAddressExt`:

| Sede | Latitudine | Longitudine | Pixel nel nuovo screenshot 1111 × 852 |
| --- | --- | --- | --- |
| Lainate | 45.55948194798 | 9.029441965882 | 237.624, 39.247 |
| Rho | 45.520685271447 | 9.049223252559 | 468.092, 684.604 |

La geocodifica interpola i civici lungo la strada: i punti sono indicativi e non certificano l'ingresso del fabbricato. L'ultimo screenshot ha zoom 14 e origine in pixel mondo 2202115, 1499493. Due verifiche indipendenti (registrazione sullo screenshot precedente ingrandito 2× e tasselli Google a zoom 14) restituiscono la stessa origine. La correlazione sui bordi dei tasselli è 0.436.

## Verifiche

Controllo Astro/TypeScript e controllo stile. Verifica browser a 320, 360, 390, 430, 600, 768, 769, 900, 1024 e 1440 px: card mobile a tutta larghezza, nessuna foto o pallino tagliato, nessuna sovrapposizione, nessun overflow orizzontale. Sul telefono a 390 px: fotografie alte 183 px, città di 22 px, mappa di circa 449 px e pallini invariati di 56 px. Misurati in browser l'allineamento geografico dei punti e l'arrivo delle curve ai rispettivi pallini. Build Docker e verifica su localhost:3000.
