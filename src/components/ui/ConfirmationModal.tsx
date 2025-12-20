'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10"
                    >
                        <div className={`flex items-center gap-4 mb-4 ${variant === 'danger' ? 'text-red-500' :
                                variant === 'info' ? 'text-blue-500' : 'text-amber-500'
                            }`}>
                            <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/20' :
                                    variant === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-amber-100 dark:bg-amber-900/20'
                                }`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                {title}
                            </h3>
                        </div>

                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed whitespace-pre-line">
                            {description}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-medium transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors shadow-lg ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                                        variant === 'info' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' :
                                            'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
