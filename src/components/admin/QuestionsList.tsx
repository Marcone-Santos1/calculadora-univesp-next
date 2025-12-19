'use client';

import { useState, useTransition } from 'react';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt, FaExclamationCircle } from 'react-icons/fa';
import { deleteQuestion, deleteQuestions, toggleQuestionVerification } from '@/actions/admin-actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { VerifyQuestionDialog } from '@/components/admin/VerifyQuestionDialog';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Alternative {
    id: string;
    letter: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    title: string;
    isVerified: boolean;
    verificationRequested?: boolean;
    verificationRequestDate?: Date | null;
    createdAt: Date;
    user: { name: string | null; email: string | null };
    subject: { name: string };
    alternatives: Alternative[];
    _count: { alternatives: number; comments: number };
}

interface QuestionsListProps {
    questions: Question[];
    verificationRequests?: Question[];
}

export function QuestionsList({ questions, verificationRequests = [] }: QuestionsListProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false); // UI state for bulk delete confirmation
    const [verifyQuestion, setVerifyQuestion] = useState<Question | null>(null);
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();
    const router = useRouter();

    const displayQuestions = activeTab === 'all' ? questions : verificationRequests;

    const handleSelectAll = () => {
        if (selectedIds.size === displayQuestions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayQuestions.map(q => q.id)));
        }
    };

    const handleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteQuestion(id);
                showToast('Question deleted successfully', 'success');
                router.refresh();
            } catch {
                showToast('Failed to delete question', 'error');
            }
        });
    };

    const handleBulkDelete = () => {
        startTransition(async () => {
            try {
                await deleteQuestions(Array.from(selectedIds));
                showToast(`${selectedIds.size} questions deleted successfully`, 'success');
                setSelectedIds(new Set());
                setIsBulkDeleting(false);
                router.refresh();
            } catch {
                showToast('Failed to delete selected questions', 'error');
                setIsBulkDeleting(false);
            }
        });
    };

    const handleToggleVerification = (question: Question) => {
        if (!question.isVerified) {
            // Open dialog to select correct answer
            setVerifyQuestion(question);
        } else {
            // Just unverify
            startTransition(async () => {
                try {
                    await toggleQuestionVerification(question.id);
                    showToast('Question unverified', 'success');
                    router.refresh();
                } catch {
                    showToast('Failed to unverify question', 'error');
                }
            });
        }
    };

    const handleConfirmVerification = (alternativeId: string) => {
        if (!verifyQuestion) return;

        startTransition(async () => {
            try {
                await toggleQuestionVerification(verifyQuestion.id, alternativeId);
                showToast('Question verified successfully', 'success');
                setVerifyQuestion(null);
                router.refresh();
            } catch {
                showToast('Failed to verify question', 'error');
            }
        });
    };

    return (
        <>
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-1 font-medium transition-colors relative ${activeTab === 'all'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    All Questions
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-2 px-1 font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'requests'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Verification Requests
                    {verificationRequests.length > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {verificationRequests.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="space-y-4">
                {selectedIds.size > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex items-center justify-between animate-fadeIn mb-4">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-blue-800 dark:text-blue-200">
                                {selectedIds.size} selected
                            </span>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Clear selection
                            </button>
                        </div>
                        <button
                            onClick={() => setIsBulkDeleting(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-sm flex items-center gap-2"
                        >
                            <FaTrash /> Delete Selected
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-2 px-2">
                    <input
                        type="checkbox"
                        checked={displayQuestions.length > 0 && selectedIds.size === displayQuestions.length}
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">Select All</span>
                </div>

                {displayQuestions.map((question) => (
                    <div
                        key={question.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg overflow-x-auto shadow-sm border p-6 transition-colors ${selectedIds.has(question.id)
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(question.id)}
                                        onChange={() => handleSelectOne(question.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            href={`/questoes/${question.id}`}
                                            target="_blank"
                                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                                        >
                                            {question.title}
                                            <FaExternalLinkAlt className="text-sm" />
                                        </Link>
                                        {question.isVerified && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                                                Verified
                                            </span>
                                        )}
                                        {question.verificationRequested && !question.isVerified && (
                                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded flex items-center gap-1">
                                                <FaExclamationCircle /> Requested
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>Subject: {question.subject.name}</span>
                                        <span>•</span>
                                        <span>By: {question.user.name || question.user.email}</span>
                                        <span>•</span>
                                        <span>{question._count.alternatives} alternatives</span>
                                        <span>•</span>
                                        <span>{question._count.comments} comments</span>
                                        <span>•</span>
                                        <span>{new Date(question.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleVerification(question)}
                                    disabled={isPending}
                                    className={`p-2 rounded-lg transition-colors ${question.isVerified
                                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                                        : 'bg-green-100 dark:bg-green-900/20 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/30'
                                        }`}
                                    title={question.isVerified ? 'Unverify' : 'Verify'}
                                >
                                    {question.isVerified ? <FaTimesCircle /> : <FaCheckCircle />}
                                </button>
                                <button
                                    onClick={() => setDeleteId(question.id)}
                                    disabled={isPending}
                                    className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {displayQuestions.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No questions found</p>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && handleDelete(deleteId)}
                title="Delete Question"
                message="Are you sure you want to delete this question? This will also delete all alternatives, votes, and comments. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={isBulkDeleting}
                onClose={() => setIsBulkDeleting(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedIds.size} Questions?`}
                message={`Are you sure you want to delete ${selectedIds.size} items? This action cannot be undone and will penalize the authors.`}
                confirmText={`Delete ${selectedIds.size} Items`}
                variant="danger"
            />

            {verifyQuestion && (
                <VerifyQuestionDialog
                    isOpen={!!verifyQuestion}
                    onClose={() => setVerifyQuestion(null)}
                    onConfirm={handleConfirmVerification}
                    questionTitle={verifyQuestion.title}
                    alternatives={verifyQuestion.alternatives}
                />
            )}
        </>
    );
}
