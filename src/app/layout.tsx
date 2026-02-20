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

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'], display: 'swap' });


export const metadata: Metadata = {
  title: 'Calculadora Univesp 2026 – Simule Média, Exame e Veja se Você Passa!',
  description: 'Calcule sua média e sua nota final da Univesp em segundos — atualizado para 2026. Descubra quanto precisa na prova e se você passa sem complicação!',
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
    title: 'Calculadora Univesp 2026 – Simule Média, Exame e Veja se Você Passa!',
    description: 'Calcule sua média e sua nota final da Univesp em segundos — atualizado para 2026. Descubra quanto precisa na prova e se você passa sem complicação!',
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
      <body className={`${inter.className} bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}>
        <ToastProvider>
          <SessionProvider>
            <AppStateProvider>
              <UserPreferencesProvider>
                <NavBar />
                <main className="mt-20">{children}</main>
                <Footer />

                <Analytics />
                <SpeedInsights />

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
