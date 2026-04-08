import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Background Remover - Free Online Background Removal Tool',
  description: 'Remove image backgrounds instantly for free. No signup required. AI-powered background remover supports PNG, JPG, WEBP.',
  openGraph: {
    title: 'Background Remover - Free Online Tool',
    description: 'Remove image backgrounds instantly and for free. No signup, no software to install.',
    type: 'website',
    url: 'https://background-remover.website/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Background Remover',
              url: 'https://background-remover.website/',
              description: 'Free online AI-powered background removal tool.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
