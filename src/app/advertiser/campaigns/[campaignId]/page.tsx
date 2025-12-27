
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaEdit, FaEye, FaMousePointer, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { AnalyticsChart } from "./AnalyticsChart";

async function getCampaignWithMetrics(campaignId: string, userId: string) {
    const campaign = await db.adCampaign.findUnique({
        where: { id: campaignId },
        include: {
            creatives: true,
            advertiser: true,
            dailyMetrics: {
                orderBy: { date: 'asc' },
                take: 30 // Last 30 days
            }
        }
    });

    if (!campaign || campaign.advertiser.userId !== userId) {
        return null;
    }
    return campaign;
}

export default async function CampaignDetailsPage({ params }: { params: Promise<{ campaignId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const resolvedParams = await params;
    const campaign = await getCampaignWithMetrics(resolvedParams.campaignId, session.user.id);

    if (!campaign) {
        notFound();
    }

    // Calculate Aggregates
    const totalViews = campaign.dailyMetrics.reduce((acc, m) => acc + m.views, 0);
    const totalClicks = campaign.dailyMetrics.reduce((acc, m) => acc + m.clicks, 0);
    const totalSpend = campaign.dailyMetrics.reduce((acc, m) => acc + m.spend, 0);
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div>
                <Link href="/advertiser/campaigns" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mb-4 transition-colors">
                    <FaArrowLeft /> Voltar para Campanhas
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                                ${campaign.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' : ''}
                                ${campaign.status === 'PAUSED' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : ''}
                                ${campaign.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}
                                ${campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' : ''}
                            `}>
                                {campaign.status.replace('_', ' ')}
                            </span>
                        </div>
                        {campaign.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200 animate-in fade-in slide-in-from-top-2">
                                <strong>Motivo da Rejeição:</strong> {campaign.rejectionReason}
                            </div>
                        )}
                    </div>
                    <Link href={`/advertiser/campaigns/${campaign.id}/edit`}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
                            <FaEdit /> Editar Campanha
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FaMoneyBillWave className="text-6xl text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Gasto</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(totalSpend / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">Investimento acumulado</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FaEye className="text-6xl text-purple-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Visualizações</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalViews.toLocaleString('pt-BR')}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">Total de impressões</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FaMousePointer className="text-6xl text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cliques</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalClicks.toLocaleString('pt-BR')}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">Interações diretas</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FaChartLine className="text-6xl text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CTR</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {ctr.toFixed(2)}%
                    </p>
                    <div className="mt-2 text-xs text-gray-400">Taxa de cliques</div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Performance (Últimos 30 dias)</h2>
                </div>
                <div className="p-6 h-80">
                    <AnalyticsChart data={campaign.dailyMetrics} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Configurações</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-500 dark:text-gray-400">Orçamento Diário</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {(campaign.dailyBudget / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-500 dark:text-gray-400">Modelo de Cobrança</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{campaign.billingType}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-500 dark:text-gray-400">Lance ({campaign.billingType})</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {(campaign.costValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-500 dark:text-gray-400">Início</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('pt-BR') : 'Imediato'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-gray-400">Término</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('pt-BR') : 'Indefinido'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Creatives Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Criativos (Anúncios)</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {campaign.creatives.map((creative) => (
                                <div key={creative.id} className="bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                    <div className="relative w-full h-40 bg-gray-200 dark:bg-zinc-800">
                                        <Image
                                            src={creative.imageUrl}
                                            alt={creative.headline}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{creative.headline}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 bg-white dark:bg-black/40 p-2 rounded border border-gray-100 dark:border-zinc-800/50 text-xs">
                                            {creative.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-gray-200 dark:border-zinc-800">
                                            <span className="flex items-center gap-1"><FaEye className="text-purple-500" /> {creative.views}</span>
                                            <span className="flex items-center gap-1"><FaMousePointer className="text-green-500" /> {creative.clicks}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
