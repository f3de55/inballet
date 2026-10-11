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
