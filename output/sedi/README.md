# Dove trovarci — InBallet

- `mappa-inballet.png`: composizione corrente esportata con la nuova mappa.
- `anteprima-desktop.png`, `anteprima-tablet.png`, `anteprima-mobile.png`: anteprime della sezione completa.
- `georeferenziazione-v3.json`: registrazione del nuovo screenshot 1111 × 852 a zoom 14.
- `georeferenziazione.json` e `georeferenziazione-v2.json`: registrazioni precedenti conservate per tracciabilità.

Il sito usa l'ultimo screenshot fornito dall'utente. Su desktop Lainate è a sinistra, Rho a destra e la mappa al centro. Su mobile una sola cornice contiene la mappa continua e due foto più compatte, senza struttura bianca da card. Città e icona esterna sono dentro ciascuna immagine, su un gradiente scuro; i numeri interni e «Vedi di più» sono nascosti solo su mobile. La cartografia occupa più della metà della composizione. I pallini geografici rimangono di 56 px. Foto e segnaposto aprono Google Maps.

I segnaposto sono figli della cartografia e seguono le percentuali dell'immagine: il ritaglio mobile non ne altera le coordinate. La scala e il ritaglio vengono adattati alle dimensioni delle card: i due punti occupano le fasce libere sopra e sotto le foto, sempre sugli stessi luoghi. I collegamenti SVG si aggiornano sulle posizioni reali tramite `ResizeObserver`, anche dopo resize e caricamento dei font.

## Posizioni

Gli indirizzi sono quelli del [sito ufficiale InBallet](https://www.inballet.it/): Via Puccini 14, Lainate, e Via Tevere 19, Rho.

Geocodifica tramite [ArcGIS World Geocoding Service](https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates), parametro `SingleLine`, risultati di tipo `StreetAddressExt`:

| Sede | Latitudine | Longitudine | Pixel nel nuovo screenshot 1111 × 852 |
| --- | --- | --- | --- |
| Lainate | 45.55948194798 | 9.029441965882 | 237.624, 39.247 |
| Rho | 45.520685271447 | 9.049223252559 | 468.092, 684.604 |

La geocodifica interpola i civici lungo la strada: i punti sono indicativi e non certificano l'ingresso del fabbricato. L'ultimo screenshot ha zoom 14 e origine in pixel mondo 2202115, 1499493. Due verifiche indipendenti (registrazione sullo screenshot precedente ingrandito 2× e tasselli Google a zoom 14) restituiscono la stessa origine. La correlazione sui bordi dei tasselli è 0.436.

## Verifiche

Controllo stile e build Docker. Verifica browser a 320, 360, 390, 430, 600, 768, 769, 900, 1024 e 1440 px: immagini contenute nella mappa, sfondo continuo, nessun pallino tagliato, nessuna sovrapposizione o overflow. Su mobile sono verificati overlay, testo bianco, icona visibile, assenza del numero e di «Vedi di più» e assenza di fondo e padding da card. Sul telefono a 390 px: foto di circa 279 × 157 px, città di 22 px, cornice di circa 644 px, circa il 63% di mappa libera e pallini invariati di 56 px. Desktop con numeri e «Vedi di più» conservati. Misurati l'allineamento geografico e l'arrivo delle curve ai pallini. Verifica finale su localhost:3000.
