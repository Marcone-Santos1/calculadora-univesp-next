"use server";

import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { AdCampaignStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id) return false;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
    });

    return user?.isAdmin ?? false;
}

export async function approveCampaign(campaignId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    await db.adCampaign.update({
        where: { id: campaignId },
        data: {
            status: AdCampaignStatus.ACTIVE,
            rejectionReason: null
        },
    });

    revalidatePath("/admin/ads");
    revalidatePath("/campaigns"); // Update user view too
}

export async function rejectCampaign(campaignId: string, reason: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    await db.adCampaign.update({
        where: { id: campaignId },
        data: {
            status: AdCampaignStatus.REJECTED,
            rejectionReason: reason
        },
    });

    revalidatePath("/admin/ads");
    revalidatePath("/campaigns");
}
