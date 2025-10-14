'use client';

import Script from 'next/script';

export const AdsenseScript = () => (
  <Script
    async
    strategy="afterInteractive"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9195195721061205"
    crossOrigin="anonymous"
    onError={(e) => console.error('Erro ao carregar o script do AdSense:', e)}
  />
);
