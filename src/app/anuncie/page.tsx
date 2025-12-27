
import React from 'react';
import Link from 'next/link';
import { FaBullhorn, FaChartLine, FaUsers, FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import NativeAdCard from '@/components/feed/NativeAdCard';

export default function AdvertisePage() {
    const stats = [
        { label: 'Visualizações Mensais', value: '+50k', icon: <FaUsers className="w-6 h-6 text-blue-500" /> },
        { label: 'Taxa de Clinton (CTR)', value: '3.5%', icon: <FaChartLine className="w-6 h-6 text-green-500" /> },
        { label: 'Universitários', value: '+10k', icon: <FaBullhorn className="w-6 h-6 text-purple-500" /> },
    ];

    // Mock Ad for Preview
    const previewAd = {
        id: 'preview',
        headline: 'Conquiste sua Vaga na Residência Médica',
        description: 'Prepare-se com quem mais aprova no país. Curso extensivo com mentoria personalizada.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80',
        destinationUrl: '#',
        advertiserName: 'MedCurso Top',
        campaignId: 'preview-camp',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                        Para Empresas & Instituições
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                        Atinga milhares de <br />estudantes universitários
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        A plataforma de estudos da Univesp é o lugar onde os futuros profissionais do Brasil passam horas do dia.
                        Conecte sua marca diretamente com quem constrói o futuro.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="https://wa.me/5511964248721"
                            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-green-500/30"
                        >
                            <FaWhatsapp /> Falar com Consultor
                        </Link>
                        <Link
                            href="/advertiser/dashboard"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm"
                        >
                            Começar Agora (Self-Service) <FaArrowRight className="text-sm" />
                        </Link>
                    </div>
                </div>

                {/* Abstract shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                Anúncios que não parecem anúncios.
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 relaxed">
                                Nossos <strong>Native Ads</strong> se misturam organicamente ao conteúdo de estudos, garantindo maior aceitação e engajamento.
                                Ao contrário de banners intrusivos, seu conteúdo aparece como uma recomendação relevante.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Formato não intrusivo",
                                    "Segmentação contextual",
                                    "Dashboard em tempo real",
                                    "Pagamento via PIX (AbacatePay)"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">
                                            <FaArrowRight />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl relative">
                                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-sm transform rotate-3 shadow-lg">
                                    Preview Ao Vivo
                                </div>
                                <div className="space-y-4 pointer-events-none select-none opacity-50 blur-[1px]">
                                    {/* Fake Content for context */}
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                                </div>

                                <div className="my-6 scale-100 transform transition hover:scale-105 duration-300">
                                    <NativeAdCard ad={previewAd} />
                                </div>

                                <div className="space-y-4 pointer-events-none select-none opacity-50 blur-[1px]">
                                    <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-4">Simulação de visualização no feed de questões</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="bg-gray-900 text-white py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Pronto para crescer sua marca?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-10">
                        Crie sua conta, faça um depósito via PIX e comece a rodar seus anúncios em menos de 5 minutos.
                    </p>
                    <Link
                        href="/advertiser/dashboard"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-900/50"
                    >
                        Criar Conta de Anunciante
                    </Link>
                </div>
            </section>

        </div>
    );
}
