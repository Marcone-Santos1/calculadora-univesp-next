'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { awardReputation, deductReputation, checkAchievements } from './reputation-actions';
import { REPUTATION_EVENTS } from '@/utils/reputation-events';

export async function toggleCommentVote(commentId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        const userId = session.user.id;

        // Check if vote exists
        const existingVote = await prisma.commentVote.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            },
            include: {
                comment: true
            }
        });

        if (existingVote) {
            // Remove vote (Undo)
            await prisma.commentVote.delete({
                where: {
                    id: existingVote.id
                }
            });

            // Deduct reputation from CASTER (refund points for casting?) 
            // Usually we award points for engagement. If they undo, we take back.
            await deductReputation(userId, REPUTATION_EVENTS.COMMENT_VOTE_CAST.points, 'UNDO_COMMENT_VOTE_CAST');

            // Deduct reputation from RECEIVER
            await deductReputation(existingVote.comment.userId, REPUTATION_EVENTS.COMMENT_VOTE_RECEIVED.points, 'UNDO_COMMENT_VOTE_RECEIVED');

        } else {
            // Create vote
            const comment = await prisma.comment.findUnique({ where: { id: commentId } });
            if (!comment) throw new Error('Comment not found');

            await prisma.commentVote.create({
                data: {
                    userId,
                    commentId
                }
            });

            // Award reputation to CASTER
            await awardReputation(userId, REPUTATION_EVENTS.COMMENT_VOTE_CAST.points, 'COMMENT_VOTE_CAST');

            // Award reputation to RECEIVER (User who wrote the comment)
            if (comment.userId !== userId) {
                await awardReputation(comment.userId, REPUTATION_EVENTS.COMMENT_VOTE_RECEIVED.points, 'COMMENT_VOTE_RECEIVED');
            }
        }

        // Check achievements for both parties
        await checkAchievements(userId);

        // We can't easily check for the other user without fetching them again, 
        // but let's at least check for the current user.
        // Ideally we queue a job for the other user or just let it update on their next interaction.

        revalidatePath('/questoes');
        revalidatePath(`/questoes/${commentId}`); // Revalidate specific pages if needed

        return { success: true };
    } catch (error) {
        console.error('Error toggling comment vote:', error);
        return { success: false, error: 'Failed to vote' };
    }
}
