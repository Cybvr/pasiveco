import * as React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Section } from 'react-email';
import { BrandHeader } from './components/BrandHeader';
import { BrandFooter } from './components/BrandFooter';

type NewsletterEmailProps = {
  subject?: string;
  content?: string;
};

export default function NewsletterEmail({
  subject = 'Weekly Newsletter',
  content = 'Here is what happened this week...',
}: NewsletterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <BrandHeader />
          <Section style={card}>
            <Heading style={h1}>{subject}</Heading>
            <div dangerouslySetInnerHTML={{ __html: content }} style={text} />
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

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
};
