# InBallet Icons

Set vettoriale originale per InBallet: 100 disegni, 106 nomi usati dal sito.

Griglia 24 × 24, tratto 1,65, terminali e raccordi arrotondati. Colore ereditato dal testo. Le forme restano essenziali, leggibili e coerenti con il tono accogliente della scuola. Nessuna illustrazione o decorazione incorporata nelle icone.

## Sul sito

`inballet.mjs` contiene i disegni e gli alias. `npm run icons` verifica tutti gli usi, anche quelli dinamici nei dati, e genera CSS con maschere SVG e lo sprite pubblico `assets/icons/inballet.svg`. La build si interrompe se manca un disegno.

I nomi `fas`, `far`, `fab` e `fa-*` restano compatibili con i componenti esistenti. Sono collegati ai disegni InBallet: non richiedono Font Awesome né un font di icone. Le stelle delle recensioni hanno varianti piena e vuota; il pallino di stato resta pieno.

```html
<i class="fas fa-arrow-right" aria-hidden="true"></i>

<svg width="24" height="24" aria-hidden="true">
  <use href="/assets/icons/inballet.svg#arrow-right"></use>
</svg>
```

Per nuovi usi, preferire SVG inline o sprite. Le icone decorative sono nascoste agli screen reader; il nome accessibile è sul pulsante o sul link. Mantenere un'area interattiva di almeno 44 × 44 px, indipendente dalle dimensioni del disegno. Usare i token di colore e dimensione del sito.

## Pacchetto SVG

Le singole icone sono scalabili e modificabili in un editor vettoriale. I simboli social e di pagamento restano riconoscibili; i rispettivi marchi appartengono ai loro titolari. Il set è realizzato per il progetto InBallet.
