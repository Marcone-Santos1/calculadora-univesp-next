import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';


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

    const questionRoutes = questions.map((question) => ({
        url: `${baseUrl}/questoes/${question.id}`,
        lastModified: question.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes, ...questionRoutes];
}
