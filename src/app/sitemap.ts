import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_CONFIG } from "@/utils/Constants";
import { generateSlug, getQuestionPath } from '@/utils/functions';


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
            changeFrequency: 'monthly', // O blog é atualizado com frequência
            priority: 0.6,
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
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    // Dynamic routes (Blog Posts)
    let blogPosts: { slug: string; updatedAt: Date }[] = [];
    try {
        blogPosts = await prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        });
    } catch (error) {
        console.warn('Failed to fetch blog posts for sitemap:', error);
    }

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Dynamic routes (Questions) — URLs semânticas: /questoes/[subject]/[slug]-[id]
    let questions: { id: string; title: string; updatedAt: Date; subject: { name: string } }[] = [];
    try {
        questions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
                updatedAt: true,
                subject: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
        });
    } catch (error) {
        console.warn('Failed to fetch questions for sitemap:', error);
    }

    let subjects: { id: string; name: string }[] = [];
    try {
        subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
    } catch (error) {
        console.warn('Failed to fetch subjects for sitemap:', error);
    }

    const questionRoutes = questions.map((q) => ({
        url: `${baseUrl}${getQuestionPath({ id: q.id, title: q.title, subject: q.subject })}`,
        lastModified: q.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    const subjectRoutes: MetadataRoute.Sitemap = subjects.map((subject) => ({
        url: `${baseUrl}/questoes/${generateSlug(subject.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes, ...questionRoutes, ...subjectRoutes];
}
