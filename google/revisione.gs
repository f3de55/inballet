const SCHEDA = 'Revisione';
const COLONNE = ['Data', 'Pagina', 'Testo', 'Immagini e video', 'Inserito'];
const LARGHEZZE = [130, 220, 520, 300, 90];

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

function tabella(idFoglio) {
  const file = SpreadsheetApp.openById(idFoglio);
  let scheda = file.getSheetByName(SCHEDA);
  if (scheda) return { file, scheda };
  scheda = file.insertSheet(SCHEDA, 0);
  const n = COLONNE.length;
  if (scheda.getMaxColumns() > n) scheda.deleteColumns(n + 1, scheda.getMaxColumns() - n);
  scheda.getRange(1, 1, 1, n).setValues([COLONNE]).setFontWeight('bold');
  scheda.setFrozenRows(1);
  LARGHEZZE.forEach((larghezza, i) => scheda.setColumnWidth(i + 1, larghezza));
  scheda.getRange(1, 1, scheda.getMaxRows(), n).setVerticalAlignment('top').setWrap(true);
  scheda.getRange(1, n, scheda.getMaxRows(), 1).setHorizontalAlignment('center');
  scheda.getRange(1, 1, scheda.getMaxRows(), n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  return { file, scheda };
}

function prepara(dati) {
  return conBlocco(() => {
    const { file } = tabella(dati.foglio);
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

function testoSemplice(testo) {
  return SpreadsheetApp.newRichTextValue().setText(testo).build();
}

function conCollegamenti(voci) {
  const testo = voci.map((v) => v.nome).join('\n');
  const valore = SpreadsheetApp.newRichTextValue().setText(testo);
  let inizio = 0;
  voci.forEach((v) => {
    valore.setLinkUrl(inizio, inizio + v.nome.length, v.url);
    inizio += v.nome.length + 1;
  });
  return valore.build();
}

function riga(dati) {
  return conBlocco(() => {
    const { scheda } = tabella(dati.foglio);
    const n = COLONNE.length;
    const r = scheda.getLastRow() + 1;
    if (r > scheda.getMaxRows()) scheda.insertRowsAfter(scheda.getMaxRows(), 100);
    const fasce = scheda.getBandings()[0];
    if (fasce) fasce.setRange(scheda.getRange(1, 1, scheda.getMaxRows(), n));
    scheda.getRange(r, 1).setValue(new Date()).setNumberFormat('dd/mm/yyyy hh:mm');
    scheda.getRange(r, 2, 1, 3).setRichTextValues([[conCollegamenti([{ nome: dati.pagina, url: dati.indirizzo }]), testoSemplice(dati.testo), conCollegamenti(dati.file)]]);
    scheda.getRange(r, n).insertCheckboxes();
    return { riga: r };
  });
}
