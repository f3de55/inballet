# Hero delle pagine interne

12 pagine aggiornate, con composizione desktop 16:5 e tablet 8:5.
PNG nuovi: 2560 × 800 e 1600 × 1000, in `src/assets/images/hero-pagine`.
Il sito li distribuisce come WebP ottimizzati tramite Astro.

## Immagini

| Pagina | Fotografia / banner |
| --- | --- |
| Chi siamo | `gallery-7.jpg`, gruppo della scuola |
| Corsi | `gallery-3.jpg`, gruppo in scena |
| Contatti | `foto/sede-lainate.jpg`, sede con insegna |
| Documenti | Nuova natura morta: cartella, fogli e penna in uno studio di danza |
| Formazione insegnanti | Coppia già preparata `hero-corsi/lezioni-individuali` |
| Formazioni personalizzate | `foto/bambini-insegnante.jpg`, didattica del movimento |
| Collaborazioni scuole | Coppia già preparata `hero-corsi/bambini` |
| Classi integrate | `gallery-9.jpg` |
| Progetto NoiConVoi | Coppia già preparata `hero-corsi/prima-infanzia` |
| Sostenitori | Coppia `hero-corsi/prima-infanzia`, coerente con i progetti per le famiglie |
| Sportello psicologico | Illustrazione originale `foto/sportellopsicologico-adulti.jpg` |
| Spettacoli ed eventi | `ballerina.jpg`, finale dello spettacolo |

La home mantiene la hero video già preparata. Su mobile resta l'illustrazione comune.
Le fotografie delle CTA e delle sezioni successive non sono state sostituite.

## Lavorazione e controlli

`manifest.json` conserva foto originali, prompt, composizione, output Imagegen e percorsi finali.
Il riempimento è stato prodotto con lo strumento Imagegen integrato. Le fotografie originali
sono ricomposte sopra lo sfondo generato per conservarne persone, volti e pose.
Due estensioni desktop sono state ripulite dalle sagome duplicate generate fuori dalla fotografia.
Le fasce di raccordo riguardano il fondale. Nello sportello si conserva la campitura crema originale.

```powershell
node scripts/prepara-hero-pagine.mjs verify
node scripts/prepara-hero-pagine.mjs review
npx astro check --tsconfig output/hero-banners/tsconfig-check.json --minimumSeverity warning
```

Il controllo confronta i pixel originali delle fotografie non oggetto di rimozione e verifica le dimensioni dei 16 PNG nuovi.
Le tavole `revisione-1.png` e `revisione-2.png` mostrano desktop e tablet affiancati.

Le sorgenti sono collegate in `src/lib/hero-pagine.ts`; i rapporti e i breakpoint sono in
`src/styles/components/hero.css`. I preload usano gli stessi breakpoint: desktop da 1025 px,
tablet da 769 a 1024 px, mobile fino a 768 px.

## Correzione Contatti

Su richiesta è stata rimossa l'ala anteriore incompleta a sinistra della sede,
ricostruendo cielo, cortile e vegetazione. Sostituite entrambe le versioni:
`src/assets/images/hero-pagine/contatti-desktop.png` (2560 × 800) e
`src/assets/images/hero-pagine/contatti-tablet.png` (1600 × 1000).
Strumento: Imagegen integrato. Prompt completi in `correzione-contatti.json`.
Le immagini precedenti sono conservate come `contatti-*-prima-correzione.png`.
Per questi due banner il confronto con tutti i pixel originali non si applica,
poiché la rimozione modifica intenzionalmente una parte della fotografia originale.
