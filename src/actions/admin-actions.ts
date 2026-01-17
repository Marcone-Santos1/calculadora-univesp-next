/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification-actions';
import { awardReputation, deductReputation } from './reputation-actions';
import { EmailService } from '@/lib/email-service';

// ============ Question Management ============

export async function getAdminQuestions(params: {
  search?: string;
  subjectId?: string;
  status?: 'verified' | 'unverified' | 'pending';
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const { search, subjectId, status, page = 1, limit = 10 } = params;
  const where: any = {};
  const skip = (page - 1) * limit;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { text: { contains: search } },
      { id: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } }
    ];
  }

  if (subjectId && subjectId !== 'all') {
    where.subjectId = subjectId;
  }

  if (status === 'verified') {
    where.isVerified = true;
  } else if (status === 'unverified') {
    where.isVerified = false;
    where.verificationRequested = false;
  } else if (status === 'pending') {
    where.verificationRequested = true;
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        subject: { select: { name: true } },
        alternatives: {
          select: { id: true, letter: true, text: true, isCorrect: true },
          orderBy: { letter: 'asc' }
        },
        _count: {
          select: {
            alternatives: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.question.count({ where })
  ]);

  return {
    questions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function deleteQuestion(id: string) {
  await requireAdmin();

  const question = await prisma.question.findUnique({
    where: { id },
    select: { userId: true, title: true, user: { select: { email: true, name: true } } }
  });

  if (question) {
    await prisma.question.delete({
      where: { id }
    });

    // Deduct reputation
    await deductReputation(question.userId, 10, 'QUESTION_DELETED_BY_ADMIN');

    // Email Notification
    if (question.user.email) {
      const template = (await import('@/lib/email-templates')).PredefinedTemplates.WARNING;

      await EmailService.sendEmail({ email: question.user.email, name: question.user.name || 'User' }, template.subject, template.body(`Sua questão "${question.title}" foi removida pois violava nossas diretrizes de comunidade.`));
    }

    // Notify user
    await createNotification({
      userId: question.userId,
      type: 'VERIFICATION',
      message: `Sua questão "${question.title.substring(0, 30)}..." foi removida pela administração.`,
      link: '#'
    });
  }

  revalidatePath('/admin/questions');
  revalidatePath('/questoes');
  revalidatePath('/admin/questions');
  revalidatePath('/questoes');
}

export async function deleteQuestions(ids: string[]) {
  await requireAdmin();

  if (!ids || ids.length === 0) return;

  // 1. Get questions to identify authors for reputation deduction
  const questions = await prisma.question.findMany({
    where: { id: { in: ids } },
    select: { id: true, userId: true, title: true }
  });

  // 2. Delete in bulk
  await prisma.question.deleteMany({
    where: { id: { in: ids } }
  });

  // 3. Process reputation and notifications (Grouped by User)
  const usersMap = new Map<string, number>(); // UserId -> Count

  questions.forEach(q => {
    const current = usersMap.get(q.userId) || 0;
    usersMap.set(q.userId, current + 1);
  });

  // Execute async notification/reputation updates
  // We don't await this to keep UI snappy, or we await if consistency is critical.
  // Given Next.js Server Action lifecycle, better to await or use `waitUntil` (if available), but standard await is safer.

  const updates = Array.from(usersMap.entries()).map(async ([userId, count]) => {
    // Bulk deduct reputation
    await deductReputation(userId, 10 * count, 'BULK_QUESTION_DELETE');

    // Single notification per user
    await createNotification({
      userId,
      type: 'VERIFICATION',
      message: `${count} questões suas foram removidas pela administração.`,
      link: '#'
    });
  });

  await Promise.all(updates);

  revalidatePath('/admin/questions');
  revalidatePath('/questoes');
}

export async function toggleQuestionVerification(id: string, correctAlternativeId?: string) {
  await requireAdmin();

  const question = await prisma.question.findUnique({
    where: { id },
    select: { isVerified: true, userId: true, title: true, user: { select: { email: true, name: true } } }
  });

  if (!question) {
    throw new Error('Question not found');
  }

  if (!question.isVerified && correctAlternativeId) {
    // Verifying: Set verified and mark correct answer
    await prisma.$transaction([
      prisma.question.update({
        where: { id },
        data: {
          isVerified: true,
          verificationRequested: false // Clear request
        }
      }),
      prisma.alternative.updateMany({
        where: { questionId: id },
        data: { isCorrect: false }
      }),
      prisma.alternative.update({
        where: { id: correctAlternativeId },
        data: { isCorrect: true }
      })
    ]);

    // Award reputation to author
    await awardReputation(question.userId, 10, 'QUESTION_VERIFIED');

    // Notify author
    await createNotification({
      userId: question.userId,
      type: 'VERIFICATION',
      message: `Sua questão foi verificada e aceita! Você ganhou 10 pontos.`,
      link: `/questoes/${id}`
    });

    // Email Notification
    if (question.user.email) {
      const { PredefinedTemplates } = await import('@/lib/email-templates');
      const template = PredefinedTemplates.VERIFICATION_APPROVED;

      await EmailService.sendEmail(
        { email: question.user.email, name: question.user.name || 'User' },
        template.subject,
        template.body(question.title)
      );
    }
  } else {
    // Unverifying or toggling without specific answer (fallback)
    await prisma.question.update({
      where: { id },
      data: {
        isVerified: !question.isVerified,
        verificationRequested: false // Clear request if verifying
      }
    });
  }

  revalidatePath('/admin/questions');
  revalidatePath(`/questoes/${id}`);
}

// ============ Comment Moderation ============

export async function getAdminComments(search?: string) {
  await requireAdmin();

  const where: any = {};

  if (search) {
    where.text = { contains: search };
  }

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      question: { select: { id: true, title: true } },
      _count: {
        select: { replies: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return comments;
}

export async function deleteComment(id: string) {
  await requireAdmin();

  // Get the comment to check for replies and get details for notification
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: {
      questionId: true,
      userId: true,
      text: true,
      question: { select: { title: true } },
      user: { select: { email: true, name: true } },
      _count: {
        select: { replies: true }
      }
    }
  });

  if (!comment) return;

  if (comment._count.replies > 0) {
    // Soft delete if there are replies to preserve the thread
    await prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        moderationReason: 'Conteúdo removido pela moderação'
      }
    });

    // Deduct reputation
    await deductReputation(comment.userId, 5, 'COMMENT_MODERATED');
  } else {
    // Hard delete if no replies
    await prisma.comment.delete({
      where: { id }
    });

    // Deduct reputation
    await deductReputation(comment.userId, 5, 'COMMENT_DELETED_BY_ADMIN');
  }

  // Notify the user
  await createNotification({
    userId: comment.userId,
    type: 'VERIFICATION',
    message: `Seu comentário na questão "${comment.question.title.substring(0, 30)}..." foi removido pela moderação.`,
    link: `/questoes/${comment.questionId}`
  });

  // Email Notification
  if (comment.user.email) {
    const { PredefinedTemplates } = await import('@/lib/email-templates');
    const template = PredefinedTemplates.WARNING;

    await EmailService.sendEmail(
      { email: comment.user.email, name: comment.user.name || 'User' },
      template.subject,
      template.body(`Seu comentário "${comment.text}" na questão "${comment.question.title}" foi removido pela moderação.`)
    );
  }

  revalidatePath('/admin/comments');
  revalidatePath(`/questoes/${comment.questionId}`);
}

// ============ Subject Management ============

export async function getAdminSubjects() {
  await requireAdmin();

  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return subjects;
}

export async function createSubject(data: { name: string; color: string; icon: string }) {
  await requireAdmin();

  const subject = await prisma.subject.create({
    data
  });

  revalidatePath('/admin/subjects');
  revalidatePath('/questoes');

  return subject;
}

export async function updateSubject(id: string, data: { name?: string; color?: string; icon?: string }) {
  await requireAdmin();

  const subject = await prisma.subject.update({
    where: { id },
    data
  });

  revalidatePath('/admin/subjects');
  revalidatePath('/questoes');

  return subject;
}

export async function deleteSubject(id: string) {
  await requireAdmin();

  // Check if subject has questions
  const count = await prisma.question.count({
    where: { subjectId: id }
  });

  if (count > 0) {
    throw new Error(`Cannot delete subject with ${count} questions. Please reassign or delete questions first.`);
  }

  await prisma.subject.delete({
    where: { id }
  });

  revalidatePath('/admin/subjects');
  revalidatePath('/questoes');
}

// ============ User Management ============

export async function getAdminUsers(search?: string) {
  await requireAdmin();

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          questions: true,
          comments: true,
          votes: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return users;
}

export async function toggleUserAdmin(id: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { isAdmin: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.update({
    where: { id },
    data: { isAdmin: !user.isAdmin }
  });

  revalidatePath('/admin/users');
}

// ============ Dashboard Stats ============

export async function getAdminStats() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalQuestions,
    totalComments,
    verifiedQuestions,
    recentQuestions,
    questionsLast30Days,
    usersLast30Days,
    subjectsWithCount,
    feedbackCount,
    recentFeedback
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.comment.count(),
    prisma.question.count({ where: { isVerified: true } }),
    prisma.question.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        subject: { select: { name: true } }
      }
    }),
    prisma.question.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    }),
    prisma.subject.findMany({
      take: 6,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    }),
    prisma.feedback.count(),
    prisma.feedback.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      }
    })
  ]);

  // Process daily activity
  const dailyActivityMap = new Map<string, { date: string; questions: number; users: number }>();

  // Initialize last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('pt-BR'); // DD/MM/YYYY
    // Store as YYYY-MM-DD for sorting if needed, or just use the string key
    // Let's use a simple format for the chart
    dailyActivityMap.set(dateStr, { date: dateStr.split('/').slice(0, 2).join('/'), questions: 0, users: 0 });
  }

  questionsLast30Days.forEach(q => {
    const dateStr = new Date(q.createdAt).toLocaleDateString('pt-BR');
    if (dailyActivityMap.has(dateStr)) {
      dailyActivityMap.get(dateStr)!.questions++;
    }
  });

  usersLast30Days.forEach(u => {
    const dateStr = new Date(u.createdAt).toLocaleDateString('pt-BR');
    if (dailyActivityMap.has(dateStr)) {
      dailyActivityMap.get(dateStr)!.users++;
    }
  });

  // Convert to array and reverse (oldest to newest)
  const dailyActivity = Array.from(dailyActivityMap.values()).reverse();

  // Process subject distribution
  const subjectDistribution = subjectsWithCount.map((s: any) => ({
    name: s.name,
    value: s._count.questions
  }))
    .sort((a, b) => b.value - a.value);



  return {
    totalUsers,
    totalQuestions,
    totalComments,
    verifiedQuestions,
    recentQuestions,
    dailyActivity,
    subjectDistribution,
    feedbackCount,
    recentFeedback
  };
}

// ============ Announcements ============

export async function createSystemAnnouncement(data: {
  title: string;
  message: string;
  htmlMessage?: string; // Optional rich HTML content
  type: 'INFO' | 'WARNING' | 'IMPORTANT';
  channels: string[];
}) {
  await requireAdmin();

  // 1. In-App Notifications
  if (data.channels.includes('IN_APP')) {
    const users = await prisma.user.findMany({ select: { id: true } });

    if (users.length > 0) {
      const notificationsData = users.map(user => ({
        userId: user.id,
        type: `ANNOUNCEMENT|${data.type}`,
        message: `${data.title}: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`,
        link: '/admin/avisos',
        read: false,
      }));

      await prisma.notification.createMany({
        data: notificationsData
      });
    }
  }

  // 2. Email Broadcast
  let emailResult = null;
  if (data.channels.includes('EMAIL')) {
    const users = await prisma.user.findMany({
      where: { email: { not: null } },
      select: { email: true, name: true }
    });

    // Convert to format expected by EmailService
    const recipients = users.map(u => ({ email: u.email!, name: u.name || 'User' }));

    // Use htmlMessage if provided, otherwise fallback to simple message structure
    const content = data.htmlMessage || `
            <h1>${data.title}</h1>
            <p>${data.message}</p>
        `;

    emailResult = await EmailService.sendBroadcastEmail(
      `[Aviso Univesp] ${data.title}`,
      content,
      recipients
    );
  }

  revalidatePath('/admin');
  return { success: true, emailResult };
}
