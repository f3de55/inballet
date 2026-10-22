/**
 * Dati demo per la dashboard: eventi completi (con locandina generata) e
 * messaggi del chatbot. Tutto ciò che nasce qui ha `demo: true`, così può
 * essere rimosso senza toccare i dati veri.
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LogEntry } from './chatbot';
import { baseSlug, leggiEventi, leggiTipi, slugUnico, type Evento } from './eventi';
import { ensureDir, paths, readJson, serialized, writeJson } from './storage';
import { romeDate, romeHour, romeIso, romeTimestamp } from './time';
import { creaMini, filePath, nomeMini, PUBLIC_PREFIX } from './uploads';

export const MAX_EVENTI = 60;
export const MAX_MESSAGGI = 2000;
const MAX_LOG = 10000;

// === RISORSE (foto e font) ===

/** Prima cartella esistente: nel container (demo/foto) o nel progetto (src/assets/images). */
const cartella = (...candidati: string[]) => candidati.map((c) => path.resolve(c)).find((c) => existsSync(c)) ?? path.resolve(candidati[0]);
const DIR_FOTO = cartella('demo/foto', 'src/assets/images');
const DIR_FONT = cartella('demo/fonts');
const FOTO = ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-4', 'gallery-5', 'gallery-6', 'gallery-7', 'gallery-8', 'gallery-9', 'gallery-10', 'hero-bg', 'hero-danza-contemporanea', 'ballerina', 'bg-progetti-territorio'];

// === MODELLI DI EVENTO ===

interface Modello {
  tipo: string;
  titolo: string;
  /** Titolo breve della locandina, a capo con \n */
  locandina: string;
  luogo: string;
  sede: string;
  ora: string;
  /** Ora di fine, se nota */
  oraFine?: string;
  /** Si svolge anche il giorno dopo (stage del weekend: inizia di sabato) */
  dueGiorni?: boolean;
  descrizione: string;
  destinatari: string;
  costo: string;
  foto: string;
  /** Solo sabato e domenica */
  weekend?: boolean;
  /** Solo il lunedì (NoiConVoi) */
  lunedi?: boolean;
}

const LAINATE = 'Sede di Lainate, Via Puccini 14';
const RHO = 'Sede di Rho, Via Tevere 19';

const MODELLI: Modello[] = [
  { tipo: 'Spettacolo', titolo: 'Spettacolo di fine anno', locandina: 'Spettacolo\ndi fine anno', luogo: 'Teatro Comunale di Lainate', sede: 'Teatro di Lainate', ora: '20:30', oraFine: '22:30', weekend: true, foto: 'gallery-6',
    descrizione: 'Tutti i corsi della scuola sul palco per chiudere l\'anno accademico.<ul><li>Durata: circa due ore con intervallo</li><li>Biglietti in segreteria</li></ul>', destinatari: 'Famiglie e amici degli allievi', costo: '10 €' },
  { tipo: 'Spettacolo', titolo: 'Galà di Natale', locandina: 'Galà\ndi Natale', luogo: 'Teatro Civico di Rho', sede: 'Teatro di Rho', ora: '20:45', weekend: true, foto: 'gallery-10',
    descrizione: 'Coreografie di <b>classica, modern e urban</b> per festeggiare insieme le feste.', destinatari: 'Aperto a tutti', costo: '12 €' },
  { tipo: 'Saggio', titolo: 'Saggio dei corsi bambini', locandina: 'Saggio\ndei piccoli', luogo: 'Teatro Comunale di Lainate', sede: 'Teatro di Lainate', ora: '16:00', weekend: true, foto: 'hero-bg',
    descrizione: 'Avviamento ed Educazione alla Danza portano in scena il lavoro dell\'anno.<ul><li>Ingresso dalle 15:30</li><li>Posti non numerati</li></ul>', destinatari: 'Famiglie degli allievi', costo: '8 €' },
  { tipo: 'Workshop', titolo: 'Workshop di danza contemporanea', locandina: 'Corpo\nin ascolto', luogo: RHO, sede: 'Sede di Rho', ora: '10:30', foto: 'gallery-2',
    descrizione: 'Tre ore di lavoro su <b>improvvisazione</b> e composizione con una coreografa ospite.<ul><li>Livello intermedio/avanzato</li><li>Abbigliamento comodo, piedi nudi</li></ul>', destinatari: 'Allievi intermedi e avanzati, dai 14 anni', costo: '35 €' },
  { tipo: 'Workshop', titolo: 'Workshop di Hip-Hop e Krumping', locandina: 'Energia\nurban', luogo: RHO, sede: 'Sede di Rho', ora: '15:00', foto: 'gallery-5',
    descrizione: 'Un pomeriggio dedicato alla cultura Hip-Hop: <b>Old School</b>, Popping e Krumping con un insegnante ospite.', destinatari: 'Ragazzi dai 10 anni', costo: '25 €' },
  { tipo: 'Workshop', titolo: 'Workshop di Heels', locandina: 'Heels\nworkshop', luogo: LAINATE, sede: 'Sede di Lainate', ora: '18:30', foto: 'gallery-3',
    descrizione: 'Portamento, linee e musicalità sui tacchi. Si consiglia una base di tecnica.<ul><li>Portare scarpe con tacco stabile</li></ul>', destinatari: 'Dai 16 anni', costo: '25 €' },
  { tipo: 'Workshop', titolo: 'Workshop di Pilates per danzatori', locandina: 'Pilates\nper danzatori', luogo: LAINATE, sede: 'Sede di Lainate', ora: '10:00', foto: 'gallery-9',
    descrizione: 'Il lavoro sulla <b>Power House</b> applicato alla danza: controllo, respiro e stabilità.', destinatari: 'Allievi e adulti di tutti i livelli', costo: '20 €' },
  { tipo: 'Lezione aperta', titolo: 'Lezione aperta di danza classica', locandina: 'Classica\na porte aperte', luogo: LAINATE, sede: 'Sede di Lainate', ora: '18:30', foto: 'ballerina',
    descrizione: 'Le famiglie assistono alla lezione: sbarra, centro e diagonali come in un giorno normale.', destinatari: 'Famiglie degli allievi', costo: 'Gratuito' },
  { tipo: 'Lezione aperta', titolo: 'Lezione aperta di Avviamento alla Danza', locandina: 'I primi\npassi', luogo: LAINATE, sede: 'Sede di Lainate', ora: '17:00', foto: 'gallery-8',
    descrizione: 'Le famiglie assistono alla lezione dei bimbi che hanno compiuto <b>3 anni</b>: gioco, musica e movimento.', destinatari: 'Bambini dai 3 ai 4 anni con un genitore', costo: 'Gratuito' },
  { tipo: 'Lezione aperta', titolo: 'Lezione aperta di Breaking', locandina: 'Breaking\nday', luogo: RHO, sede: 'Sede di Rho', ora: '17:30', foto: 'gallery-5',
    descrizione: 'Passi in piedi, lavoro al pavimento e il primo <b>freeze</b>. Classi a numero chiuso.', destinatari: 'Bambini e ragazzi dai 6 anni', costo: 'Gratuito' },
  { tipo: 'Open Day', titolo: 'Open Day: porte aperte a Lainate', locandina: 'Porte\naperte', luogo: LAINATE, sede: 'Sede di Lainate', ora: '15:00', weekend: true, foto: 'gallery-7',
    descrizione: 'Un pomeriggio per conoscere la scuola e incontrare le insegnanti. <b>Prenotazione consigliata.</b>', destinatari: 'Bambini dai 3 anni, ragazzi e adulti', costo: 'Gratuito' },
  { tipo: 'Open Day', titolo: 'Open Day: porte aperte a Rho', locandina: 'Vieni\na trovarci', luogo: RHO, sede: 'Sede di Rho', ora: '15:00', weekend: true, foto: 'gallery-4',
    descrizione: 'Un pomeriggio per conoscere la scuola, vedere le sale e chiedere informazioni sulle iscrizioni.', destinatari: 'Aperto a tutti', costo: 'Gratuito' },
  { tipo: 'Stage', titolo: 'Stage intensivo di danza classica', locandina: 'Stage\nclassico', luogo: RHO, sede: 'Sede di Rho', ora: '10:00', weekend: true, foto: 'hero-bg',
    descrizione: 'Due lezioni di tecnica e una di <b>repertorio</b> con maître ospite.<ul><li>Livello avanzato</li><li>Iscrizione obbligatoria</li></ul>', destinatari: 'Allievi avanzati, dai 12 anni', costo: '45 €' },
  { tipo: 'Stage', titolo: 'Stage di danza moderna', locandina: 'Modern\nstage', luogo: RHO, sede: 'Sede di Rho', ora: '14:00', weekend: true, foto: 'hero-danza-contemporanea',
    descrizione: 'Contrazione e rilascio, linee e dinamiche dello stile <b>Modern</b> in un pomeriggio di studio.', destinatari: 'Dai 10 anni', costo: '30 €' },
  { tipo: 'Rassegna', titolo: 'Rassegna "Danza in città"', locandina: 'Danza\nin città', luogo: 'Villa Litta, Lainate', sede: 'Villa Litta', ora: '18:00', weekend: true, foto: 'gallery-1',
    descrizione: 'Scuole del territorio e allievi InBallet insieme in una serata all\'aperto.', destinatari: 'Aperto a tutti', costo: 'Gratuito' },
  { tipo: 'Concorso', titolo: 'Concorso coreografico regionale', locandina: 'Giovani\ntalenti', luogo: 'Teatro Nuovo, Milano', sede: 'Milano', ora: '09:30', weekend: true, foto: 'gallery-3',
    descrizione: 'I gruppi di Modern e Contemporanea partecipano con le coreografie dell\'anno.', destinatari: 'Allievi selezionati e famiglie', costo: 'Ingresso 10 €' },
  { tipo: 'Festa', titolo: 'Festa di Carnevale in danza', locandina: 'Carnevale\nin danza', luogo: LAINATE, sede: 'Sede di Lainate', ora: '15:30', weekend: true, foto: 'gallery-1',
    descrizione: 'Pomeriggio in maschera con giochi musicali e balli di gruppo.', destinatari: 'Bambini e famiglie', costo: 'Gratuito' },
  { tipo: 'Festa', titolo: 'Festa di fine estate', locandina: 'Fine\nestate', luogo: 'Piazza Vittorio Emanuele, Lainate', sede: 'Lainate', ora: '18:00', weekend: true, foto: 'gallery-6',
    descrizione: 'Esibizioni in piazza e presentazione dei corsi del nuovo anno.', destinatari: 'Aperto a tutti', costo: 'Gratuito' },
  { tipo: 'Workshop', titolo: 'Movimento Creativo: incontro di ricerca', locandina: 'Movimento\ncreativo', luogo: LAINATE, sede: 'Sede di Lainate', ora: '20:00', foto: 'gallery-9',
    descrizione: 'Una sessione per adulti, anche non danzatori: respiro, ascolto e <i>atto creativo</i>.', destinatari: 'Adulti dai 18 anni', costo: '15 €' },
  { tipo: 'Lezione aperta', titolo: 'NoiConVoi: lezione aperta ai volontari', locandina: 'Noi\ncon voi', luogo: LAINATE, sede: 'Sede di Lainate', ora: '20:00', lunedi: true, foto: 'gallery-8',
    descrizione: 'Chi vuole diventare volontario del progetto può partecipare a una lezione del lunedì sera.', destinatari: 'Volontari, anche non danzatori', costo: 'Gratuito' },
];

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const casuale = <T>(lista: readonly T[]) => lista[Math.floor(Math.random() * lista.length)];
const tra = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const hex = (n: number) => randomBytes(n).toString('hex');

/** Data YYYY-MM-DD a `giorni` da oggi; se serve, spostata al primo giorno ammesso (weekend o lunedì). */
function dataDa(giorni: number, m: Pick<Modello, 'weekend' | 'lunedi'>) {
  const d = new Date(`${romeDate()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + giorni);
  const ammessi = m.lunedi ? [1] : m.weekend ? [0, 6] : null;
  if (ammessi) while (!ammessi.includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const escapeMarkup = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// === LOCANDINA ===

/** Locandina come quelle della scuola: foto, sfumatura scura, tipo, titolo, data e sede, firma. */
async function creaLocandina(m: Modello, data: string, verticale: boolean): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  const W = verticale ? 1080 : 1600;
  const H = verticale ? 1350 : 900;
  const pad = verticale ? 76 : 70;
  const font = path.join(DIR_FONT, 'Rubik.ttf');
  const corsivo = path.join(DIR_FONT, 'Rubik-Italic.ttf');

  const testo = async (markup: string, fontfile: string, famiglia: string) => {
    const { data: buf, info } = await sharp({ text: { text: markup, font: famiglia, fontfile, rgba: true, dpi: 72, width: W - pad * 2, wrap: 'word' } })
      .png()
      .toBuffer({ resolveWithObject: true });
    return { buf, w: info.width, h: info.height };
  };

  const [y, mm, d] = data.split('-').map(Number);
  const tipo = await testo(`<span foreground="#87CEEB" font_weight="600" letter_spacing="${5 * 1024}">${escapeMarkup(m.tipo.toUpperCase())}</span>`, font, `Rubik ${verticale ? 26 : 24}`);
  const titolo = await testo(`<span foreground="#ffffff" font_weight="700">${escapeMarkup(m.locandina)}</span>`, font, `Rubik ${verticale ? 104 : 92}`);
  const info = await testo(`<span foreground="#ffffffdd">${d} ${MESI[mm - 1]} ${y}  ·  ${escapeMarkup(m.sede)}</span>`, font, `Rubik ${verticale ? 30 : 28}`);
  const firma = await testo('<span foreground="#ffffff">InBallet</span>', corsivo, `Rubik Italic ${verticale ? 34 : 32}`);

  const sfumatura = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="${verticale ? 0.35 : 0.2}" stop-color="#0d0d0d" stop-opacity="0"/>
      <stop offset="1" stop-color="#0d0d0d" stop-opacity="0.9"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/></svg>`);

  const fondo = H - pad;
  const yInfo = fondo - info.h;
  const yTitolo = yInfo - 28 - titolo.h;
  const yTipo = yTitolo - 22 - tipo.h;

  return sharp(path.join(DIR_FOTO, `${m.foto}.jpg`))
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .composite([
      { input: sfumatura, left: 0, top: 0 },
      { input: tipo.buf, left: pad, top: yTipo },
      { input: titolo.buf, left: pad, top: yTitolo },
      { input: info.buf, left: pad, top: yInfo },
      { input: firma.buf, left: W - pad - firma.w, top: fondo - firma.h },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

// === EVENTI ===

export async function contaEventiDemo(): Promise<number> {
  return (await leggiEventi()).filter((e) => e.demo).length;
}

/** Genera `quanti` eventi completi (con locandina). Con `passati` alcuni cadono negli ultimi 3 mesi. */
export async function generaEventi(quanti: number, passati: boolean): Promise<number> {
  const n = Math.max(1, Math.min(MAX_EVENTI, Math.floor(quanti)));
  const tipi = await leggiTipi();
  await ensureDir(paths.immaginiEventi);

  // Modelli mescolati e ripetuti finché servono
  const scelti: Modello[] = [];
  while (scelti.length < n) scelti.push(...[...MODELLI].sort(() => Math.random() - 0.5));

  const nuovi: Evento[] = [];
  const usati = new Set<string>();
  for (const m of scelti.slice(0, n)) {
    let data = '';
    for (let t = 0; t < 20; t++) {
      data = dataDa(passati && Math.random() < 0.3 ? tra(-90, -1) : tra(1, 300), m);
      if (!usati.has(m.titolo + data)) break;
    }
    usati.add(m.titolo + data);

    const verticale = Math.random() < 0.7;
    const nome = `demo-${data}-${hex(3)}.jpg`;
    await writeFile(filePath(nome), await creaLocandina(m, data, verticale));

    const adesso = romeIso();
    nuovi.push({
      id: 'evt_' + hex(6),
      titolo: m.titolo,
      data,
      ora: m.ora,
      // Solo tipi esistenti: se è stato rimosso dalla dashboard, l'evento resta senza tipo
      tipo: tipi.find((t) => t.toLowerCase() === m.tipo.toLowerCase()) ?? '',
      luogo: m.luogo,
      descrizione: m.descrizione,
      immagine: PUBLIC_PREFIX + nome,
      destinatari: m.destinatari,
      costo: m.costo,
      creato: adesso,
      modificato: adesso,
      demo: true,
    });
  }

  await serialized(async () => {
    const eventi = await leggiEventi();
    await writeJson(paths.eventi, [...eventi, ...nuovi]);
  });
  return nuovi.length;
}

/** Rimuove gli eventi demo e le loro locandine generate. */
export async function rimuoviEventiDemo(): Promise<number> {
  const rimossi = await serialized(async () => {
    const eventi = await leggiEventi();
    await writeJson(paths.eventi, eventi.filter((e) => !e.demo));
    return eventi.filter((e) => e.demo);
  });
  // Solo i file creati dal generatore (demo-*), mai le locandine caricate
  const inUso = new Set((await leggiEventi()).map((e) => path.basename(e.immagine ?? '')));
  const files = await readdir(paths.immaginiEventi).catch(() => [] as string[]);
  await Promise.all(files.filter((f) => f.startsWith('demo-') && !inUso.has(f)).map((f) => unlink(filePath(f)).catch(() => {})));
  return rimossi.length;
}

// === CHATBOT ===

/** Domande tipiche con l'inizio della risposta (come nel registro reale). */
const DOMANDE: [string, string][] = [
  ['Da che età si può iniziare danza?', 'Si comincia dai 3 anni con Avviamento alla Danza, un percorso di gioco, musica e movimento.'],
  ['quanto costa iscriversi', 'La quota associativa annuale è di 30 €; il costo dei corsi dipende da disciplina e frequenza.'],
  ['Dove siete a Lainate?', 'La sede centrale è in Via Puccini 14 a Lainate. A Rho siamo in Via Tevere 19.'],
  ['Come scelgo il corso giusto?', 'Contatta la segreteria: ti aiutiamo a scegliere il corso adatto per età e livello.'],
  ['Che orari ha la segreteria?', 'Lun, Mar e Ven 15:00-23:00, Mer 16:00-23:30, Gio 15:00-23:30, Sab 10:30-19:00.'],
  ['avete hip hop per bambini di 7 anni?', 'Sì, l\'Hip-Hop si può iniziare dai 6 anni con classi divise per età e livello.'],
  ['Corsi per bambini', 'Per i più piccoli ci sono Avviamento alla Danza (dai 3 anni) ed Educazione alla Danza (4-5 anni).'],
  ['Sedi e orari', 'Siamo a Lainate (Via Puccini 14) e a Rho (Via Tevere 19). La segreteria è aperta dal lunedì al sabato.'],
  ['Come contattarvi', 'Puoi chiamare il +39 393 780 2996, scrivere su WhatsApp o a info@inballet.it.'],
  ['Come iscriversi', 'Scarica il modulo dalla pagina Documenti, compilalo e consegnalo in segreteria con il certificato medico.'],
  ['serve il certificato medico?', 'Dai 6 anni serve il certificato per attività sportiva non agonistica; sotto i 6 basta l\'autocertificazione.'],
  ['C\'è un corso di danza per adulti principianti?', 'Sì: Contemporanea Adulti dai 40 anni e Movimento Creativo dai 18, anche senza esperienza.'],
  ['fate pilates la mattina?', 'Per gli orari precisi di Pilates ti consiglio di contattare la segreteria.'],
  ['Cos\'è il progetto NoiConVoi?', 'È il progetto di volontariato nato nel 2013 che accoglie ragazzi con disabilità, il lunedì sera.'],
  ['Come divento insegnante di danza?', 'Il corso biennale per Insegnanti di Danza (Modern) rilascia un titolo riconosciuto CSEN e CONI.'],
  ['quando è il saggio di fine anno', 'Le date degli spettacoli sono nel calendario della pagina Spettacoli ed Eventi.'],
  ['Avete danza classica per ragazze di 12 anni?', 'Certo, ci sono corsi di Danza Classica divisi per livello: in segreteria ti indicano la classe giusta.'],
  ['Si può pagare a rate?', 'Sì, il corso si paga in tre rate: settembre, dicembre e marzo.'],
  ['C\'è il parcheggio a Rho?', 'Per informazioni su come raggiungerci chiama la segreteria al +39 393 780 2996.'],
  ['lo sportello psicologico come funziona', 'Si possono fissare incontri con la dottoressa psicoterapeuta su richiesta alla Direzione.'],
  ['heels da che età', 'Heels è pensato per ragazze e adulti con una base di tecnica: chiedi in segreteria per il livello.'],
  ['ciao', 'Ciao! Posso aiutarti con corsi, sedi, orari o iscrizioni?'],
  ['Che tempo fa domani?', 'Mi occupo solo di InBallet! Posso aiutarti con info sui nostri corsi?'],
];
const FILTRATI = ['asdasdasd', 'aaaaaaaa', 'kjhkjhkjh'];
const BROWSER = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 Version/18.5 Safari/605.1.15',
];
/** Peso per ora del giorno: poco di notte, picco nel tardo pomeriggio e sera. */
const PESI_ORA = [1, 0, 0, 0, 0, 0, 1, 2, 4, 6, 6, 6, 5, 6, 6, 7, 9, 11, 12, 12, 11, 9, 6, 3];

export interface StatoDemoChat {
  demo: number;
  totali: number;
}

export async function statoChatDemo(): Promise<StatoDemoChat> {
  const logs = await readJson<LogEntry[]>(paths.analytics, []);
  return { demo: logs.filter((l) => l.demo).length, totali: logs.length };
}

/**
 * Genera `quanti` messaggi negli ultimi `giorni` giorni. Il registro tiene al massimo
 * 10.000 righe: se non c'è posto ne genera meno, senza mai cancellare quelle vere.
 */
export async function generaChat(quanti: number, giorni: number): Promise<number> {
  const g = Math.max(1, Math.min(365, Math.floor(giorni)));
  return serialized(async () => {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    const n = Math.max(0, Math.min(MAX_MESSAGGI, Math.floor(quanti), MAX_LOG - logs.length));
    if (!n) return 0;

    const persone = Array.from({ length: Math.max(1, Math.round(n / 3)) }, () => ({ ip: hex(4), ua: casuale(BROWSER) }));
    const totPesi = PESI_ORA.reduce((a, b) => a + b, 0);
    const oraCasuale = () => {
      let r = Math.random() * totPesi;
      return PESI_ORA.findIndex((p) => (r -= p) < 0);
    };

    const nuovi: LogEntry[] = [];
    for (let i = 0; i < n; i++) {
      // Giorno a caso nel periodo (oggi compreso), ora del giorno pesata, mai nel futuro
      const giorno = romeDate(Date.now() - tra(0, g - 1) * 86400000);
      const pad = (x: number) => String(x).padStart(2, '0');
      const quando = Math.min(romeTimestamp(giorno, `${pad(oraCasuale())}:${pad(tra(0, 59))}`), Date.now());
      const p = casuale(persone);
      const r = Math.random();
      let message: string;
      let risposta: string;
      let type: LogEntry['type'];
      if (r < 0.04) [message, risposta, type] = [casuale(FILTRATI), 'Messaggio non valido. Scrivi una domanda sulla scuola.', 'filtered'];
      else if (r < 0.06) [message, risposta, type] = [casuale(DOMANDE)[0], 'Troppi messaggi in poco tempo. Riprova tra qualche minuto.', 'blocked'];
      else if (r < 0.07) [message, risposta, type] = [casuale(DOMANDE)[0], 'In questo momento posso darti solo informazioni di base.', 'offline'];
      else {
        [message, risposta] = casuale(DOMANDE);
        type = Math.random() < 0.3 ? 'cached' : 'success';
      }
      // Risposte del modello: fornitore principale, a volte quello di riserva
      const riserva = Math.random() < 0.08;
      const token_in = tra(9500, 11500);
      const token_cache = Math.random() < 0.7 ? token_in - tra(150, 600) : 0;
      const token_out = tra(60, 260);
      const modello = type === 'success' ? (riserva ? { fornitore: 'mistral', modello: 'mistral-small-latest' } : { fornitore: 'anthropic', modello: 'claude-haiku-5-5' }) : {};
      const consumo =
        type === 'success'
          ? { token_in, token_cache, token_out, costo: ((token_in - token_cache) * 0.1 + token_cache * 0.01 + token_out * 0.5) / 1e6, ms: tra(700, 2600), fallback: riserva ? 1 : 0 }
          : {};
      nuovi.push({
        timestamp: romeIso(quando),
        date: romeDate(quando),
        hour: romeHour(quando),
        ip_hash: p.ip,
        message,
        response_preview: risposta.slice(0, 100),
        type,
        cached: type === 'cached',
        user_agent: p.ua,
        demo: true,
        ...modello,
        ...consumo,
      });
    }
    const tutti = [...logs, ...nuovi].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    await writeJson(paths.analytics, tutti);
    return n;
  });
}

export async function rimuoviChatDemo(): Promise<number> {
  return serialized(async () => {
    const logs = await readJson<LogEntry[]>(paths.analytics, []);
    const veri = logs.filter((l) => !l.demo);
    await writeJson(paths.analytics, veri);
    return logs.length - veri.length;
  });
}
