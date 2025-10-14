'use client';

import { useEffect } from 'react';

export default function AdsRefresher() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (e) {
        console.error('Erro ao inicializar os anúncios:', e);
      }
    }
  }, []);

  return null;
}
