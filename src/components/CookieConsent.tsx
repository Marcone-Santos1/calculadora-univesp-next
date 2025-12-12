'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTimes, FaShieldAlt } from 'react-icons/fa';

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show banner after a short delay for better UX
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                            <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-2xl" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Cookies e Privacidade
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Utilizamos cookies essenciais para autenticação e funcionamento da plataforma.
                                Cookies não essenciais são usados apenas para melhorar sua experiência (tema, preferências de visualização).
                                {' '}
                                <Link
                                    href="/politica-de-privacidade"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    Saiba mais
                                </Link>
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                                >
                                    Aceitar Todos
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm"
                                >
                                    Apenas Essenciais
                                </button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDecline}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            aria-label="Fechar"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
