"use client";

import { toggleCampaignStatus } from "@/actions/campaign-actions";
import { useToast } from "@/components/ToastProvider";
import { useTransition } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

type Props = {
    campaignId: string;
    status: string;
};

export function CampaignStatusToggle({ campaignId, status }: Props) {
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const isToggleable = status === "ACTIVE" || status === "PAUSED" || status === "OUT_OF_BUDGET";

    if (!isToggleable) {
        // Render simple badge for non-toggleable statuses
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' : ''}
                ${status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' : ''}
                ${status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}
            `}>
                {status}
            </span>
        );
    }

    const isActive = status === "ACTIVE";
    const isOutOfBudget = status === "OUT_OF_BUDGET";

    const handleToggle = () => {
        startTransition(async () => {
            try {
                const result = await toggleCampaignStatus(campaignId);
                if (result.success) {
                    showToast(result.message || "Status atualizado", "success");
                } else {
                    showToast(result.message || "Erro ao atualizar status", "error");
                }
            } catch (error) {
                showToast("Erro inesperado ao atualizar campanha", "error");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`
                group relative inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ease-in-out
                ${isActive
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : isOutOfBudget
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                }
                ${isPending ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
            `}
            title={isActive ? "Pausar Campanha" : (isOutOfBudget ? "Pausar (Sem Orçamento)" : "Ativar Campanha")}
        >
            <span className="flex items-center gap-1.5">
                {isActive ? (
                    <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        ACTIVE
                        <FaPause className="w-2 h-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1" />
                    </>
                ) : isOutOfBudget ? (
                    <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        NO BUDGET
                        <FaPause className="w-2 h-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1" />
                    </>
                ) : (
                    <>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        PAUSED
                        <FaPlay className="w-2 h-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1" />
                    </>
                )}
            </span>
        </button>
    );
}
