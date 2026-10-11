/** Notifiche a comparsa della dashboard. */
export type ToastTipo = 'success' | 'error' | 'warning';

const ICONS: Record<ToastTipo, string> = {
  success: 'fa-check-circle',
  error: 'fa-times-circle',
  warning: 'fa-exclamation-triangle',
};

export function toast(msg: string, tipo: ToastTipo): void {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  const icon = document.createElement('i');
  icon.className = `fas ${ICONS[tipo]}`;
  t.append(icon, ` ${msg}`);
  container.appendChild(t);
  setTimeout(() => t.remove(), tipo === 'warning' ? 5000 : 3000);
}
