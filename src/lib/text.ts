export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function decodeHtml(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|#0?39|apos);/g, (_, e: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'", '#39': "'", apos: "'" })[e]!);
}

export function stripTags(s: string, allowed: string[] = []): string {
  const ok = new Set(allowed.map((t) => t.toLowerCase()));
  return s
    .replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name: string) => (ok.has(name.toLowerCase()) ? tag : ''));
}

export const mbLen = (s: string) => [...s].length;

export const mbSlice = (s: string, n: number) => [...s].slice(0, n).join('');

export const slug = (s: string, max = 40) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');

export const riga = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

export function controllaLunghezza(errori: string[], nome: string, valore: string, max: number, obbligatorio = false) {
  if (obbligatorio && !valore) errori.push(`${nome}: campo obbligatorio`);
  else if (mbLen(valore) > max) errori.push(`${nome}: massimo ${max} caratteri`);
}

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

export const grassettoDaTesto = (s: string) => escapeHtml(s).replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

export const senzaGrassetto = (s: string) => s.replace(/\*\*([^*]+?)\*\*/g, '$1');
