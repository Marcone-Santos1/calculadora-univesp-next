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

export async function getSubjectByName(name: string) {
    try {
        // search insensitive
        const subject = await prisma.subject.findFirst({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                name: true,
                icon: true,
                color: true,
            },
        });

        return subject;
    } catch (error) {
        console.error("Erro ao buscar matéria:", error);
        return null;
    }
}