'use server';

import { prisma } from '@/lib/prisma';

export async function getAllSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                icon: true,
                color: true,
            }
        });
        return subjects;
    } catch (error) {
        console.error("Erro ao buscar matérias:", error);
        return [];
    }
}