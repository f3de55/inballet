/** Utility di testo condivise (equivalenti delle funzioni PHP usate in origine). */

/** htmlspecialchars(…, ENT_QUOTES) */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Inverso di escapeHtml: i campi evento sono salvati già con escape. */
export function decodeHtml(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|#0?39|apos);/g, (_, e: string) =>
    ({ amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'", '#39': "'", apos: "'" })[e]!,
  );
}

/** strip_tags() con lista opzionale di tag consentiti (es. ['b','i']). */
export function stripTags(s: string, allowed: string[] = []): string {
  const ok = new Set(allowed.map((t) => t.toLowerCase()));
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name: string) => (ok.has(name.toLowerCase()) ? tag : ''));
}

/** Lunghezza in caratteri Unicode (mb_strlen). */
export const mbLen = (s: string) => [...s].length;

/** Primi `n` caratteri Unicode (mb_substr). */
export const mbSlice = (s: string, n: number) => [...s].slice(0, n).join('');

/** "Galà di Natale" → "gala-di-natale" (al massimo `max` caratteri, senza trattino finale). */
export const slug = (s: string, max = 40) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');

/** Campo di un form: stringa su una riga, senza spazi doppi (vuota se il valore non è una stringa). */
export const riga = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/** Aggiunge a `errori` il messaggio per un campo vuoto (se obbligatorio) o troppo lungo. */
export function controllaLunghezza(errori: string[], nome: string, valore: string, max: number, obbligatorio = false) {
  if (obbligatorio && !valore) errori.push(`${nome}: campo obbligatorio`);
  else if (mbLen(valore) > max) errori.push(`${nome}: massimo ${max} caratteri`);
}

/**
 * Mette in grassetto (<strong>) le frasi indicate: solo la prima volta che compaiono, mai dentro
 * un link o un altro grassetto. Serve per le parole chiave dei testi (età, qualifiche, nomi dei corsi)
 * senza sporcare i dati usati anche da chatbot, schema.org e llms.txt, che restano testo semplice.
 */
export function enfatizza(html: string, frasi: readonly string[]): string {
  let dentro = 0;
  const fatte = new Set<string>();
  return html
    .split(/(<[^>]+>)/)
    .map((parte) => {
      if (parte.startsWith('<')) {
        if (/^<(a|strong|b)[\s>]/i.test(parte)) dentro++;
        else if (/^<\/(a|strong|b)>/i.test(parte)) dentro--;
        return parte;
      }
      if (dentro > 0) return parte;
      const trovate: { da: number; a: number }[] = [];
      for (const f of frasi) {
        if (fatte.has(f)) continue;
        const da = parte.indexOf(f);
        if (da < 0) continue;
        const a = da + f.length;
        if (trovate.some((t) => da < t.a && a > t.da)) continue;
        trovate.push({ da, a });
        fatte.add(f);
      }
      let out = '';
      let pos = 0;
      for (const t of trovate.sort((x, y) => x.da - y.da)) {
        out += `${parte.slice(pos, t.da)}<strong>${parte.slice(t.da, t.a)}</strong>`;
        pos = t.a;
      }
      return out + parte.slice(pos);
    })
    .join('');
}

/** Testi scritti nella dashboard: «**parola**» diventa grassetto, tutto il resto è testo (HTML escluso). */
export const grassettoDaTesto = (s: string) => escapeHtml(s).replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

/** Lo stesso testo senza i segni del grassetto (meta description, anteprime). */
export const senzaGrassetto = (s: string) => s.replace(/\*\*([^*]+?)\*\*/g, '$1');
