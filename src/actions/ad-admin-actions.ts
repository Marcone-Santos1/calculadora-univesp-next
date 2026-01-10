"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma as db } from "@/lib/prisma";
import { AdCampaignStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveCampaign(campaignId: string) {
    await requireAdmin();

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
    await requireAdmin();

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
