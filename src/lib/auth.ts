import { createHash, timingSafeEqual } from 'node:crypto';
import type { AstroSession } from 'astro';
import { DASHBOARD_PASSWORD, SVILUPPATORI_PASSWORD } from 'astro:env/server';

const TENTATIVI = 10;
const FINESTRA = 15 * 60 * 1000;
const errori = new Map<string, { n: number; da: number }>();

export type Ruolo = 'admin' | 'sviluppatore';

function uguale(password: string, attesa: string | undefined): boolean {
  if (!attesa) return false;
  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(attesa).digest();
  return timingSafeEqual(a, b);
}

function ruoloDi(password: string): Ruolo | null {
  const separate = SVILUPPATORI_PASSWORD !== DASHBOARD_PASSWORD;
  if (separate && uguale(password, SVILUPPATORI_PASSWORD)) return 'sviluppatore';
  if (uguale(password, DASHBOARD_PASSWORD)) return 'admin';
  return null;
}

export function verificaAccesso(password: string, ip: string): Ruolo | 'errata' | 'bloccato' {
  const ora = Date.now();
  for (const [chiave, e] of errori) if (ora - e.da > FINESTRA) errori.delete(chiave);
  const e = errori.get(ip) ?? { n: 0, da: ora };
  if (e.n >= TENTATIVI) return 'bloccato';
  const ruolo = ruoloDi(password);
  if (ruolo) {
    errori.delete(ip);
    return ruolo;
  }
  errori.set(ip, { ...e, n: e.n + 1 });
  return 'errata';
}

export async function isLoggedIn(session: AstroSession | undefined): Promise<boolean> {
  return (await session?.get('dashboard_logged_in')) === true;
}

export async function isSviluppatore(session: AstroSession | undefined): Promise<boolean> {
  return (await session?.get('sviluppatore')) === true;
}

export async function login(session: AstroSession | undefined, ruolo: Ruolo): Promise<void> {
  if (!session) return;
  await session.regenerate();
  session.set('dashboard_logged_in', true);
  if (ruolo === 'sviluppatore') session.set('sviluppatore', true);
}

export function logout(session: AstroSession | undefined): void {
  session?.destroy();
}
