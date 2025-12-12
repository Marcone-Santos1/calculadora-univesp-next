import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import {SITE_CONFIG} from "@/utils/Constants";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_CONFIG.BASE_URL;

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1, // Página principal tem prioridade máxima
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly', // O blog é atualizado com frequência
            priority: 0.9,
        },
        {
            url: `${baseUrl}/sobre`,
            lastModified: new Date(),
            changeFrequency: 'yearly', // Página "Sobre" raramente muda
            priority: 0.8,
        },
        {
            url: `${baseUrl}/questoes`,
            lastModified: new Date(),
            changeFrequency: 'weekly', // Página "Sobre" raramente muda
            priority: 0.8,
        },
    ];

    // Dynamic routes (Blog Posts)
    const blogPosts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Dynamic routes (Questions)
    const questions = await prisma.question.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        take: 5000, // Limit for sitemap size, can implement pagination if needed
    });

    const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });

    const questionRoutes = questions.map((question) => ({
        url: `${baseUrl}/questoes/${question.id}`,
        lastModified: question.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((subject) => ({
    url: `${baseUrl}/questoes?subject=${encodeURIComponent(subject.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

    return [...staticRoutes, ...blogRoutes, ...questionRoutes, ...subjectRoutes];
}
