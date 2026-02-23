import { GradeCalculator } from "@/components/GradeCalculator";
import { Content } from "@/components/Content";
import { RecentPosts } from "@/components/blog/RecentPosts";
import { getAdsForFeed } from "@/actions/ad-engine";
import NativeAdCard from "@/components/feed/NativeAdCard";

import { SITE_CONFIG } from "@/utils/Constants";

export default async function HomePage() {
  const ads = await getAdsForFeed(1); // Fetch 1 global ad
  const ad = ads[0]?.data;

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

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como Calcular sua Nota Final na UNIVESP",
    "description": "Use a calculadora para descobrir sua média bimestral, se precisa fazer exame, e qual nota precisa para passar.",
    "totalTime": "PT1M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Insira suas notas das Atividades do AVA",
        "text": "Digite a média das suas atividades avaliativas no campo 'Atividades AVA'. Esse valor corresponde a 40% da sua nota bimestral.",
        "url": `${SITE_CONFIG.BASE_URL}#calculadora`
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Insira sua nota da Prova Regular",
        "text": "Digite a nota que você tirou (ou projeta tirar) na prova presencial. Esse valor corresponde a 60% da sua nota bimestral.",
        "url": `${SITE_CONFIG.BASE_URL}#calculadora`
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Veja o resultado e saiba se você passa",
        "text": "A calculadora exibe sua Média Bimestral automaticamente e indica se você está aprovado, de exame final, ou em DP.",
        "url": `${SITE_CONFIG.BASE_URL}#calculadora`
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Como calcular a média final na Univesp?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A média da Univesp é calculada com base nas notas das atividades e provas. Use nossa calculadora para simular automaticamente."
        }
      },
      {
        "@type": "Question",
        "name": "Qual nota preciso para passar na Univesp?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Normalmente é necessário média mínima 6,0. Simule sua nota final e veja se você passa."
        }
      },
      {
        "@type": "Question",
        "name": "A calculadora funciona para todos os cursos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, ela segue as regras padrão da Univesp aplicáveis a todas as disciplinas bimestrais."
        }
      }
    ]
  };

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />


      <GradeCalculator />

      {ad && (
        <div className="container mx-auto px-4 max-w-4xl pt-8">
          <NativeAdCard ad={ad} />
        </div>
      )}

      <Content />
      <RecentPosts limit={9} />
    </>
  );
}