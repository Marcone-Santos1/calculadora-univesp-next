import { MetadataRoute } from 'next';
import {SITE_CONFIG} from "@/utils/Constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.BASE_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}