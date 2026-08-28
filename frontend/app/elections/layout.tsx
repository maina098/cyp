import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elections',
  description: 'View current Coastal Youth Parliament elections, candidates, voting windows, and results.',
  alternates: { canonical: '/elections' },
};

export default function ElectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
