import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { AppStateProvider } from '@/components/AppStateProvider';
import { SessionProvider } from '@/components/SessionProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { GoogleAnalytics } from '@next/third-parties/google'
import { SITE_CONFIG } from '@/utils/Constants';
import dynamic from 'next/dynamic';

const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(mod => mod.CookieConsent));
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { ReactNode } from "react";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { AdsenseScript } from '@/components/AdsenseScript';
import AdsRefresher from '@/components/AdsRefresher';
import { StreakListener } from '@/components/reputation/StreakListener';

const inter = Inter({ subsets: ['latin'], display: 'swap' });


export const metadata: Metadata = {
  title: 'Calculadora Univesp | Média, Exame e Simulação',
  description: 'Calculadora de Notas Univesp - Simulador de Médias. Calcule sua média final, simule a nota necessária no exame e planeje seus estudos na UNIVESP.',
  metadataBase: new URL(SITE_CONFIG.BASE_URL),
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: './'
  },
  other: {
    'google-site-verification': '68Q5UEjHZo-zjJfY_P_3H9IbrIOeMVNDq16SBlTHrWA'
  },
  openGraph: {
    title: 'Calculadora Univesp | Média, Exame e Simulação',
    description: 'A ferramenta mais completa para os alunos da UNIVESP calcularem suas notas.',
    url: SITE_CONFIG.BASE_URL,
    siteName: 'Calculadora Univesp',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Calculadora Univesp",
    "url": SITE_CONFIG.BASE_URL,
    "logo": `${SITE_CONFIG.BASE_URL}/logo.png`,
    "sameAs": [
      "https://github.com/marcone-santos1",
      "https://linkedin.com/in/marcone-santos1/..."
    ],
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Script async={true} type={'application/ld+json'} id={'organizationJsonLd'} dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <GoogleAnalytics gaId="G-3141WNQQZQ" />
      <AdsenseScript />
      <AdsRefresher />
      <body className={inter.className}>
        <ToastProvider>
          <SessionProvider>
            <AppStateProvider>
              <UserPreferencesProvider>
                <NavBar />
                <main className="mt-20">{children}</main>
                <Footer />

                <FeedbackWidget />
                <StreakListener />
              </UserPreferencesProvider>
            </AppStateProvider>
          </SessionProvider>
        </ToastProvider>
        <CookieConsent />
      </body>
    </html>
  );
}