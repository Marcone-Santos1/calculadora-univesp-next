
"use client";

import { useState } from "react";
import { FaCheck, FaTimes, FaSearch, FaExclamationTriangle, FaMoneyBillWave, FaCalendarAlt, FaBullhorn } from "react-icons/fa";
import Image from "next/image";
import { approveCampaign, rejectCampaign } from "@/actions/ad-admin-actions";

type Campaign = {
    id: string;
    title: string;
    status: string;
    dailyBudget: number;
    billingType: string;
    costValue: number;
    startDate: Date | null;
    endDate: Date | null;
    rejectionReason: string | null;
    advertiser: {
        companyName: string | null;
        user: {
            email: string | null;
        }
    };
    creatives: {
        id: string;
        headline: string;
        description: string;
        imageUrl: string;
        destinationUrl: string;
    }[];
};
// ...


export default function AdminAdsClient({ campaigns }: { campaigns: Campaign[] }) {
    const [filter, setFilter] = useState<'PENDING' | 'ACTIVE' | 'REJECTED' | 'ALL'>('PENDING');
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const filteredCampaigns = campaigns.filter(c => {
        const matchesFilter = filter === 'ALL' ||
            (filter === 'PENDING' && c.status === 'PENDING_REVIEW') ||
            (filter === 'ACTIVE' && c.status === 'ACTIVE') ||
            (filter === 'REJECTED' && c.status === 'REJECTED');

        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.advertiser.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        await approveCampaign(id);
        setProcessingId(null);
    };

    const handleReject = async (formData: FormData) => {
        if (!rejectingId) return;
        const reason = formData.get('reason') as string;

        setProcessingId(rejectingId);
        await rejectCampaign(rejectingId, reason);
        setProcessingId(null);
        setRejectingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg border border-gray-200 dark:border-zinc-700">
                    {['PENDING', 'ACTIVE', 'REJECTED', 'ALL'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${filter === status
                                ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {status === 'PENDING' ? 'Pendentes' :
                                status === 'ACTIVE' ? 'Ativos' :
                                    status === 'REJECTED' ? 'Rejeitados' : 'Todos'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredCampaigns.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                        <FaBullhorn className="mx-auto text-4xl text-gray-300 dark:text-zinc-600 mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Nenhum anúncio encontrado.</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                ) : (
                    filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-80 bg-gray-50 dark:bg-black/20 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-800 flex flex-col justify-center">
                                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preview do Anúncio</div>
                                    {campaign.creatives[0] && (
                                        <div className="bg-white dark:bg-zinc-950 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                                            <div className="relative h-44 w-full bg-gray-100 dark:bg-zinc-800">
                                                <Image
                                                    src={campaign.creatives[0].imageUrl}
                                                    alt="Ad Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">{campaign.creatives[0].headline}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">{campaign.creatives[0].description}</p>
                                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 block truncate">{campaign.creatives[0].destinationUrl}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.title}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                        ${campaign.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                                                            campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                                                campaign.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700'}
                                                    `}>
                                                        {campaign.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{campaign.advertiser.companyName || "Empresa sem nome"}</span>
                                                    <span className="text-gray-400 dark:text-zinc-600">•</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{campaign.advertiser.user.email}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {(campaign.dailyBudget / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Orçamento Diário</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaMoneyBillWave /> Lance ({campaign.billingType})</div>
                                                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{(campaign.costValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><FaCalendarAlt /> Início</div>
                                                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('pt-BR') : 'Imediato'}
                                                </div>
                                            </div>
                                            {campaign.status === 'REJECTED' && (
                                                <div className="col-span-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                                                    <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5"><FaExclamationTriangle /> Motivo da Rejeição</div>
                                                    <div className="text-sm font-medium text-red-900 dark:text-red-200">{campaign.rejectionReason}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(campaign.status === 'PENDING_REVIEW' || campaign.status === 'ACTIVE') && (
                                        <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800 mt-auto">
                                            {campaign.status === 'PENDING_REVIEW' && (
                                                <button
                                                    onClick={() => handleApprove(campaign.id)}
                                                    disabled={processingId === campaign.id}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === campaign.id ? 'Processando...' : <><FaCheck className="text-lg" /> Aprovar Campanha</>}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setRejectingId(campaign.id)}
                                                disabled={processingId === campaign.id}
                                                className={`px-8 bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${campaign.status === 'ACTIVE' ? 'flex-1' : ''}`}
                                            >
                                                <FaTimes className="text-lg" />
                                                {campaign.status === 'ACTIVE' ? 'Desativar Anúncio' : 'Rejeitar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {rejectingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-zinc-700 p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {campaigns.find(c => c.id === rejectingId)?.status === 'ACTIVE' ? 'Desativar Anúncio Ativo' : 'Rejeitar Campanha'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Por favor, informe o motivo. O anunciante será notificado e verá esta mensagem no painel.
                        </p>

                        <form action={handleReject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Motivo</label>
                                <textarea
                                    name="reason"
                                    rows={3}
                                    autoFocus
                                    placeholder="Ex: Imagem viola direitos autorais..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 outline-none resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingId(null)}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
