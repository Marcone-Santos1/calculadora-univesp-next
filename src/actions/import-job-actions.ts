'use server'

import { prisma as db } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { encrypt } from '@/utils/crypto';

export async function createImportJob(login: string, passwordRaw: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Não autorizado');
    }

    // Checking if there's already a job running
    const existingJob = await db.importJob.findFirst({
        where: {
            userId: session.user.id,
            status: {
                in: ['PENDING', 'PROCESSING']
            }
        }
    });

    if (existingJob) {
        throw new Error('Você já tem uma importação em andamento.');
    }

    const encryptedPassword = encrypt(passwordRaw);

    const job = await db.importJob.create({
        data: {
            userId: session.user.id,
            login,
            password: encryptedPassword,
        }
    });

    return job.id;
}

export async function getImportJob(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Não autorizado');
    }

    const job = await db.importJob.findUnique({
        where: {
            id: jobId,
        }
    });

    if (!job) {
        throw new Error('Job não encontrado');
    }

    if (job.userId !== session.user.id) {
        throw new Error('Acesso negado ao Job');
    }

    // Parse logs cleanly so the client can use them easily
    let logsArray = [];
    let metrics = { found: 0, imported: 0, skipped: 0, xp: 0 };

    if (job.logs) {
        try {
            const parsed = typeof job.logs === 'string' ? JSON.parse(job.logs) : job.logs;
            logsArray = parsed.logs || [];
            metrics = parsed.metrics || metrics;
        } catch (e) {
            console.error("Erro ao fazer parse dos logs do job", e);
        }
    }

    return {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt,
        logs: logsArray,
        metrics: metrics
    };
}

export async function cancelImportJob(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Não autorizado');
    }

    const job = await db.importJob.findUnique({
        where: { id: jobId },
        select: { userId: true, status: true, logs: true }
    });

    if (!job) throw new Error('Job não encontrado');
    if (job.userId !== session.user.id) throw new Error('Acesso negado');

    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
        return; // Already finished
    }

    // append cancellation log to existing logs if possible
    let currentLogs: any = { logs: [], metrics: { found: 0, imported: 0, skipped: 0, xp: 0 } };
    if (job.logs) {
        try {
            currentLogs = typeof job.logs === 'string' ? JSON.parse(job.logs) : job.logs;
        } catch (e) { }
    }

    const cancelLog = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString('pt-BR'),
        msg: 'Cancelado pelo usuário. O Worker será interrompido na próxima checagem.',
        type: 'error'
    };

    currentLogs.logs = currentLogs.logs || [];
    currentLogs.logs.push(cancelLog);

    await db.importJob.update({
        where: { id: jobId },
        data: {
            status: 'FAILED',
            logs: currentLogs
        }
    });
}
