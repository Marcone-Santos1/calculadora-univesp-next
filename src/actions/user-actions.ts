'use server';

import { prisma } from '@/lib/prisma';


export async function getUserStats(userId: string) {
    const [questionsCount, commentsCount, votesCount] = await Promise.all([
        prisma.question.count({ where: { userId } }),
        prisma.comment.count({ where: { userId } }),
        prisma.vote.count({ where: { userId } })
    ]);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true }
    });

    return {
        questions: questionsCount,
        comments: commentsCount,
        votes: votesCount,
        reputation: user?.reputation || 0
    };
}

export async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            reputation: true,
            createdAt: true,
            bio: true,
            location: true,
            website: true,
            socialLinks: true
        }
    });
}

export async function getUserQuestions(userId: string) {
    return await prisma.question.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            subject: true,
            _count: {
                select: {
                    comments: true,
                    alternatives: true // We might want to count votes instead, but alternatives is what we have direct relation to
                }
            }
        }
    });
}

export async function getUserComments(userId: string) {
    return await prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            question: {
                select: {
                    id: true,
                    title: true,
                    subject: true
                }
            }
        }
    });
}

export async function getLeaderboard(limit: number = 50) {
    return await prisma.user.findMany({
        orderBy: { reputation: 'desc' },
        take: limit,
        select: {
            id: true,
            name: true,
            image: true,
            reputation: true,
            _count: {
                select: {
                    questions: true,
                    comments: true,
                    votes: true
                }
            }
        }
    });
}

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

interface SocialLinks {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

export async function updateProfile(data: {
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: SocialLinks;
}) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) throw new Error('User not found');

    await prisma.user.update({
        where: { id: user.id },
        data: {
            bio: data.bio,
            location: data.location,
            website: data.website,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socialLinks: data.socialLinks as any
        }
    });

    revalidatePath(`/perfil/${user.id}`);
    revalidatePath('/perfil/editar');
}

export async function uploadAvatar(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatars/${randomUUID()}.${fileExtension}`;

    await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    }));

    const imageUrl = `${R2_PUBLIC_URL}/${fileName}`;

    await prisma.user.update({
        where: { email: session.user.email },
        data: { image: imageUrl }
    });

    revalidatePath('/perfil/editar');
    return imageUrl;
}
