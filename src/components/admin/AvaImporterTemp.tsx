'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, AlertTriangle, Info, Loader2,
    CheckCircle, XCircle, Clock, RefreshCw,
    User, Key, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createImportJob, getImportJob, getMyImportJobs } from '@/actions/import-job-actions';

// Tipos
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface ImportJobSummary {
    id: string;
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    questionsFound: number;
    questionsImported: number;
}

const statusConfig: Record<JobStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    PENDING: {
        label: 'Na fila',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800/50',
        icon: Clock,
    },
    PROCESSING: {
        label: 'Processando',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800/50',
        icon: Loader2,
    },
    COMPLETED: {
        label: 'Concluído',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        icon: CheckCircle,
    },
    FAILED: {
        label: 'Falhou',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800/50',
        icon: XCircle,
    },
};

export default function AvaImporterTemp({ mode = 'admin' }: { mode?: 'admin' | 'user' }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lista de jobs (persistente via DB)
    const [trackedJobs, setTrackedJobs] = useState<ImportJobSummary[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    // Carregar jobs existentes do banco ao montar
    useEffect(() => {
        getMyImportJobs()
            .then((jobs) => {
                setTrackedJobs(jobs.map(j => ({
                    id: j.id,
                    status: j.status as JobStatus,
                    createdAt: new Date(j.createdAt),
                    updatedAt: new Date(j.updatedAt),
                    completedAt: j.completedAt ? new Date(j.completedAt) : null,
                    questionsFound: j.metrics?.found ?? 0,
                    questionsImported: j.metrics?.imported ?? 0,
                })));
            })
            .catch(console.error)
            .finally(() => setIsLoadingJobs(false));
    }, []);

    // Polling dos jobs ativos
    useEffect(() => {
        const activeJobs = trackedJobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING');
        if (activeJobs.length === 0) return;

        const interval = setInterval(async () => {
            const updatedJobs = await Promise.all(
                trackedJobs.map(async (job) => {
                    if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
                    try {
                        const fresh = await getImportJob(job.id);
                        return {
                            ...job,
                            status: fresh.status as JobStatus,
                            updatedAt: fresh.updatedAt,
                            completedAt: fresh.completedAt,
                            questionsFound: fresh.metrics?.found ?? job.questionsFound,
                            questionsImported: fresh.metrics?.imported ?? job.questionsImported,
                        };
                    } catch {
                        return job;
                    }
                })
            );
            setTrackedJobs(updatedJobs);
        }, 5000);

        return () => clearInterval(interval);
    }, [trackedJobs]);

    const handleStartClick = () => {
        if (!login || !password) {
            setError('Por favor, preencha login e senha.');
            return;
        }
        setError(null);
        setShowWarning(true);
    };

    const handleConfirmImport = async () => {
        setShowWarning(false);
        setIsSubmitting(true);
        setError(null);

        try {
            const jobId = await createImportJob(login, password);
            const newJob: ImportJobSummary = {
                id: jobId,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
                completedAt: null,
                questionsFound: 0,
                questionsImported: 0,
            };
            setTrackedJobs(prev => {
                // Evitar duplicatas
                if (prev.some(j => j.id === jobId)) return prev;
                return [newJob, ...prev];
            });
            setLogin('');
            setPassword('');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar job de importação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full font-sans space-y-8">
            {/* Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowWarning(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-500">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                    Funcionalidade em Manutenção
                                </h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    O importador do AVA está passando por melhorias. Ao confirmar, sua solicitação será
                                    adicionada à <span className="font-semibold text-zinc-900 dark:text-zinc-200">fila de processamento</span>.
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                                            O processamento pode levar mais tempo que o habitual.
                                            Acompanhe o status da sua importação na listagem abaixo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-medium transition-colors shadow-lg"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Form Section */}
                    <div className="flex-1 p-8 md:p-12 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Credenciais de Acesso</h2>
                            <p className="text-zinc-500 text-sm mt-1">Utilize seu login do AVA/Moodle.</p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Login (RA ou Email)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ex: 2004567"
                                        value={login}
                                        onChange={e => setLogin(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all font-medium disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                                    Senha
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200 transition-colors">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all font-medium disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center gap-3"
                            >
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </motion.div>
                        )}

                        <button
                            onClick={handleStartClick}
                            disabled={isSubmitting}
                            className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                    Iniciar Sincronização
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Sidebar */}
                    <div className="md:w-[380px] bg-zinc-50 dark:bg-zinc-800/20 border-l border-zinc-200 dark:border-zinc-800/50 p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                Fila em Background
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                Agora o processo acontece no background. Suas credenciais são <span className="font-semibold text-zinc-900 dark:text-zinc-200">criptografadas (AES-256)</span> antes de ir para a fila.
                            </p>

                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-zinc-600 dark:text-zinc-400">Pode fechar a aba!</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-zinc-600 dark:text-zinc-400">Processamento em JobQueue</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Versão Simplificada</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1 leading-relaxed">
                                            O terminal interativo está temporariamente desativado. Acompanhe o status na listagem abaixo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Jobs List */}
            {(trackedJobs.length > 0 || isLoadingJobs) && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${trackedJobs.some(j => j.status === 'PENDING' || j.status === 'PROCESSING') ? 'animate-spin text-blue-500' : 'text-zinc-400'}`} />
                            Status das Importações
                        </h3>
                        <span className="text-xs text-zinc-400 font-medium">
                            {trackedJobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING').length > 0
                                ? 'Atualizando a cada 5s...'
                                : 'Todas finalizadas'
                            }
                        </span>
                    </div>

                    <div className="space-y-3">
                        {isLoadingJobs && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center justify-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                <span className="text-sm text-zinc-400">Carregando histórico...</span>
                            </div>
                        )}
                        {trackedJobs.map((job, index) => {
                            const config = statusConfig[job.status];
                            const StatusIcon = config.icon;
                            const isActive = job.status === 'PENDING' || job.status === 'PROCESSING';

                            return (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white dark:bg-zinc-900 border ${config.border} rounded-xl p-5 shadow-sm`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${config.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${config.color} ${job.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-mono">
                                                    ID: {job.id.substring(0, 8)}... • Criado em {job.createdAt.toLocaleTimeString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pl-14 sm:pl-0">
                                            <div className="text-center">
                                                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Encontradas</p>
                                                <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight">
                                                    {job.questionsFound}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-emerald-500/70 font-semibold uppercase tracking-wider">Importadas</p>
                                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                                                    {job.questionsImported}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                    Ao vivo
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
