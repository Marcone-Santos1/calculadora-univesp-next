import { BlogEditor } from '@/components/admin/blog/BlogEditor';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch by ID for editing, not slug
    const post = await prisma.blogPost.findUnique({
        where: { id }
    });

    if (!post) {
        notFound();
    }

    return <BlogEditor post={post} />;
}
