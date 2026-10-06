import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ARCHIVIN — Vintage shop in Haebangchon, Seoul',
    template: '%s · ARCHIVIN',
  },
  description: 'Band tees, tour merch and designer pieces from the 1970s to the 2010s. Every piece is one of one.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0b0b',
};

// Futura PT is an Adobe Fonts face. Set NEXT_PUBLIC_TYPEKIT_ID (e.g. in .env.local) once the web kit exists;
// until then Jost from Google Fonts stands in via the font stack in tokens.json.
const TYPEKIT_ID = process.env.NEXT_PUBLIC_TYPEKIT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400&family=Jost:wght@500;800&family=Noto+Sans+KR:wght@400;500;700&display=swap"
        />
        {TYPEKIT_ID ? <link rel="stylesheet" href={`https://use.typekit.net/${TYPEKIT_ID}.css`} /> : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
