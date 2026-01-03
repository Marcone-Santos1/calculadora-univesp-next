'use client';

import { useState, useEffect } from 'react';
import { createSystemAnnouncement } from '@/actions/admin-actions';
import { FaBullhorn, FaEnvelope, FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaEye, FaCode, FaMobileAlt, FaDesktop, FaMagic, FaChevronDown, FaLayerGroup, FaHandSparkles, FaFileAlt } from 'react-icons/fa';
import { BaseEmailTemplate, PredefinedTemplates, EmailComponents, renderEmailBlocks, EmailBlock } from '@/lib/email-templates';
import { EmailBuilder } from '@/components/admin/EmailBuilder';

export default function AdminAnnouncementsPage() {
    const [type, setType] = useState<'INFO' | 'WARNING' | 'IMPORTANT'>('INFO');
    const [channels, setChannels] = useState<string[]>(['IN_APP']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<EmailBlock[]>([]);
    const [inAppMessage, setInAppMessage] = useState(''); // Separate message for in-app notification text
    const [previewDevice, setPreviewDevice] = useState<'MOBILE' | 'DESKTOP'>('DESKTOP');
    const [selectedTemplate, setSelectedTemplate] = useState('CUSTOM');

    // Preview
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        // Generate real-time preview
        if (channels.includes('EMAIL')) {
            // Render blocks to HTML
            const bodyHtml = renderEmailBlocks(blocks);
            // Wrap in base template
            const fullHtml = BaseEmailTemplate(bodyHtml || '<div style="text-align:center; padding: 40px 20px; color:#9ca3af; font-family: sans-serif;">Comece a adicionar blocos para construir seu email.</div>', title);
            setPreviewHtml(fullHtml);
        }
    }, [title, blocks, channels]);

    const handleTemplateChange = (key: string) => {
        setSelectedTemplate(key);
        if (key === 'CUSTOM') {
            setBlocks([]);
            return;
        }

        const template = PredefinedTemplates[key as keyof typeof PredefinedTemplates];
        if (template) {
            setTitle(template.subject);
            setInAppMessage(template.subject);

            // Populate blocks based on template type
            const newBlocks: EmailBlock[] = [];
            const generateId = () => crypto.randomUUID();

            if (key === 'ANNOUNCEMENT') {
                newBlocks.push(
                    { id: generateId(), type: 'HEADING', content: 'Olá, estudante!', align: 'left', color: '#1e3a8a' },
                    { id: generateId(), type: 'TEXT', content: 'Escreva aqui o conteúdo do seu aviso para todos os usuários.', align: 'left', color: '#374151' },
                    { id: generateId(), type: 'BUTTON', label: 'Acessar Plataforma', url: 'https://calculadoraunivesp.com.br', bgColor: '#2563eb', txtColor: '#ffffff', align: 'left' }
                );
            } else if (key === 'WELCOME') {
                newBlocks.push(
                    { id: generateId(), type: 'HEADING', content: 'Olá, estudante!', align: 'left', color: '#1e3a8a' },
                    { id: generateId(), type: 'TEXT', content: 'Estamos muito felizes em ter você aqui. A Calculadora Univesp foi criada para ajudar você a organizar sua jornada acadêmica.', align: 'left', color: '#374151' },
                    { id: generateId(), type: 'TEXT', content: '💡 Dica: Comece adicionando suas notas para ver sua média calculada automaticamente.', align: 'left', color: '#1e40af' }, // Simulating HighlightBox with blue text
                    { id: generateId(), type: 'BUTTON', label: 'Começar Agora', url: 'https://calculadoraunivesp.com.br', bgColor: '#2563eb', txtColor: '#ffffff', align: 'left' }
                );
            } else if (key === 'WARNING') {
                newBlocks.push(
                    { id: generateId(), type: 'HEADING', content: 'Atenção', align: 'left', color: '#1e3a8a' },
                    { id: generateId(), type: 'TEXT', content: 'Detectamos uma atividade que viola nossos termos de uso:', align: 'left', color: '#374151' },
                    { id: generateId(), type: 'TEXT', content: '⚠️ [Motivo da moderação aqui]', align: 'left', color: '#b91c1c' },
                    { id: generateId(), type: 'TEXT', content: 'Por favor, revise nossas diretrizes para evitar restrições em sua conta.', align: 'left', color: '#374151' },
                    { id: generateId(), type: 'BUTTON', label: 'Ler Diretrizes', url: 'https://calculadoraunivesp.com.br/termos', bgColor: '#dc2626', txtColor: '#ffffff', align: 'left' }
                );
            }

            setBlocks(newBlocks);
        }
    };

    const toggleChannel = (channel: string) => {
        if (channels.includes(channel)) {
            setChannels(channels.filter(c => c !== channel));
        } else {
            setChannels([...channels, channel]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        try {
            if (channels.length === 0) {
                throw new Error("Selecione pelo menos um canal de envio.");
            }

            if (channels.includes('EMAIL') && blocks.length === 0) {
                throw new Error("Adicione pelo menos um bloco de conteúdo para o email.");
            }

            if (channels.includes('IN_APP') && !inAppMessage) {
                throw new Error("Digite a mensagem curta para a notificação interna.");
            }

            const emailHtml = renderEmailBlocks(blocks);
            console.log(type);
            const res = await createSystemAnnouncement({
                title,
                message: inAppMessage || 'Verifique seu email para mais detalhes.',
                htmlMessage: emailHtml,
                type,
                channels
            });

            if (res.success) {
                setResult({ success: true, message: 'Comunicado disparado com sucesso!' });
                setTitle('');
                setInAppMessage('');
                setBlocks([]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Erro ao enviar: ' + error });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 md:p-8">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Comunicados Globais</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Central de transmissão de mensagens em massa.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Sistema Operacional
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left Column: Configuration & Content (5 Cols) */}
                <div className="xl:col-span-5 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Status Feedback */}
                        {result && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-fade-in ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                                <div className={`p-2 rounded-full ${result.success ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-red-100 dark:bg-red-800'}`}>
                                    {result.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                </div>
                                <span className="font-medium">{result.message}</span>
                            </div>
                        )}

                        {/* Step 1: Configuration Card */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all hover:border-gray-300 dark:hover:border-zinc-700 group">
                            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-wider">
                                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px]">1</span>
                                Configuração do Disparo
                            </div>

                            <div className="space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nível de Importância</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'INFO', label: 'Informativo', icon: FaInfoCircle, color: 'blue' },
                                            { id: 'WARNING', label: 'Importante', icon: FaExclamationTriangle, color: 'orange' },
                                            { id: 'IMPORTANT', label: 'Urgente', icon: FaBell, color: 'red' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id as any)}
                                                className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200 ${type === t.id
                                                    // Active Styles
                                                    ? t.color === 'blue' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                        : t.color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                                            : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    // Inactive Styles
                                                    : 'bg-white dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-500 dark:text-gray-400'
                                                    }`}
                                            >
                                                <t.icon className={`text-xl ${type === t.id ? 'scale-110' : 'opacity-70'} transition-transform`} />
                                                <span className="text-xs font-bold">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Channels */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Canais de Entrega</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`relative cursor-pointer group p-4 rounded-xl border-2 transition-all duration-300 ${channels.includes('IN_APP')
                                            ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/10 dark:border-purple-500'
                                            : 'bg-white dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700'}`}>
                                            <input type="checkbox" className="hidden" checked={channels.includes('IN_APP')} onChange={() => toggleChannel('IN_APP')} />
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${channels.includes('IN_APP') ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'}`}>
                                                    <FaBell />
                                                </div>
                                                <div>
                                                    <div className={`font-bold transition-colors ${channels.includes('IN_APP') ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>Notificação App</div>
                                                    <div className="text-xs text-gray-400">Entrega instantânea no sininho</div>
                                                </div>
                                            </div>
                                            {channels.includes('IN_APP') && <div className="absolute top-2 right-2 text-purple-500"><FaCheckCircle /></div>}
                                        </label>

                                        <label className={`relative cursor-pointer group p-4 rounded-xl border-2 transition-all duration-300 ${channels.includes('EMAIL')
                                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/10 dark:border-blue-500'
                                            : 'bg-white dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700'}`}>
                                            <input type="checkbox" className="hidden" checked={channels.includes('EMAIL')} onChange={() => toggleChannel('EMAIL')} />
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${channels.includes('EMAIL') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'}`}>
                                                    <FaEnvelope />
                                                </div>
                                                <div>
                                                    <div className={`font-bold transition-colors ${channels.includes('EMAIL') ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Email Broadcast</div>
                                                    <div className="text-xs text-gray-400">Newsletter HTML rica</div>
                                                </div>
                                            </div>
                                            {channels.includes('EMAIL') && <div className="absolute top-2 right-2 text-blue-500"><FaCheckCircle /></div>}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Content Card */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-wider">
                                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px]">2</span>
                                Conteúdo da Mensagem
                            </div>

                            <div className="space-y-6">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Título Principal</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none font-medium text-lg placeholder-gray-400"
                                        placeholder="Digite um título chamativo..."
                                    />
                                </div>

                                {/* Template Quick Load */}
                                {channels.includes('EMAIL') && (
                                    <div className="relative z-30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <FaMagic className="text-xs" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modelo de Email</label>
                                            </div>
                                        </div>

                                        <TemplateSelector
                                            value={selectedTemplate}
                                            onChange={handleTemplateChange}
                                        />
                                    </div>
                                )}

                                {/* In-App Message Editor */}
                                {channels.includes('IN_APP') && (
                                    <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mensagem Curta (App)</label>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold">OBRIGATÓRIO</span>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                value={inAppMessage}
                                                onChange={(e) => setInAppMessage(e.target.value)}
                                                rows={3}
                                                maxLength={250}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none resize-none"
                                                placeholder="Esta mensagem aparecerá na central de notificações do usuário..."
                                            />
                                            <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-mono">
                                                {inAppMessage.length}/250
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email Builder UI */}
                                {channels.includes('EMAIL') && (
                                    <div className="animate-in slide-in-from-top-4 fade-in duration-300 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                                    <FaCode className="text-sm" />
                                                </div>
                                                Email Builder
                                                <span className="text-xs font-normal text-gray-500 ml-2 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Drag & Drop</span>
                                            </label>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-zinc-950/50 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-inner">
                                            <EmailBuilder blocks={blocks} onChange={setBlocks} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="sticky bottom-6 z-20">
                            <button
                                type="submit"
                                disabled={isSubmitting || channels.length === 0}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="relative flex items-center gap-2 text-lg">
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Enviando Transmissão...
                                        </>
                                    ) : (
                                        <>
                                            <FaBullhorn className="animate-pulse" /> Disparar Comunicado Global
                                        </>
                                    )}
                                </div>
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Esta ação enviará mensagens para {channels.length > 0 ? 'todos os usuários ativos' : 'ninguém'}.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Column: Preview (7 Cols) */}
                <div className="xl:col-span-7 pl-6 hidden xl:block">
                    <div className="sticky top-8">
                        {/* Device Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaEye className="text-blue-500" /> Preview em Tempo Real
                            </h3>
                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700 flex gap-1">
                                <button
                                    onClick={() => setPreviewDevice('DESKTOP')}
                                    className={`p-2 rounded transition-all ${previewDevice === 'DESKTOP' ? 'bg-gray-100 dark:bg-zinc-700 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <FaDesktop />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('MOBILE')}
                                    className={`p-2 rounded transition-all ${previewDevice === 'MOBILE' ? 'bg-gray-100 dark:bg-zinc-700 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <FaMobileAlt />
                                </button>
                            </div>
                        </div>

                        {/* Device Frame */}
                        {channels.includes('EMAIL') ? (
                            <div className={`transition-all duration-500 ease-in-out mx-auto ${previewDevice === 'MOBILE' ? 'w-[375px]' : 'w-full'}`}>
                                <div className="bg-gray-800 rounded-[2rem] p-3 shadow-2xl border-4 border-gray-900 overflow-hidden relative">
                                    {/* Mock Browser Header (only for Desktop) */}
                                    {previewDevice === 'DESKTOP' && (
                                        <div className="bg-gray-800 h-8 flex items-center gap-2 px-4 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                            <div className="bg-gray-900 rounded-md h-5 px-3 flex items-center text-[10px] text-gray-500 ml-4 flex-1 font-mono">
                                                https://email-view.univesp.br/preview
                                            </div>
                                        </div>
                                    )}

                                    {/* Mock Notch (only for Mobile) */}
                                    {previewDevice === 'MOBILE' && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                                    )}

                                    <div className="bg-white rounded-xl overflow-hidden relative aspect-[9/16] md:aspect-auto md:h-[calc(100vh-200px)]">
                                        <iframe
                                            srcDoc={previewHtml}
                                            className="w-full h-full border-none"
                                            title="Email Preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-[600px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 p-12 text-center opacity-75">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <FaEnvelope className="text-4xl opacity-20" />
                                </div>
                                <h4 className="text-xl font-bold mb-2 text-gray-500">Preview Indisponível</h4>
                                <p className="max-w-xs">Selecione o canal "Email Broadcast" para habilitar o editor visual e o preview.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

function TemplateSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: 'CUSTOM', label: 'Configurar Manualmente', desc: 'Começar do zero', icon: FaLayerGroup, color: 'text-gray-500' },
        { value: 'ANNOUNCEMENT', label: 'Aviso Geral', desc: 'Template simples para comunicados', icon: FaBullhorn, color: 'text-blue-500' },
        { value: 'WELCOME', label: 'Boas-vindas', desc: 'Email de recepção para novos usuários', icon: FaHandSparkles, color: 'text-yellow-500' },
        { value: 'WARNING', label: 'Alerta Importante', desc: 'Avisos de moderação ou urgentes', icon: FaExclamationTriangle, color: 'text-orange-500' },
    ];

    const selected = options.find(o => o.value === value) || options[0];

    return (
        <div className="relative">
            {/* Backdrop to close */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative z-50 w-full flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border transition-all rounded-xl text-left group
                    ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-700/50 flex items-center justify-center ${selected.color} group-hover:scale-105 transition-transform`}>
                        <selected.icon />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{selected.label}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{selected.desc}</div>
                    </div>
                </div>
                <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="max-h-[300px] overflow-y-auto p-1 space-y-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left
                                    ${value === opt.value
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    }
                                `}
                            >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${opt.color} ${value === opt.value ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-50 dark:bg-zinc-700'}`}>
                                    <opt.icon className="text-sm" />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${value === opt.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {opt.label}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {opt.desc}
                                    </div>
                                </div>
                                {value === opt.value && <FaCheckCircle className="ml-auto text-indigo-500 text-sm" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-center text-gray-400">
                        Selecione um modelo para carregar a estrutura inicial
                    </div>
                </div>
            )}
        </div>
    );
}
