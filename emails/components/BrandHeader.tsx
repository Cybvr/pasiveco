import * as React from 'react';
import { Section, Img, Link } from 'react-email';

export const BrandHeader = () => (
  <Section style={header}>
    <Link href="http://pasive.co">
      <Img
        src="https://pasive.co/images/pasivelogoblack.png"
        width="100"
        height="auto"
        alt="Pasive"
        style={logo}
      />
    </Link>
  </Section>
);

const header = {
  padding: '32px 0',
  textAlign: 'left' as const,
};

const logo = {
  margin: '0',
};
