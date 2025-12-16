"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Assuming standard prisma singleton
import { AacActivity, AacCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ActivityData = {
    id?: string;
    title: string;
    category: AacCategory;
    description?: string;
    institution?: string;
    originalHours: number;
    validHours: number;
    startDate?: Date;
    endDate?: Date;
}

async function getSessionUser() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    return session.user.id;
}

export async function getActivities() {
    const userId = await getSessionUser();
    return prisma.aacActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function saveActivity(data: ActivityData) {
    const userId = await getSessionUser();

    if (data.id) {
        // Update
        const existing = await prisma.aacActivity.findUnique({
            where: { id: data.id }
        });

        if (!existing || existing.userId !== userId) {
            throw new Error("Not found or unauthorized");
        }

        await prisma.aacActivity.update({
            where: { id: data.id },
            data: {
                title: data.title,
                category: data.category,
                description: data.description,
                institution: data.institution,
                originalHours: data.originalHours,
                validHours: data.validHours, // We trust the client logic? Or generic re-validate? 
                // Better to re-validate here? For now trust client or re-calc if referenced validation lib
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
    } else {
        // Create
        await prisma.aacActivity.create({
            data: {
                ...data,
                userId
            }
        });
    }
    revalidatePath("/aac");
}

export async function deleteActivity(id: string) {
    const userId = await getSessionUser();

    // Verify ownership
    const existing = await prisma.aacActivity.findUnique({
        where: { id }
    });

    if (!existing || existing.userId !== userId) {
        throw new Error("Unauthorized");
    }

    await prisma.aacActivity.delete({ where: { id } });
    revalidatePath("/aac");
}

// Sync local data to server
export async function syncActivities(localActivities: ActivityData[]) {
    const userId = await getSessionUser();

    // Fetch existing to avoid duplicates if possible?
    // Strategy: Just create new ones? Or try to match?
    // Prompt said: "salva no banco (ignorando duplicatas por ID ou Título)"

    // Naive approach:
    // If ID exists and is UUID-like (server generated), update? 
    // But local IDs might be temporary (e.g. Date.now()).

    // We will treat local activities that don't have a valid server ID as NEW.
    // If they have same title as existing, we skip? 

    const existing = await prisma.aacActivity.findMany({
        where: { userId }
    });

    const existingTitles = new Set(existing.map(a => a.title.toLowerCase()));

    let addedCount = 0;

    for (const local of localActivities) {
        // Skip if title exists (simple dedup per prompt)
        if (existingTitles.has(local.title.toLowerCase())) {
            continue;
        }

        await prisma.aacActivity.create({
            data: {
                title: local.title,
                category: local.category,
                description: local.description,
                institution: local.institution,
                originalHours: local.originalHours,
                validHours: local.validHours,
                startDate: local.startDate,
                endDate: local.endDate,
                userId
            }
        });
        addedCount++;
    }

    revalidatePath("/aac");
    return { added: addedCount, total: existing.length + addedCount };
}
