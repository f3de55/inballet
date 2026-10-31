# Dove trovarci — InBallet

- `mappa-inballet.png`: composizione corrente esportata con la nuova mappa.
- `anteprima-desktop.png`, `anteprima-tablet.png`, `anteprima-mobile.png`: anteprime della sezione completa.
- `georeferenziazione-v2.json`: origine cartografica e punti degli indirizzi sul nuovo screenshot 1014 × 792.
- `georeferenziazione.json`: registrazione del primo screenshot, conservata per tracciabilità.

La versione del sito usa il nuovo screenshot fornito dall'utente, foto responsive, collegamenti SVG e segnaposto HTML. Su desktop Lainate è a sinistra, Rho a destra e la mappa al centro. Foto e segnaposto aprono Google Maps; «Vedi di più» e icona sono sotto ciascuna città. I numeri hanno maggiore spazio interno. I link degli indirizzi provengono da `src/data/scuola.ts`. La frase sotto la mappa, i due box degli indirizzi e la scritta aggiunta «Cartografia © Google» sono stati rimossi su richiesta.

## Posizioni

Gli indirizzi sono quelli del [sito ufficiale InBallet](https://www.inballet.it/): Via Puccini 14, Lainate, e Via Tevere 19, Rho.

Geocodifica tramite [ArcGIS World Geocoding Service](https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates), parametro `SingleLine`, risultati di tipo `StreetAddressExt`:

| Sede | Latitudine | Longitudine | Pixel nel nuovo screenshot 1014 × 792 |
| --- | --- | --- | --- |
| Lainate | 45.55948194798 | 9.029441965882 | 384.31, 203.12 |
| Rho | 45.520685271447 | 9.049223252559 | 499.55, 525.80 |

La geocodifica interpola i civici lungo la strada: i punti sono indicativi e non certificano l'ingresso del fabbricato. La prima cartografia è stata verificata confrontando le geometrie stradali con tasselli Google a zoom 13. Il nuovo screenshot è stato registrato sul precedente con correlazione dei bordi 0.995: traslazione +34, −104 pixel, nuova origine in pixel mondo 1100792, 749563. Su mobile l'immagine mantiene le proporzioni e i richiami sono disposti su una tavola più alta.

## Verifiche

`npm run check`, `npm run verifica:stile` e `npm run build` completati per la composizione iniziale. La nuova disposizione è verificata con Edge a 360, 390, 600, 601, 650, 768, 769, 900, 1000 e 1440 pixel: nessuna foto tagliata, nessuna sovrapposizione tra foto o fra foto e segnaposto, nessun testo debordante. Build Docker e verifica sulla porta 3000 dei quattro collegamenti su foto e segnaposto e dei due richiami «Vedi di più».
