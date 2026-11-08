import { createHash, timingSafeEqual } from 'node:crypto';
import type { AstroSession } from 'astro';
import { DASHBOARD_PASSWORD } from 'astro:env/server';

const TENTATIVI = 10;
const FINESTRA = 15 * 60 * 1000;
const errori = new Map<string, { n: number; da: number }>();

function passwordValida(password: string): boolean {
  if (!DASHBOARD_PASSWORD) return false;
  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(DASHBOARD_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

export function verificaAccesso(password: string, ip: string): 'ok' | 'errata' | 'bloccato' {
  const ora = Date.now();
  for (const [chiave, e] of errori) if (ora - e.da > FINESTRA) errori.delete(chiave);
  const e = errori.get(ip) ?? { n: 0, da: ora };
  if (e.n >= TENTATIVI) return 'bloccato';
  if (passwordValida(password)) {
    errori.delete(ip);
    return 'ok';
  }
  errori.set(ip, { ...e, n: e.n + 1 });
  return 'errata';
}

export async function isLoggedIn(session: AstroSession | undefined): Promise<boolean> {
  return (await session?.get('dashboard_logged_in')) === true;
}

export async function login(session: AstroSession | undefined): Promise<void> {
  if (!session) return;
  await session.regenerate();
  session.set('dashboard_logged_in', true);
}

export function logout(session: AstroSession | undefined): void {
  session?.destroy();
}
