
"use server";

import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile) {
        throw new Error("Advertiser profile not found");
    }

    // 1. Campaign Details
    const title = formData.get("title") as string;
    const dailyBudget = Number(formData.get("dailyBudget")) * 100; // cents
    const startDate = new Date(formData.get("startDate") as string);
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    // Billing
    const billingType = (formData.get("billingType") as "CPC" | "CPM") || "CPC";
    const costValue = Number(formData.get("costValue")) * 100; // cents (CPC or CPM)

    // 2. Creative Details
    const headline = formData.get("headline") as string;
    const description = formData.get("description") as string;
    const destinationUrl = formData.get("destinationUrl") as string;
    const imageUrl = formData.get("imageUrl") as string || null;
    const targetSubjects = formData.getAll("targetSubjects") as string[];

    await db.adCampaign.create({
        data: {
            advertiserId: user.advertiserProfile.id,
            title,
            dailyBudget,
            startDate,
            endDate,
            billingType,
            costValue,
            ...(targetSubjects.length > 0 && {
                targetSubjects: {
                    connect: targetSubjects.map(id => ({ id }))
                }
            }),
            status: "PENDING_REVIEW", // Default status
            creatives: {
                create: {
                    headline,
                    description,
                    destinationUrl,
                    imageUrl
                }
            }
        }
    });



    revalidatePath("/advertiser/campaigns");
    redirect("/advertiser/campaigns");
}

export async function toggleCampaignStatus(campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile) {
        return { success: false, message: "Advertiser profile not found" };
    }

    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign || campaign.advertiserId !== user.advertiserProfile.id) {
        return { success: false, message: "Unauthorized" };
    }

    let newStatus = campaign.status;

    if (campaign.status === "ACTIVE") {
        newStatus = "PAUSED";
    } else if (campaign.status === "PAUSED") {
        // Check balance before activating
        if (user.advertiserProfile.balance <= 0 || campaign.costValue > campaign.dailyBudget) {
            return {
                success: false,
                message: "Saldo insuficiente. Adicione fundos para ativar suas campanhas."
            };
        }
        newStatus = "ACTIVE";
    } else if (campaign.status === "OUT_OF_BUDGET") {
        // Allow pausing from OUT_OF_BUDGET state
        newStatus = "PAUSED";
    } else {
        // Can't toggle other statuses via this simple action
        // DRAFT, PENDING_REVIEW, REJECTED
        return {
            success: false,
            message: `Não é possível alterar campanhas com status ${campaign.status}`
        };
    }

    await db.adCampaign.update({
        where: { id: campaignId },
        data: { status: newStatus }
    });

    revalidatePath("/advertiser/campaigns");
    return { success: true, message: "Status atualizado com sucesso" };
}

export async function updateCampaign(campaignId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile) {
        throw new Error("Advertiser profile not found");
    }

    // Verify ownership
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId },
        include: { creatives: true }
    });

    if (!campaign || campaign.advertiserId !== user.advertiserProfile.id) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const dailyBudget = Number(formData.get("dailyBudget")) * 100;
    const startDate = new Date(formData.get("startDate") as string);
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    // Billing
    const billingType = (formData.get("billingType") as "CPC" | "CPM") || "CPC";
    const costValue = Number(formData.get("costValue")) * 100;
    const targetSubjects = formData.getAll("targetSubjects") as string[];

    await db.adCampaign.update({
        where: { id: campaignId },
        data: {
            title,
            dailyBudget,
            startDate,
            endDate,
            billingType,
            costValue,
            targetSubjects: {
                set: targetSubjects.map(id => ({ id }))
            },
            status: "PENDING_REVIEW", // Re-review on edit
            rejectionReason: null
        }
    });

    revalidatePath("/advertiser/campaigns");
    revalidatePath(`/advertiser/campaigns/${campaignId}`);
    redirect("/advertiser/campaigns");
}

export async function addCreativeToCampaign(campaignId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile) {
        throw new Error("Advertiser profile not found");
    }

    // Verify ownership
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign || campaign.advertiserId !== user.advertiserProfile.id) {
        throw new Error("Unauthorized");
    }

    await db.adCampaign.update({
        where: { id: campaignId },
        data: {
            status: "PENDING_REVIEW",
            rejectionReason: null
        }
    });

    const headline = formData.get("headline") as string;
    const description = formData.get("description") as string;
    const destinationUrl = formData.get("destinationUrl") as string;
    const imageUrl = formData.get("imageUrl") as string || null;

    await db.adCreative.create({
        data: {
            campaignId,
            headline,
            description,
            destinationUrl,
            imageUrl
        }
    });

    revalidatePath(`/advertiser/campaigns/${campaignId}`);
    redirect(`/advertiser/campaigns/${campaignId}`);
}

export async function updateCreative(campaignId: string, creativeId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile) {
        throw new Error("Advertiser profile not found");
    }

    // Verify ownership
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign || campaign.advertiserId !== user.advertiserProfile.id) {
        throw new Error("Unauthorized");
    }

    const headline = formData.get("headline") as string;
    const description = formData.get("description") as string;
    const destinationUrl = formData.get("destinationUrl") as string;
    const imageUrl = formData.get("imageUrl") as string || null;

    await db.adCampaign.update({
        where: { id: campaignId },
        data: {
            status: "PENDING_REVIEW",
            rejectionReason: null
        }
    });

    await db.adCreative.update({
        where: { id: creativeId },
        data: {
            headline,
            description,
            destinationUrl,
            imageUrl
        }
    });

    // If campaign was rejected, maybe we should set it back to PENDING_REVIEW?
    if (campaign.status === 'REJECTED') {
        await db.adCampaign.update({
            where: { id: campaignId },
            data: { status: 'PENDING_REVIEW', rejectionReason: null }
        });
    }

    revalidatePath(`/advertiser/campaigns/${campaignId}`);
    redirect(`/advertiser/campaigns/${campaignId}`);
}
