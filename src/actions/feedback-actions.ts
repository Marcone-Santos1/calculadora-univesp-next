'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { checkIsAdmin } from '@/lib/admin-auth';
import { FeedbackType } from '@prisma/client';

const FeedbackSchema = z.object({
  message: z.string().min(3, "A mensagem deve ter pelo menos 3 caracteres").max(1000),
  type: z.enum(['BUG', 'IDEA', 'OTHER']),
  pageUrl: z.string().optional(),
});

export async function submitFeedback(formData: FormData) {
  try {
    const session = await auth();
    
    const rawData = {
      message: formData.get('message'),
      type: formData.get('type'),
      pageUrl: formData.get('pageUrl'),
    };

    const validated = FeedbackSchema.safeParse(rawData);

    if (!validated.success) {
      return { success: false, error: "Dados inválidos." };
    }

    await prisma.feedback.create({
      data: {
        message: validated.data.message,
        type: validated.data.type as FeedbackType,
        pageUrl: validated.data.pageUrl,
        userId: session?.user?.id || null, // Aceita anônimo se não estiver logado
      },
    });

    // Opcional: Enviar notificação para o seu email/discord aqui

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    return { success: false, error: "Erro interno ao salvar feedback." };
  }
}

export async function getFeedbacks() {
  const session = await checkIsAdmin();
  if (!session) return [];

  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    });
    return feedbacks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteFeedback(id: string) {
    const session = await checkIsAdmin();
    if (!session) return { success: false };
    
    try {
        await prisma.feedback.delete({ where: { id } });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}