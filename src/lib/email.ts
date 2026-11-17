import { SMTP_MITTENTE, SMTP_URL } from 'astro:env/server';
import nodemailer, { type Transporter } from 'nodemailer';

let trasporto: Transporter | undefined;

export const emailConfigurata = () => Boolean(SMTP_URL);

export async function inviaEmail(messaggio: { a: string[]; oggetto: string; testo: string; html: string }): Promise<void> {
  if (!SMTP_URL) throw new Error('SMTP_URL non configurato');
  trasporto ??= nodemailer.createTransport(SMTP_URL);
  const mittente = SMTP_MITTENTE || decodeURIComponent(new URL(SMTP_URL).username);
  await trasporto.sendMail({ from: mittente, to: messaggio.a, subject: messaggio.oggetto, text: messaggio.testo, html: messaggio.html });
}
