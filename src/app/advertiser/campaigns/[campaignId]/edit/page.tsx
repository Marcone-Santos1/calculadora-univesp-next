
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CampaignForm from "@/app/advertiser/campaigns/new/CampaignForm";
import { getSubjectsWithCounts } from "@/actions/question-actions";

async function getCampaign(campaignId: string, userId: string) {
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId },
        include: {
            creatives: true,
            targetSubjects: true
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
    const [campaign, subjects] = await Promise.all([
        getCampaign(resolvedParams.campaignId, session.user.id),
        getSubjectsWithCounts()
    ]);

    if (!campaign) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Editar Campanha</h1>
            <CampaignForm initialData={campaign} subjects={subjects} />
        </div>
    );
}
