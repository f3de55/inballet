const SCHEDA = 'Revisione';

function doPost(e) {
  try {
    const dati = JSON.parse(e.postData.contents);
    const chiave = PropertiesService.getScriptProperties().getProperty('CHIAVE');
    if (!chiave || dati.chiave !== chiave) return risposta({ errore: 'Chiave non valida: CHIAVE nelle proprietà dello script deve essere uguale a GOOGLE_REVISIONE_CHIAVE' });
    if (dati.azione === 'prepara') return risposta(prepara(dati));
    if (dati.azione === 'sessione') return risposta(sessione(dati));
    if (dati.azione === 'riga') return risposta(riga(dati));
    return risposta({ errore: 'Azione sconosciuta' });
  } catch (err) {
    return risposta({ errore: String((err && err.message) || err) });
  }
}

function risposta(oggetto) {
  return ContentService.createTextOutput(JSON.stringify(oggetto)).setMimeType(ContentService.MimeType.JSON);
}

function conBlocco(lavoro) {
  const blocco = LockService.getScriptLock();
  blocco.waitLock(30000);
  try {
    return lavoro();
  } finally {
    blocco.releaseLock();
  }
}

function tabella(idFoglio, colonne) {
  const file = SpreadsheetApp.openById(idFoglio);
  let scheda = file.getSheetByName(SCHEDA);
  if (!scheda) {
    scheda = file.insertSheet(SCHEDA, 0);
    if (scheda.getMaxColumns() > colonne.length) scheda.deleteColumns(colonne.length + 1, scheda.getMaxColumns() - colonne.length);
    scheda.setFrozenRows(1);
    scheda.getRange(1, 1, scheda.getMaxRows(), colonne.length).setVerticalAlignment('top').setWrap(true);
    scheda.getRange(1, 1, scheda.getMaxRows(), colonne.length).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  }
  allinea(scheda, colonne);
  return { file, scheda };
}

function allinea(scheda, colonne) {
  colonne.forEach((colonna, i) => {
    const n = i + 1;
    if (n <= scheda.getMaxColumns() && scheda.getRange(1, n).getValue() === colonna.nome) return;
    if (n <= scheda.getLastColumn()) scheda.insertColumnBefore(n);
    else if (n > scheda.getMaxColumns()) scheda.insertColumnAfter(scheda.getMaxColumns());
    const intera = scheda.getRange(1, n, scheda.getMaxRows(), 1);
    intera.clearDataValidations().setVerticalAlignment('top').setWrap(true);
    if (colonna.tipo === 'casella') intera.setHorizontalAlignment('center');
    scheda.getRange(1, n).setValue(colonna.nome);
    scheda.setColumnWidth(n, colonna.larghezza);
  });
  scheda.getRange(1, 1, 1, colonne.length).setFontWeight('bold');
  const fasce = scheda.getBandings()[0];
  if (fasce) fasce.setRange(scheda.getRange(1, 1, scheda.getMaxRows(), colonne.length));
}

function prepara(dati) {
  return conBlocco(() => {
    const { file } = tabella(dati.foglio, dati.colonne);
    const esito = { foglio: file.getName() };
    if (dati.cartella) esito.cartella = DriveApp.getFolderById(dati.cartella).getName();
    return esito;
  });
}

function sottocartella(cartella, nome) {
  const trovate = cartella.getFoldersByName(nome);
  return trovate.hasNext() ? trovate.next() : cartella.createFolder(nome);
}

function sessione(dati) {
  const cartella = conBlocco(() => sottocartella(DriveApp.getFolderById(dati.cartella), dati.pagina));
  const avvio = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': dati.tipo,
      'X-Upload-Content-Length': String(dati.peso),
    },
    payload: JSON.stringify({ name: dati.nome, parents: [cartella.getId()] }),
    muteHttpExceptions: true,
  });
  if (avvio.getResponseCode() !== 200) return { errore: 'Google Drive: ' + avvio.getContentText() };
  const intestazioni = avvio.getAllHeaders();
  return { sessione: intestazioni.Location || intestazioni.location };
}

function testoRicco(valore) {
  const voci = valore.collegamenti || [];
  const testo = valore.collegamenti ? voci.map((v) => v.nome).join('\n') : valore.testo || '';
  const ricco = SpreadsheetApp.newRichTextValue().setText(testo);
  let inizio = 0;
  voci.forEach((v) => {
    ricco.setLinkUrl(inizio, inizio + v.nome.length, v.url);
    inizio += v.nome.length + 1;
  });
  return ricco.build();
}

function riga(dati) {
  return conBlocco(() => {
    const { scheda } = tabella(dati.foglio, dati.colonne);
    const r = scheda.getLastRow() + 1;
    if (r > scheda.getMaxRows()) {
      scheda.insertRowsAfter(scheda.getMaxRows(), 100);
      allinea(scheda, dati.colonne);
    }
    dati.colonne.forEach((colonna, i) => {
      const cella = scheda.getRange(r, i + 1);
      if (colonna.tipo === 'data') cella.setValue(new Date()).setNumberFormat('dd/mm/yyyy hh:mm');
      else if (colonna.tipo === 'casella') cella.insertCheckboxes();
      else cella.setRichTextValue(testoRicco(dati.valori[i] || {}));
    });
    return { riga: r };
  });
}
