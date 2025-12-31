'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaTimes, FaTrophy, FaStar, FaLock, FaCheckCircle, FaRocket } from 'react-icons/fa';
import { LEVELS } from '@/utils/reputation';

interface LevelInfoModalProps {
    currentReputation: number;
    currentLevel: number;
}

export function LevelInfoModal({ currentReputation, currentLevel }: LevelInfoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate progress to next level
    const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
    const currentLevelInfo = LEVELS.find(l => l.level === currentLevel);

    let progressPercent = 100;
    if (nextLevel && currentLevelInfo) {
        const range = nextLevel.minReputation - currentLevelInfo.minReputation;
        const currentProgress = currentReputation - currentLevelInfo.minReputation;
        progressPercent = Math.min(100, Math.max(0, (currentProgress / range) * 100));
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded-full"
                title="Ver Jornada de Níveis"
            >
                <FaQuestionCircle className="text-sm" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            {/* Header Gradient */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <FaTimes size={16} />
                            </button>

                            <div className="relative p-6 md:p-8 max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {/* Hero Section */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl shadow-lg mb-4 transform rotate-3">
                                        <FaTrophy />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                                        Sua Trajetória
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                        Suba de nível contribuindo com a comunidade e desbloqueie novas insígnias!
                                    </p>

                                    {/* Current Progress Card */}
                                    <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm inline-block w-full max-w-sm">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-gray-600 dark:text-gray-300">Nível Atual: {currentLevel}</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.floor(progressPercent)}% para o próximo</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                                            <span>{currentReputation} pts</span>
                                            <span>{nextLevel ? nextLevel.minReputation : 'Max'} pts</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4 relative pl-12 before:content-[''] before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                                    {LEVELS.map((lvl, index) => {
                                        const isUnlocked = currentLevel >= lvl.level;
                                        const isCurrent = currentLevel === lvl.level;
                                        const isNext = currentLevel + 1 === lvl.level;

                                        return (
                                            <motion.div
                                                key={lvl.level}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative"
                                            >
                                                {/* Node Icon */}
                                                <div className={`absolute -left-[48px] top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 z-10 transition-colors duration-300
                                                    ${isUnlocked
                                                        ? 'bg-blue-500 border-white dark:border-gray-900 text-white shadow-md'
                                                        : 'bg-gray-100 dark:bg-gray-800 border-white dark:border-gray-900 text-gray-400 dark:text-gray-600'
                                                    }
                                                    ${isCurrent ? 'ring-4 ring-blue-500/20 scale-110' : ''}
                                                `}>
                                                    {isCurrent ? <FaRocket className="text-sm" /> :
                                                        isUnlocked ? <FaCheckCircle className="text-sm" /> :
                                                            <FaLock className="text-xs" />
                                                    }
                                                </div>

                                                {/* Card */}
                                                <div className={`
                                                    p-4 rounded-xl border transition-all duration-300
                                                    ${isCurrent
                                                        ? 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-500/50 shadow-lg scale-[1.02]'
                                                        : isUnlocked
                                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'
                                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50 grayscale'
                                                    }
                                                `}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`
                                                                flex items-center justify-center w-12 h-12 rounded-lg text-lg font-bold
                                                                ${isUnlocked
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                                                }
                                                            `}>
                                                                {lvl.level}
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-bold text-lg ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                                    {lvl.title}
                                                                </h4>
                                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                                                                    {lvl.minReputation.toLocaleString()} XP
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isCurrent && (
                                                            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full animate-pulse">
                                                                ATUAL
                                                            </div>
                                                        )}
                                                        {isNext && (
                                                            <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">
                                                                PRÓXIMO
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
