import * as React from 'react';
import { Body, Button, Container, Head, Heading, Html, Preview, Section } from 'react-email';
import { BrandHeader } from './components/BrandHeader';
import { BrandFooter } from './components/BrandFooter';

type AdminBlastEmailProps = {
  heading?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export default function AdminBlastEmail({
  heading = 'Update from Pasive',
  message = 'Thanks for being here. We wanted to share a quick update with you.',
  ctaLabel = 'Open Pasive',
  ctaUrl = 'https://pasive.co',
}: AdminBlastEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <BrandHeader />
          <Section style={card}>
            <Heading style={headingStyle}>{heading}</Heading>
            <div dangerouslySetInnerHTML={{ __html: message }} style={messageStyle} />
            <Section style={btnContainer}>
              <Button href={ctaUrl} style={button}>
                {ctaLabel}
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
  color: '#111827',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 24px',
};

const messageStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px',
};

const btnContainer = {
  textAlign: 'left' as const,
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
