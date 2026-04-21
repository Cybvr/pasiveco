import * as React from 'react';
import { Body, Button, Container, Head, Heading, Html, Preview, Section } from 'react-email';
import { BrandHeader } from './components/BrandHeader';
import { BrandFooter } from './components/BrandFooter';

type AnnouncementEmailProps = {
  title?: string;
  message?: string;
  ctaText?: string;
  ctaLink?: string;
};

export default function AnnouncementEmail({
  title = 'Big News!',
  message = 'We have something exciting to share with you today.',
  ctaText = 'Check it out',
  ctaLink = 'https://pasive.co',
}: AnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <BrandHeader />
          <Section style={card}>
            <Heading style={h1}>{title}</Heading>
            <div dangerouslySetInnerHTML={{ __html: message }} style={text} />
            <Section style={btnContainer}>
              <Button style={button} href={ctaLink}>
                {ctaText}
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
  textAlign: 'left' as const,
};

const h1 = {
  color: '#111827',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '17px',
  lineHeight: '1.6',
  margin: '0 0 32px',
  textAlign: 'left' as const,
};

const btnContainer = {
  textAlign: 'left' as const,
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
};
