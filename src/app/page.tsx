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
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
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
      <RecentPosts />
    </>
  );
}