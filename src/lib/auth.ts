/**
 * Autenticazione dashboard (sostituisce $_SESSION['dashboard_logged_in']).
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import type { AstroSession } from 'astro';
import { DASHBOARD_PASSWORD } from 'astro:env/server';

/** Confronto a tempo costante della password. */
export function passwordValida(password: string): boolean {
  if (!DASHBOARD_PASSWORD) return false;
  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(DASHBOARD_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

export async function isLoggedIn(session: AstroSession | undefined): Promise<boolean> {
  return (await session?.get('dashboard_logged_in')) === true;
}

export async function login(session: AstroSession | undefined): Promise<void> {
  if (!session) return;
  // Nuovo ID di sessione al login (evita session fixation)
  await session.regenerate();
  session.set('dashboard_logged_in', true);
  session.set('dashboard_login_time', Math.floor(Date.now() / 1000));
}

export function logout(session: AstroSession | undefined): void {
  session?.destroy();
}
