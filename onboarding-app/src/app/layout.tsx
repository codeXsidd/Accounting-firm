import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AccountFlow Pro — Automated Client Onboarding',
  description:
    'Production-grade automated client onboarding system for accounting firms. Powered by Notion, Supabase, and Brevo.',
  keywords: 'accounting, client onboarding, automation, CRM, Notion, Supabase',
  authors: [{ name: 'AccountFlow Pro' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
