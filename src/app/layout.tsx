import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Yi Sivlay / Senior Backend Developer', template: '%s — Yi Sivlay' },
  description:
    'Java, Spring Boot, and reliable backend systems. The engineering portfolio of Yi Sivlay.',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
