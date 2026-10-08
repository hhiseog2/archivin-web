import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ARCHIVIN — selected vintage clothing',
    template: '%s · ARCHIVIN',
  },
  description: 'Selected vintage clothing from Haebangchon, Seoul. Every piece is one of one.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the intro's inline script may mark <html data-intro-seen> before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400&family=Noto+Sans+KR:wght@400&display=swap" />
        {/* Neue Haas Grotesk Display Pro, self-hosted (client's web licence, Commercial Type). Inter Tight stays as the fallback. */}
        <link rel="preload" href="/fonts/NeueHaasDisplay-Roman.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
