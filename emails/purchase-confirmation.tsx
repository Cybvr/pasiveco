import * as React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email';
import { BrandHeader } from './components/BrandHeader';
import { BrandFooter } from './components/BrandFooter';

type PurchaseConfirmationEmailProps = {
  productName: string;
  amount: string;
  currency: string;
  userName?: string;
};

export default function PurchaseConfirmationEmail({
  productName = 'Product',
  amount = '0',
  currency = 'NGN',
  userName = 'Customer',
}: PurchaseConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your purchase was successful!</Preview>
      <Body style={main}>
        <Container style={container}>
          <BrandHeader />
          <Section style={card}>
            <Heading style={headingStyle}>Payment Successful! 🎉</Heading>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              Your payment for <strong>{productName}</strong> was successful. Thank you for your purchase!
            </Text>
            <Section style={receipt}>
              <Text style={receiptRow}>
                <strong>Product:</strong> {productName}
              </Text>
              <Text style={receiptRow}>
                <strong>Amount:</strong> {currency} {amount}
              </Text>
            </Section>
            <Text style={text}>
              You can access your purchase from your dashboard.
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '0',
  padding: '48px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const headingStyle = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const receipt = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const receiptRow = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '8px 0',
};
