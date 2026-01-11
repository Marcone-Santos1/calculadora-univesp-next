'use client';

import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewQuestion {
    id: string;
    isCorrect: boolean;
    selectedAlternativeId: string | null;
    question: {
        text: string;
        alternatives: {
            id: string;
            text: string;
            letter: string;
            isCorrect: boolean;
        }[];
    };
}

export function QuestionReviewList({ questions }: { questions: ReviewQuestion[] }) {
    const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const toggleAll = () => {
        if (expandedIds.size === filteredQuestions.length) {
            setExpandedIds(new Set());
        } else {
            setExpandedIds(new Set(filteredQuestions.map(q => q.id)));
        }
    };

    const filteredQuestions = questions.filter(q => {
        if (filter === 'CORRECT') return q.isCorrect;
        if (filter === 'INCORRECT') return !q.isCorrect;
        return true;
    });

    const correctCount = questions.filter(q => q.isCorrect).length;
    const incorrectCount = questions.length - correctCount;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === 'ALL' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                    >
                        Todas ({questions.length})
                    </button>
                    <button
                        onClick={() => setFilter('CORRECT')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${filter === 'CORRECT' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                    >
                        <FaCheckCircle /> Certas ({correctCount})
                    </button>
                    <button
                        onClick={() => setFilter('INCORRECT')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${filter === 'INCORRECT' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                    >
                        <FaTimesCircle /> Erradas ({incorrectCount})
                    </button>
                </div>

                <div className="text-sm text-gray-500">
                    <button onClick={toggleAll} className="hover:text-blue-500 underline decoration-dotted">
                        {expandedIds.size === filteredQuestions.length ? 'Recolher Tudo' : 'Expandir Tudo'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredQuestions.map((mq, index) => {
                    const isExpanded = expandedIds.has(mq.id);
                    const correctAlt = mq.question.alternatives.find(a => a.isCorrect);
                    const selectedAlt = mq.question.alternatives.find(a => a.id === mq.selectedAlternativeId);

                    return (
                        <div
                            key={mq.id}
                            className={`bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden transition-all ${mq.isCorrect ? 'border-green-200 dark:border-green-900/30' : 'border-red-200 dark:border-red-900/30'
                                }`}
                        >
                            <button
                                onClick={() => toggleExpand(mq.id)}
                                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${mq.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {mq.isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        Questão {questions.indexOf(mq) + 1}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${mq.isCorrect
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30'
                                        }`}>
                                        {mq.isCorrect ? 'Acertou' : 'Errou'}
                                    </span>
                                </div>
                                <div className="text-gray-400">
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-100 dark:border-zinc-800"
                                    >
                                        <div className="p-6">
                                            <div className="font-medium text-gray-800 dark:text-gray-200 mb-6 prose dark:prose-invert max-w-none">
                                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{mq.question.text}</ReactMarkdown>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                {!mq.isCorrect && selectedAlt && (
                                                    <div className="flex items-center gap-3 text-red-700 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                                        <span className="font-bold shrink-0 w-8 h-8 flex items-center justify-center bg-white dark:bg-red-900 rounded-full shadow-sm">{selectedAlt.letter}</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs uppercase font-bold opacity-70 mb-1">Sua Resposta</p>
                                                            <span>{selectedAlt.text}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {correctAlt && (
                                                    <div className="flex items-center gap-3 text-green-700 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                                                        <span className="font-bold shrink-0 w-8 h-8 flex items-center justify-center bg-white dark:bg-green-900 rounded-full shadow-sm">{correctAlt.letter}</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs uppercase font-bold opacity-70 mb-1">Resposta Correta</p>
                                                            <span>{correctAlt.text}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                        Nenhuma questão encontrada neste filtro.
                    </div>
                )}
            </div>
        </div>
    );
}
