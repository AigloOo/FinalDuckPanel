import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Duc Panel 🦆',
  description: 'Tableau de bord personnel de Jean',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
