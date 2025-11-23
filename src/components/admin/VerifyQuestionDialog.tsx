'use client';

import { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

interface Alternative {
    id: string;
    letter: string;
    text: string;
    isCorrect: boolean;
}

interface VerifyQuestionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (alternativeId: string) => void;
    questionTitle: string;
    alternatives: Alternative[];
}

export function VerifyQuestionDialog({
    isOpen,
    onClose,
    onConfirm,
    questionTitle,
    alternatives
}: VerifyQuestionDialogProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify Question</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Please select the correct alternative for: <br />
                        <span className="font-medium text-gray-900 dark:text-white">{questionTitle}</span>
                    </p>

                    <div className="space-y-3">
                        {alternatives.map((alt) => (
                            <div
                                key={alt.id}
                                onClick={() => setSelectedId(alt.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${selectedId === alt.id
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedId === alt.id
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-gray-400 dark:border-gray-500'
                                    }`}>
                                    {selectedId === alt.id && <FaCheckCircle className="text-xs" />}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{alt.letter})</span>
                                    <span className="text-gray-700 dark:text-gray-300">{alt.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => selectedId && onConfirm(selectedId)}
                        disabled={!selectedId}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        Confirm & Verify
                    </button>
                </div>
            </div>
        </div>
    );
}
