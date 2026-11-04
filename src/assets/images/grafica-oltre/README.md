# La danza oltre i corsi

Otto illustrazioni originali ad acquerello azzurro, con fondo trasparente.
Il riferimento visivo è la grafica di `grafica-contatti`: soggetti leggeri.
Su desktop e tablet ogni illustrazione è una piccola vignetta di 80 × 80 px,
centrata sopra il titolo, senza rotazioni, ritagli o sovrapposizioni al testo. Nel layout
mobile le card scorrevoli usano invece le fotografie delle pagine collegate,
definite in `src/data/immagini-pagine.ts`. Queste illustrazioni rimangono
solo nella griglia a filetti di desktop e tablet.

| File | Soggetto e significato |
| --- | --- |
| `formazione-insegnanti.png` | Manuale e tocco: studio e qualifica del percorso biennale. |
| `formazioni-personalizzate.png` | Schede, matita e nastro: un percorso espressivo costruito su misura. |
| `spettacoli-eventi.png` | Sipario, palco e luce: spettacoli ed eventi della scuola. |
| `collaborazioni-scuole.png` | Quaderno, matite e nastro: danza e movimento nel contesto scolastico. |
| `sportello-psicologico.png` | Due poltrone in dialogo: ascolto e sostegno alle famiglie. |
| `progetto-noiconvoi.png` | Giovani e volontari che danzano insieme: partecipazione e sostegno reciproco. |
| `classi-integrate.png` | Bambini diversi e insegnante in cerchio: accoglienza nel gruppo di danza. |
| `sostenitori.png` | Mani che sostengono un cuore: donazioni e volontariato a supporto dei progetti. |

Sorgenti PNG trasparenti, convertite in WebP da `Img.astro` al build
in varianti responsive da 80 e 160 px e caricate in modo differito. I file originali
non vengono serviti al browser. Le immagini sono decorative (`alt=""`)
perché titoli e descrizioni forniscono già il contenuto della cella.
