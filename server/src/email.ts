import { Resend } from 'resend';

export async function sendReminderEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Minha Rotina <onboarding@resend.dev>';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html, text });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }
}
