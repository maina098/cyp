import './globals.css';
import type { Metadata } from 'next';
import { StripExtensionAttrs } from '@/components/strip-extension-attrs';
import { ElectionContextProvider } from '@/lib/election-context';

export const metadata: Metadata = {
  title: 'Coastal Youth Parliament',
  description: 'Modern frontend for Coastal Youth Parliament public portal and admin management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <StripExtensionAttrs />
        <ElectionContextProvider>
          {children}
        </ElectionContextProvider>
      </body>
    </html>
  );
}
