# InBallet Icons

Set vettoriale originale per InBallet: 116 disegni, con simboli specifici per danza e benessere.

Un'unica famiglia regular duotone su griglia 24 × 24: contorni da 1,8 unità, terminali e raccordi arrotondati, dettagli essenziali e accenti azzurri. Il blu InBallet definisce il simbolo; il secondo colore evidenzia una parte del soggetto, come il corpo di un oggetto o la direzione di una freccia. Nessuna illustrazione o decorazione incorporata nelle icone.

## Sul sito

`inballet.mjs` contiene i disegni e gli alias. Ogni disegno ha due livelli, `outline` e `accent`. `npm run icons` verifica tutti gli usi, anche quelli dinamici nei dati, e genera CSS con due maschere SVG sovrapposte e lo sprite pubblico `assets/icons/inballet.svg`. La build si interrompe se manca un disegno.

I nomi `fas`, `far`, `fab` e `fa-*` restano compatibili con i componenti esistenti. Usano tutti la stessa famiglia regular duotone InBallet e non richiedono Font Awesome né un font di icone. Il contorno eredita il colore del testo e l'accento usa `--icona-secondario`: azzurro sul sito, blu scuro sui pulsanti azzurri e azzurro sugli sfondi scuri. Nelle recensioni le stelle non assegnate mostrano solo il contorno.

```html
<i class="fas fa-arrow-right" aria-hidden="true"></i>

<svg width="24" height="24" aria-hidden="true">
  <use href="/assets/icons/inballet.svg#arrow-right"></use>
</svg>
```

Per nuovi usi, preferire SVG inline o sprite. Le icone decorative sono nascoste agli screen reader; il nome accessibile è sul pulsante o sul link. Mantenere un'area interattiva di almeno 44 × 44 px, indipendente dalle dimensioni del disegno. Usare i token di colore e dimensione del sito.

Le icone che introducono un blocco di contenuto usano `--icona-editoriale` (48 px), anche su mobile. Le righe e le competenze con supporto grafico usano `--icona-editoriale-compatta` (36 px). I simboli dentro link e recapiti usano `--icona-in-testo` (minimo 24 px), quelli secondari `--icona-mini` (20 px), i comandi `--icona-comando` (26 px) e il menu `--icona-menu` (32 px). Il piccolo indicatore di stato usa `--icona-punto`. La griglia di disegno da 24 unità non determina la dimensione visualizzata. Per il team building usare `users`, per le scuole `school`, per la formazione `chalkboard-user`.

## Pacchetto SVG

Le singole icone sono scalabili e modificabili in un editor vettoriale; includono entrambi i colori. `svg(nome, { layer: 'outline' })` e `svg(nome, { layer: 'accent' })` esportano i livelli separati. Gli SVG e lo sprite accettano `--ib-ink` e `--ib-tone` per adattare i colori al contesto. I simboli social e di pagamento restano riconoscibili; i rispettivi marchi appartengono ai loro titolari. Il set è realizzato per il progetto InBallet.

Ogni CTA a bottone contiene un'icona prima del testo: `ballet-shoes` per i corsi, `compass` per la scelta del percorso, `comments` per i contatti, `hand-holding-heart` per il sostegno, `calendar-days` per le prenotazioni e `paypal` per le donazioni. Le icone sono decorative e il testo resta il nome accessibile dell'azione.
