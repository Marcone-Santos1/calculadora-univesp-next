'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth'; // Assuming auth is available here, or use getSession
import { redirect } from 'next/navigation';

export async function getBlogPosts(publishedOnly = true) {
    const where = publishedOnly ? { published: true } : {};
    return await prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, image: true } } }
    });
}

export async function getBlogPost(slug: string) {
    return await prisma.blogPost.findUnique({
        where: { slug },
        include: { author: { select: { name: true, image: true } } }
    });
}

export async function createBlogPost(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const coverImage = formData.get('coverImage') as string;
    const published = formData.get('published') === 'true';
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const keywords = formData.get('keywords') as string;

    try {
        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                published,
                metaTitle,
                metaDescription,
                keywords,
                authorId: session.user.id
            }
        });

        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        return { success: true, postId: post.id };
    } catch (error) {
        console.error('Error creating post:', error);
        return { success: false, error: 'Failed to create post' };
    }
}

export async function updateBlogPost(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const coverImage = formData.get('coverImage') as string;
    const published = formData.get('published') === 'true';
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const keywords = formData.get('keywords') as string;

    try {
        await prisma.blogPost.update({
            where: { id },
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                published,
                metaTitle,
                metaDescription,
                keywords,
            }
        });

        revalidatePath('/blog');
        revalidatePath(`/blog/${slug}`);
        revalidatePath('/admin/blog');
        return { success: true };
    } catch (error) {
        console.error('Error updating post:', error);
        return { success: false, error: 'Failed to update post' };
    }
}

export async function deleteBlogPost(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.blogPost.delete({
            where: { id }
        });

        revalidatePath('/blog');
        revalidatePath('/admin/blog');
        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: 'Failed to delete post' };
    }
}
