/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useTransition } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Alternative {
    id: string;
    letter: string;
    text: string;
    votes: any[];
    voteCount: number;
    isCorrect?: boolean;
}

interface AlternativeItemProps {
    alternative: Alternative;
    totalVotes: number;
    onVote: (id: string) => Promise<void>;
    hasVoted: boolean;
    isVerified?: boolean;
    isLoggedIn: boolean;
    userVotedId?: string; // ID of the alternative the user voted for
}

export const AlternativeItem: React.FC<AlternativeItemProps> = ({
    alternative,
    totalVotes,
    onVote,
    hasVoted,
    isVerified,
    isLoggedIn,
    userVotedId
}) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { showToast } = useToast();
    const percentage = totalVotes > 0 ? Math.round((alternative.voteCount / totalVotes) * 100) : 0;

    const isUserVote = userVotedId === alternative.id;
    const isMostVoted = !hasVoted && percentage > 0 && alternative.voteCount === Math.max(...(totalVotes > 0 ? [alternative.voteCount] : [0]));

    const [showConfirmModal, setShowConfirmModal] = React.useState(false);

    const handleVoteClick = () => {
        if (!isLoggedIn) {
            showToast('Você precisa estar logado para votar. Por favor, faça login.', 'warning');
            return;
        }

        if (hasVoted) {
            showToast('Você já votou nesta questão!', 'info');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmVote = () => {
        setShowConfirmModal(false);
        startTransition(async () => {
            try {
                await onVote(alternative.id);
                showToast('Voto registrado com sucesso!', 'success');
                router.refresh();
            } catch {
                showToast('Erro ao registrar voto. Tente novamente.', 'error');
            }
        });
    };

    return (
        <>
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmVote}
                title="Confirmar Voto"
                description={`Tem certeza que deseja votar na alternativa ${alternative.letter}?\n\nUma vez feito o voto, não é possível alterá-lo.`}
                confirmText="Confirmar Voto"
                cancelText="Cancelar"
                variant="info"
            />
            <div
                className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${isPending ? 'opacity-50 cursor-wait' : hasVoted || isVerified ? 'cursor-default' : 'cursor-pointer hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                    ${alternative.isCorrect && isVerified
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : isUserVote
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : isMostVoted
                                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
                `}
                onClick={handleVoteClick}
            >
                {/* Progress Bar Background */}
                <div
                    className={`absolute inset-0 rounded-lg opacity-10 transition-all duration-1000 ease-out
                            ${alternative.isCorrect ? 'bg-green-500' : isUserVote ? 'bg-blue-500' : 'bg-purple-500'}
                        `}
                    style={{ width: `${alternative.isCorrect ? 100 : percentage}%` }}
                />

                <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                            ${alternative.isCorrect && isVerified
                                ? 'bg-green-500 text-white border-green-500'
                                : isUserVote
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : isMostVoted
                                        ? 'bg-purple-500 text-white border-purple-500'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}
                        `}>
                            {alternative.letter}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {alternative.text}
                        </span>
                        {isUserVote && (
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                Seu voto
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                            { isVerified ? '' : `${percentage}%`}
                        </span>
                        {alternative.isCorrect && isVerified && (
                            <FaCheckCircle className="text-green-500 text-xl" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
