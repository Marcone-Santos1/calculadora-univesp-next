import React from 'react';
import AvaImporter from '@/components/admin/AvaImporter';

export const metadata = {
    title: 'Importador AVA | Admin',
    description: 'Sincronização inteligente de atividades e provas.',
};

export default function ImportPage() {
    return (
        <main className="w-full min-h-screen bg-zinc-50 dark:bg-black/20 pb-20 space-y-12">
            {/* Hero Header Minimalista */}
            <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                Importador AVA
                            </h1>
                            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-lg">
                                Central de controle para o robô de extração.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Sistema Operacional
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-6 max-w-6xl">
                <AvaImporter />
            </div>
        </main>
    );
}