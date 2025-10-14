import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {NavBar} from '@/components/NavBar';
import {AppStateProvider} from '@/components/AppStateProvider';
import { GoogleTagManager } from '@next/third-parties/google'
import Script from "next/script";
import AdsRefresher from "@/components/AdsRefresher";
import {AdsenseScript} from "@/components/AdsenseScript";

const inter = Inter({subsets: ['latin']});

// Metadados padrão (equivalente ao seu index.html)
export const metadata: Metadata = {
  title: 'Calculadora Univesp | Média, Exame e Simulação',
  description: 'Calcule sua média final, simule a nota necessária no exame e planeje seus estudos na UNIVESP. A ferramenta mais completa para os alunos.',
  metadataBase: new URL('https://univesp-calculadora.vercel.app'),
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
    <GoogleTagManager gtmId="G-3141WNQQZQ" />
    <AdsenseScript />
    <body className={inter.className}>
    <AppStateProvider>
      <NavBar/>
      <main>{children}</main>
      <AdsRefresher />
    </AppStateProvider>
    </body>
    </html>
  );
}