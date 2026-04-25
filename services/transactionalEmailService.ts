import { render } from '@react-email/render';
import { sendResendEmail, getResendConfig } from '@/lib/resend';
import PurchaseConfirmationEmail from '@/emails/purchase-confirmation';
import PaymentFailedEmail from '@/emails/payment-failed';
import WelcomeEmail from '@/emails/welcome';
import React from 'react';

export const transactionalEmailService = {
  async sendPurchaseConfirmation({
    email,
    productName,
    amount,
    currency = 'NGN',
    userName = 'Customer'
  }: {
    email: string;
    productName: string;
    amount: string | number;
    currency?: string;
    userName?: string;
  }) {
    const { from } = getResendConfig();
    if (!from) throw new Error('Resend from email not configured');

    const html = await render(
      React.createElement(PurchaseConfirmationEmail, {
        productName,
        amount: amount.toString(),
        currency,
        userName
      })
    );

    return sendResendEmail({
      from,
      to: email,
      subject: `Payment Successful: ${productName}`,
      html
    });
  },

  async sendPaymentFailed({
    email,
    productName,
    userName = 'Customer',
    ctaUrl
  }: {
    email: string;
    productName: string;
    userName?: string;
    ctaUrl?: string;
  }) {
    const { from } = getResendConfig();
    if (!from) throw new Error('Resend from email not configured');

    const html = await render(
      React.createElement(PaymentFailedEmail, {
        productName,
        userName,
        ctaUrl
      })
    );

    return sendResendEmail({
      from,
      to: email,
      subject: `Payment Failed: ${productName}`,
      html
    });
  },

  async sendWelcomeEmail({
    email,
    userName = 'there',
    ctaUrl
  }: {
    email: string;
    userName?: string;
    ctaUrl?: string;
  }) {
    const { from } = getResendConfig();
    if (!from) throw new Error('Resend from email not configured');

    const html = await render(
      React.createElement(WelcomeEmail, {
        userName,
        ctaUrl
      })
    );

    return sendResendEmail({
      from,
      to: email,
      subject: `Welcome to Pasive, ${userName}!`,
      html
    });
  },

  async sendCustomNotification({
    email,
    subject,
    message,
    userName = 'there'
  }: {
    email: string;
    subject: string;
    message: string;
    userName?: string;
  }) {
    const { from } = getResendConfig();
    if (!from) throw new Error('Resend from email not configured');

    // Simple fallback for custom notifications if no specific template is needed
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #111827;">${subject}</h1>
        <p>Hi ${userName},</p>
        <p>${message}</p>
        <p>Best regards,<br>The Pasive Team</p>
      </div>
    `;

    return sendResendEmail({
      from,
      to: email,
      subject,
      html
    });
  }
};
