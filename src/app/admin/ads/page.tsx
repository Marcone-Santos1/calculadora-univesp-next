import { prisma as db } from "@/lib/prisma";
import AdminAdsClient from "./AdminAdsClient";

async function getAllCampaigns() {
    return await db.adCampaign.findMany({
        include: {
            creatives: true,
            advertiser: {
                select: {
                    companyName: true,
                    whatsapp: true,
                    user: {
                        select: { email: true }
                    }
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50 // Limit to last 50 for performance
    });
}

export default async function AdminAdsPage() {
    const campaigns = await getAllCampaigns();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Moderação de Anúncios</h1>
            <AdminAdsClient campaigns={campaigns} />
        </div>
    );
}
