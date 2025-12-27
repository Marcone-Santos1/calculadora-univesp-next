
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EditCreativeForm from "./EditCreativeForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function EditCreativePage({ params }: { params: Promise<{ campaignId: string, creativeId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await params;

    // Fetch creative and verify ownership via campaign
    const creative = await db.adCreative.findUnique({
        where: { id: resolvedParams.creativeId },
        include: {
            campaign: true
        }
    });

    if (!creative) notFound();

    // Verify ownership
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true }
    });

    if (!user?.advertiserProfile || creative.campaign.advertiserId !== user.advertiserProfile.id) {
        redirect("/advertiser/dashboard");
    }

    // Ensure we are in the correct campaign context
    if (creative.campaignId !== resolvedParams.campaignId) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link
                href={`/advertiser/campaigns/${resolvedParams.campaignId}`}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-6 transition-colors"
            >
                <FaArrowLeft /> Voltar para Detalhes da Campanha
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Gerenciar Criativo</h1>

            <EditCreativeForm campaignId={resolvedParams.campaignId} creative={creative} />
        </div>
    );
}
