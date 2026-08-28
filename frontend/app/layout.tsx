import './globals.css';
import type { Metadata } from 'next';
import { StripExtensionAttrs } from '@/components/strip-extension-attrs';
import { ElectionContextProvider } from '@/lib/election-context';
import { PrivacyConsent } from '@/components/privacy-consent';
import { Analytics } from '@/components/analytics';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.coastalyouthparliament.org'),
  title: {
    default: 'Coastal Youth Parliament',
    template: '%s | Coastal Youth Parliament',
  },
  description: 'Coastal Youth Parliament connects youth leadership, county collaboration, investment, and inclusive development.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Coastal Youth Parliament',
    description: 'Youth leadership and regional development across Kenya’s coastal counties.',
    siteName: 'Coastal Youth Parliament',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <StripExtensionAttrs />
        <ElectionContextProvider>
          {children}
        </ElectionContextProvider>
        <PrivacyConsent />
        <Analytics />
      </body>
    </html>
  );
}
