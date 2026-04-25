import * as React from 'react';
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'react-email';
import { BrandHeader } from './components/BrandHeader';
import { BrandFooter } from './components/BrandFooter';

type PaymentFailedEmailProps = {
  productName: string;
  userName?: string;
  ctaUrl?: string;
};

export default function PaymentFailedEmail({
  productName = 'Product',
  userName = 'Customer',
  ctaUrl = 'https://pasive.co/dashboard',
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your payment was unsuccessful</Preview>
      <Body style={main}>
        <Container style={container}>
          <BrandHeader />
          <Section style={card}>
            <Heading style={headingStyle}>Payment Failed ⚠️</Heading>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              Unfortunately, your recent payment for <strong>{productName}</strong> was unsuccessful. This could be due to several reasons such as insufficient funds or bank issues.
            </Text>
            <Text style={text}>
              Don't worry, you can try again by clicking the button below.
            </Text>
            <Section style={btnContainer}>
              <Button href={ctaUrl} style={button}>
                Try Again
              </Button>
            </Section>
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
  color: '#dc2626',
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

const btnContainer = {
  textAlign: 'left' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#111827',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
};
