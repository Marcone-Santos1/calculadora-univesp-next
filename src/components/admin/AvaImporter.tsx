'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
    Play, Terminal, CheckCircle, AlertTriangle,
    Info, Loader2, Hourglass, Lock,
    Check, ArrowLeft, Trophy, Box, Key, User, ShieldCheck, Activity
} from 'lucide-react';
import { createQuestion } from '@/actions/question-actions';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { getSubjectByName } from '@/actions/subject-actions';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Configuração de Ambiente
const MICROSERVICE_URL = process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3033';
const API_KEY = process.env.NEXT_PUBLIC_SCRAPER_API_KEY || process.env.NEXT_PUBLIC_SCAPER_API_KEY || '';

// Tipos
interface LogMessage {
    id: string;
    time: string;
    msg: string;
    type: 'info' | 'success' | 'error' | 'warning' | 'question' | 'queue';
}

interface Metrics {
    found: number;
    imported: number;
    skipped: number;
    xp: number;
}

export default function AvaImporter() {
    const [appState, setAppState] = useState<'idle' | 'running' | 'done'>('idle');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    // Estado de Logs e Métricas
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [statusText, setStatusText] = useState('Pronto para iniciar');
    const [metrics, setMetrics] = useState<Metrics>({ found: 0, imported: 0, skipped: 0, xp: 0 });

    // Referências de Controle
    const ctrlRef = useRef<AbortController | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll do terminal
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Cleanup ao desmontar o componente
    useEffect(() => {
        return () => {
            if (ctrlRef.current) ctrlRef.current.abort();
        };
    }, []);

    // Efeito de Confete ao finalizar
    useEffect(() => {
        if (appState === 'done') {
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [appState]);

    const addLog = (msg: string, type: LogMessage['type'] = 'info') => {
        const time = new Date().toLocaleTimeString('pt-BR');
        const id = Math.random().toString(36).substr(2, 9);
        setLogs(prev => [...prev, { id, time, msg, type }]);
    };

    const handleStartImport = async () => {
        if (!login || !password) return alert("Por favor, preencha login e senha.");

        setAppState('running');
        setLogs([]);
        setMetrics({ found: 0, imported: 0, skipped: 0, xp: 0 });
        setStatusText('Estabelecendo conexão segura...');
        addLog('Iniciando handshake criptografado...', 'info');

        const ctrl = new AbortController();
        ctrlRef.current = ctrl;

        try {
            console.log('Iniciando handshake criptografado...');
            console.log('MICROSERVICE_URL', `${MICROSERVICE_URL}/scrape-stream`);
            console.log('API_KEY', API_KEY);
            console.log('login', login);
            console.log('password', password);
            await fetchEventSource(`${MICROSERVICE_URL}/scrape-stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify({ email: login, password }),
                signal: ctrl.signal,

                async onopen(response) {
                    if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
                        addLog('Túnel TLS estabelecido com sucesso.', 'success');
                        return;
                    }
                    if (response.status === 401) {
                        throw new Error("Chave de API não autorizada.");
                    }
                    if (response.status === 400) {
                        throw new Error("Requisição inválida (400). Verifique suas credenciais.");
                    }
                    throw new Error(`Erro no servidor remoto: ${response.status}`);
                },

                onmessage(msg) {
                    if (msg.event === 'keepalive') return;

                    try {
                        const data = JSON.parse(msg.data);

                        switch (msg.event) {
                            case 'status':
                                setStatusText(data.message);
                                if (data.step === 'QUEUED') {
                                    addLog(data.message.toUpperCase(), 'queue');
                                } else {
                                    addLog(data.message, 'info');
                                }
                                break;

                            case 'question':
                                setMetrics(prev => ({ ...prev, found: prev.found + 1 }));
                                addLog(`Questão ID ${data.id?.substring(0, 8) || '?'} capturada`, 'question');
                                handleSaveQuestion(data);
                                break;

                            case 'error':
                                addLog(`ERRO REMOTO: ${data.message}`, 'error');
                                setStatusText('Falha na execução');
                                break;

                            case 'done':
                                addLog(`Processo finalizado. Total: ${data.total}`, 'success');
                                setStatusText('Sincronização Concluída');
                                ctrl.abort();
                                // Delay para experiência de usuário (ver ultimo log)
                                setTimeout(() => {
                                    setAppState('done');
                                }, 1500);
                                break;
                        }
                    } catch (err) {
                        console.error("Erro ao processar mensagem SSE:", err);
                    }
                },

                onerror(err) {
                    if ((err as any).name === 'AbortError') return;
                    console.error("Erro na stream:", err);
                    addLog(`Conexão interrompida: ${err.message}`, 'error');
                    setStatusText('Conexão perdida');
                    throw err;
                }
            });

        } catch (err: any) {
            if (ctrl.signal.aborted) return;
            addLog(`Falha crítica: ${err.message}`, 'error');
            // Não volta pro idle automaticamente para o usuário ver o erro
            // setAppState('idle'); 
        }
    };

    const handleSaveQuestion = async (rawData: any) => {

        try {
            const formData = new FormData();
            formData.append('title', `#${rawData.title}` || '#Sem título');

            if (rawData.images) {
                rawData.text += '\n\nImagens:\n';
                rawData.images.forEach((image: any) => {
                    if (image.startsWith('http')) {
                        rawData.text += `\n\n- ![image](${image})`;
                    }
                });
            }

            const subject = await getSubjectByName(rawData.subjectName);
            if (!subject) {
                addLog('⚠️ Matéria não encontrada', 'warning');
                return;
            }

            formData.append('text', rawData.text || rawData.description || '');
            formData.append('subjectId', subject.id);
            formData.append('week', '');
            formData.append('alternatives', JSON.stringify(rawData.alternatives || []));
            formData.append('isValidated', 'isValidated');

            await createQuestion(formData);

            setMetrics(prev => ({ ...prev, imported: prev.imported + 1, xp: prev.xp + 10 }));
            addLog('✅ Persistido no banco de dados', 'success');
        } catch (err: any) {
            setMetrics(prev => ({ ...prev, skipped: prev.skipped + 1 }));
            if (err.message?.includes('exist')) {
                addLog('⚠️ Ignorada (Duplicada)', 'warning');
            } else {
                addLog('❌ Falha na persistência', 'error');
            }
        }
    };

    const handleReset = () => {
        setAppState('idle');
        setLogin('');
        setPassword('');
    };

    return (
        <div className="w-full font-sans">

            <AnimatePresence mode="wait">
                {/* STATE: IDLE */}
                {appState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
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
                                                className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all font-medium"
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
                                                className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartImport}
                                    className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                    Iniciar Sincronização
                                </button>
                            </div>

                            {/* Info Sidebar */}
                            <div className="md:w-[380px] bg-zinc-50 dark:bg-zinc-800/20 border-l border-zinc-200 dark:border-zinc-800/50 p-8 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        Segurança Garantida
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                        Suas credenciais são enviadas via <span className="font-semibold text-zinc-900 dark:text-zinc-200">TLS 1.3</span> e processadas em memória volátil. Nada é salvo em disco.
                                    </p>

                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-zinc-600 dark:text-zinc-400">Criptografia E2E</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-zinc-600 dark:text-zinc-400">Zero Persistência</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-500">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recompensa</p>
                                            <p className="font-bold text-zinc-800 dark:text-white">+10 XP <span className="font-normal text-zinc-500 text-sm">por questão</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STATE: RUNNING */}
                {appState === 'running' && (
                    <motion.div
                        key="running"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Status Header */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-sm gap-6">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-shrink-0">
                                    {statusText.includes('fila') ? (
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                            <Hourglass className="w-6 h-6 text-amber-500 animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="relative p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl overflow-hidden">
                                            <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 animate-pulse"></div>
                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400 relative z-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-0.5 flex items-center gap-2">
                                        <Activity className="w-3 h-3" />
                                        Status em Tempo Real
                                    </span>
                                    <span className="font-medium text-lg text-zinc-800 dark:text-zinc-200 truncate pr-4">
                                        {statusText}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-8 justify-around md:justify-end">
                                <div className="flex flex-col items-center md:items-end">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Encontradas</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{metrics.found}</span>
                                        <span className="text-xs text-zinc-400 font-medium">un</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center md:items-end">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 text-emerald-600/70 dark:text-emerald-400/70">Importadas</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{metrics.imported}</span>
                                        <span className="text-xs text-emerald-600/50 dark:text-emerald-400/50 font-medium">un</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modern Terminal Window */}
                        <div className="bg-[#0f1115] rounded-2xl border border-zinc-800/50 shadow-2xl flex flex-col h-[500px] md:h-[600px] overflow-hidden relative font-mono text-sm group">

                            {/* Window Controls */}
                            <div className="bg-[#14161b] px-4 py-3 flex items-center justify-between border-b border-zinc-800/50 select-none sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2 mr-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/30"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/30"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/30"></div>
                                    </div>
                                    <span className="text-zinc-500 text-xs hidden sm:inline-block font-medium opacity-60">root@ava-bot:~/tasks</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600 text-xs bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
                                    <Lock size={10} />
                                    <span>TLS Encrypted</span>
                                </div>
                            </div>

                            {/* Logs Area with custom styling */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex gap-3 px-2 py-0.5 rounded hover:bg-white/[0.03] transition-colors duration-75">
                                        <span className="text-zinc-600 select-none shrink-0 w-[70px] text-right text-xs pt-[2px] opacity-60">
                                            {log.time.split(' ')[0]}
                                        </span>
                                        <span className="text-zinc-700 select-none shrink-0 opacity-40">│</span>
                                        <span className={cn(
                                            "break-all leading-snug tracking-wide",
                                            log.type === 'info' && "text-zinc-400",
                                            log.type === 'success' && "text-emerald-400",
                                            log.type === 'error' && "text-red-400 font-bold bg-red-900/10 px-1 rounded",
                                            log.type === 'warning' && "text-amber-400",
                                            log.type === 'queue' && "text-yellow-300 font-bold",
                                            log.type === 'question' && "text-blue-400"
                                        )}>
                                            {log.type === 'queue' && <span className="mr-2">🚦</span>}
                                            {log.type === 'error' && <span className="mr-2">❌</span>}
                                            {log.type === 'success' && <span className="mr-2">✨</span>}
                                            {log.type === 'question' && <span className="mr-2">📦</span>}
                                            {log.msg}
                                        </span>
                                    </div>
                                ))}
                                {/* Cursor Effect */}
                                <div className="flex gap-3 px-2 pt-1 opacity-70" ref={terminalEndRef}>
                                    <span className="w-[70px]"></span>
                                    <span className="w-[2px]"></span>
                                    <span className="w-2.5 h-5 bg-zinc-500 animate-pulse block"></span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STATE: DONE */}
                {appState === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="max-w-2xl mx-auto mt-8"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
                            <div className="bg-zinc-900 p-12 text-center relative overflow-hidden">
                                {/* Textura de Ruído e Efeitos */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 border-4 border-zinc-800">
                                        <Check className="w-12 h-12 text-white" strokeWidth={4} />
                                    </div>
                                    <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Missão Cumprida</h2>
                                    <p className="text-zinc-400 text-lg max-w-sm mx-auto">
                                        O robô concluiu a varredura com sucesso. Suas atividades estão sincronizadas.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800/50">
                                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Novas Atividades</div>
                                        <div className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{metrics.imported}</div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl text-center border border-amber-100 dark:border-amber-900/30">
                                        <div className="text-xs text-amber-600/70 uppercase font-bold tracking-wider mb-2">XP Adquirido</div>
                                        <div className="text-4xl font-extrabold text-amber-500 tracking-tight">+{metrics.xp}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="w-full py-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-300 font-bold transition-all flex items-center justify-center gap-2 group hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    Voltar ao Início
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}