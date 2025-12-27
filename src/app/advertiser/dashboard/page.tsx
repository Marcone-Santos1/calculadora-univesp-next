import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FaWallet, FaMousePointer, FaEye, FaArrowUp } from "react-icons/fa";
import Link from "next/link";
import { Loading } from "@/components/Loading";

async function getStats(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            advertiserProfile: {
                include: {
                    campaigns: {
                        include: { creatives: true }
                    }
                }
            }
        }
    });

    if (!user) {
        console.log("getStats: User not found in DB for ID", userId);
        return null; // This triggers the infinite loading state
    }

    if (!user.advertiserProfile) {
        // Auto create profile if not exists? Or show empty state.
        // For now return defaults.
        return {
            balance: 0,
            impressions: 0,
            clicks: 0,
            spend: 0,
            activeCampaigns: 0
        };
    }

    const { balance, campaigns } = user.advertiserProfile;

    let impressions = 0;
    let clicks = 0;

    campaigns.forEach(c => {
        c.creatives.forEach(creative => {
            impressions += creative.views;
            clicks += creative.clicks;
        });
    });

    return {
        balance,
        impressions,
        clicks,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length
    };
}


export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const stats = await getStats(session.user.id);

    if (!stats) {
        // User exists in session but not in DB (Stale session after DB reset)
        redirect("/login");
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h1>
                <p className="text-gray-500 dark:text-gray-400">Bem-vindo ao seu painel de anunciante.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Balance Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <FaWallet className="w-5 h-5" />
                        </div>
                        <Link href="/advertiser/dashboard/finance">
                            <button className="text-xs font-semibold bg-gray-900 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-90">
                                Recarregar
                            </button>
                        </Link>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Saldo Disponível</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {(stats.balance / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h3>
                    </div>
                </div>

                {/* Clicks Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <FaMousePointer className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cliques Totais</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.clicks}
                        </h3>
                    </div>
                </div>

                {/* Impressions Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <FaEye className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Visualizações</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.impressions}
                        </h3>
                    </div>
                </div>

                {/* CTR Card (Calculated) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <FaArrowUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">CTR Médio</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0}%
                        </h3>
                    </div>
                </div>

            </div>

            {/* Recent Activity or Campaigns could go here */}

        </div>
    );
}
