const RESEND_API_BASE = 'https://api.resend.com';
const RESEND_BATCH_LIMIT = 100;

type ResendEmailPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

type ResendBatchEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM;

  return {
    apiKey,
    from,
  };
}

async function resendRequest<T>(path: string, payload: unknown): Promise<T> {
  const { apiKey } = getResendConfig();

  if (!apiKey) {
    throw new Error('Resend API not configured');
  }

  const response = await fetch(`${RESEND_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      'Failed to send email with Resend';

    throw new Error(message);
  }

  return data as T;
}

export async function sendResendEmail(payload: ResendEmailPayload) {
  return resendRequest<{ id: string }>('/emails', payload);
}

export async function sendResendBatchEmails(payload: ResendBatchEmailPayload[]) {
  return resendRequest<{ data: Array<{ id: string }> }>('/emails/batch', payload);
}

export function chunkEmails(emails: string[]) {
  const chunks: string[][] = [];

  for (let index = 0; index < emails.length; index += RESEND_BATCH_LIMIT) {
    chunks.push(emails.slice(index, index + RESEND_BATCH_LIMIT));
  }

  return chunks;
}
