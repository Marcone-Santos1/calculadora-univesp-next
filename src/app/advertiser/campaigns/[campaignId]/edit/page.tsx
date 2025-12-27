
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CampaignForm from "@/app/advertiser/campaigns/new/CampaignForm";

async function getCampaign(campaignId: string, userId: string) {
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId },
        include: {
            creatives: true
        }
    });

    if (!campaign || campaign.advertiserId !== (await db.advertiserProfile.findUnique({ where: { userId } }))?.id) {
        return null;
    }
    return campaign;
}

export default async function EditCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await params;
    const campaign = await getCampaign(resolvedParams.campaignId, session.user.id);

    if (!campaign) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Editar Campanha</h1>
            <CampaignForm initialData={campaign} />
        </div>
    );
}
