import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { SITE_CONFIG } from '@/utils/Constants'; // Importe a config

interface BreadcrumbProps {
  links: {
    name: string;
    path?: string;
  }[];
}

export function Breadcrumb({ links }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": SITE_CONFIG.BASE_URL
      },
      ...links.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": item.path ? `${SITE_CONFIG.BASE_URL}${item.path}` : undefined
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      {/* INJEÇÃO DO SCHEMA INVISÍVEL */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <FaHome />
            <span className="sr-only">Início</span>
          </Link>
        </li>
        {links.map((item, index) => (
          <li key={item.path || ''} className="flex items-center gap-2">
            <FaChevronRight className="text-xs text-gray-300" />
            <Link
              href={item.path || ''}
              className={`hover:text-blue-600 transition-colors ${index === links.length - 1
                ? 'text-gray-900 dark:text-white font-medium pointer-events-none'
                : ''
                }`}
              aria-current={index === links.length - 1 ? 'page' : undefined}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}