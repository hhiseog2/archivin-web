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
  themeColor: '#323850',
};

// Neue Haas Grotesk Text is an Adobe Fonts face. Set NEXT_PUBLIC_TYPEKIT_ID in .env once the web kit exists.
// TODO: Neue Haas Grotesk web kit (README 12). Until then Inter Tight (Google Fonts) stands in via the font stack.
const TYPEKIT_ID = process.env.NEXT_PUBLIC_TYPEKIT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400&family=Noto+Sans+KR:wght@400&display=swap" />
        {TYPEKIT_ID ? <link rel="stylesheet" href={`https://use.typekit.net/${TYPEKIT_ID}.css`} /> : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
