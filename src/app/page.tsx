import { GradeCalculator } from "@/components/GradeCalculator";
import { Content } from "@/components/Content";
import { RecentPosts } from "@/components/blog/RecentPosts";

import { SITE_CONFIG } from "@/utils/Constants";

export default function HomePage() {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Calculadora Univesp",
    "url": SITE_CONFIG.BASE_URL,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "featureList": "Calculadora de Notas Univesp - Simulador de Médias. Calcule sua média final, simule a nota necessária no exame e planeje seus estudos na UNIVESP.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_CONFIG.BASE_URL}/questoes?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GradeCalculator />
      <Content />
      <RecentPosts limit={9} />
    </>
  );
}