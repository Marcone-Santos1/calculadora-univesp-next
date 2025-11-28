import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { AppStateProvider } from '@/components/AppStateProvider';
import { SessionProvider } from '@/components/SessionProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { GoogleAnalytics } from '@next/third-parties/google'
import dynamic from 'next/dynamic';
const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(mod => mod.CookieConsent));
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";

const inter = Inter({ subsets: ['latin'], display: 'swap' });


export const metadata: Metadata = {
  title: 'Calculadora Univesp | Média, Exame e Simulação',
  description: 'Calcule sua média final, simule a nota necessária no exame e planeje seus estudos na UNIVESP. A ferramenta mais completa para os alunos.',
  metadataBase: new URL('https://univesp-calculadora.vercel.app'),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: './'
  },
  other: {
    'google-site-verification': '68Q5UEjHZo-zjJfY_P_3H9IbrIOeMVNDq16SBlTHrWA'
  },
  openGraph: {
    title: 'Calculadora Univesp | Média, Exame e Simulação',
    description: 'A ferramenta mais completa para os alunos da UNIVESP calcularem suas notas.',
    url: 'https://univesp-calculadora.vercel.app',
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
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <GoogleAnalytics gaId="G-3141WNQQZQ" />
      <body className={inter.className}>
        <ToastProvider>
          <SessionProvider>
            <AppStateProvider>
              <UserPreferencesProvider>
                <NavBar />
                <main>{children}</main>
              </UserPreferencesProvider>
            </AppStateProvider>
          </SessionProvider>
        </ToastProvider>
        <CookieConsent />
      </body>
    </html>
  );
}