import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { articles } from '@/data/articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://univesp-calculadora.vercel.app';

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

        const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}${article.slug}`,
        lastModified: new Date(article.date), // Usamos a data do artigo
        changeFrequency: 'monthly', // Artigos, uma vez publicados, não mudam
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

    const questionRoutes = questions.map((question) => ({
        url: `${baseUrl}/questoes/${question.id}`,
        lastModified: question.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes, ...questionRoutes];
}
