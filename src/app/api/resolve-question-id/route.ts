import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuestionPath } from '@/utils/functions';

/**
 * Resolve um ID de questão para o path canônico (usado pelo middleware para redirect 308).
 * GET /api/resolve-question-id?id=xxx -> { path: "/questoes/subject-slug/title-id" } ou 404.
 */
export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            subject: { select: { name: true } },
        },
    });

    if (!question) {
        return NextResponse.json(null, { status: 404 });
    }

    const path = getQuestionPath({
        id: question.id,
        title: question.title,
        subjectName: question.subject?.name,
        subject: question.subject ? { name: question.subject.name } : null,
    });

    return NextResponse.json({ path });
}
