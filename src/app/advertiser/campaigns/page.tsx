import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { CampaignStatusToggle } from "./CampaignStatusToggle";

async function getCampaigns(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            advertiserProfile: {
                include: {
                    campaigns: {
                        orderBy: { updatedAt: 'desc' }
                    }
                }
            }
        }
    });

    return user?.advertiserProfile?.campaigns || [];
}

export default async function CampaignsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const campaigns = await getCampaigns(session.user.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Campanhas</h1>
                <Link href="/advertiser/campaigns/new">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <FaPlus className="w-3 h-3" />
                        Criar Campanha
                    </button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Nome</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Orçamento Diário</th>
                            <th className="px-6 py-4 font-medium">Lance (CPC/CPM)</th>
                            <th className="px-6 py-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Nenhuma campanha encontrada via Ads.
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                        {campaign.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <CampaignStatusToggle campaignId={campaign.id} status={campaign.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {(campaign.dailyBudget / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        <span className="font-bold text-xs mr-1">{campaign.billingType}:</span>
                                        {(campaign.costValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <Link href={`/advertiser/campaigns/${campaign.id}/edit`} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-sm font-medium">
                                            Editar
                                        </Link>
                                        <Link href={`/advertiser/campaigns/${campaign.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                            Gerenciar
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
