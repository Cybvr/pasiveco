import * as React from 'react';
import { Section, Text, Link, Row, Column, Img, Hr } from 'react-email';

export const BrandFooter = () => (
  <Section style={footer}>
    <Hr style={hr} />
    <Row style={socials}>
      <Column align="left" style={{ width: '36px' }}>
        <Link href="https://twitter.com/pasive">
          <Img
            src="https://pasive.co/images/Socials/X.png"
            width="24"
            height="24"
            alt="X"
          />
        </Link>
      </Column>
      <Column align="left">
        <Link href="https://instagram.com/pasive">
          <Img
            src="https://pasive.co/images/Socials/Instagram.png"
            width="24"
            height="24"
            alt="Instagram"
          />
        </Link>
      </Column>
    </Row>
    <Text style={footerText}>
      &copy; {new Date().getFullYear()} Pasive. All rights reserved.
    </Text>
    <Text style={footerText}>
      5 Ado Ibrahim Street, Sabo Yaba
    </Text>
    <Link href="https://pasive.co/unsubscribe" style={unsubscribeLink}>
      Unsubscribe from these emails
    </Link>
  </Section>
);

const footer = {
  padding: '32px 0',
  textAlign: 'left' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const socials = {
  width: '100%',
  margin: '0 0 20px',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#9ca3af',
  margin: '0',
};

const unsubscribeLink = {
  fontSize: '12px',
  color: '#9ca3af',
  textDecoration: 'underline',
  marginTop: '12px',
  display: 'block',
};
