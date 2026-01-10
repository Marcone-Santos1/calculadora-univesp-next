'use client';

import { simularExame, simularRegular } from '@/utils/functions';
import { FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

export const ScenarioMatrix = ({ showResult }: { showResult: boolean }) => {
    // Notas de AVA simuladas (de 10 a 0)
    const avaScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    return (
        <>
            {showResult && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                🔮 Cenários de Aprovação
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Quanto você precisa tirar na <strong>Prova</strong> com base na sua nota do <strong>AVA</strong>.
                            </p>
                        </div>

                        {/* Legenda Rápida */}
                        <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Fácil</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Médio</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Difícil</span>
                        </div>
                    </div>

                    {/* Grid Responsivo: 2 colunas no celular, até 6 no PC */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                        {avaScores.map((ava) => {
                            const needed = simularRegular({ g1: ava, g2: 0 });
                            const neededExam = simularExame({ g1: ava, g2: 0 });

                            const isEasy = needed <= 4;
                            const isHard = needed > 6.5;
                            const isImpossible = needed > 10;

                            const containerClass = isImpossible
                                ? 'opacity-50 grayscale' // Se for impossível, apaga um pouco
                                : isEasy
                                    ? 'bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-900/10 dark:border-green-800 dark:hover:border-green-700'
                                    : isHard
                                        ? 'bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-900/10 dark:border-red-800 dark:hover:border-red-700'
                                        : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-900/10 dark:border-yellow-800 dark:hover:border-yellow-700';

                            const textClass = isEasy
                                ? 'text-green-700 dark:text-green-400'
                                : isHard
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-yellow-700 dark:text-yellow-400';

                            const Icon = isEasy ? FaCheckCircle : isHard ? FaTimesCircle : FaExclamationTriangle;

                            return (
                                <div
                                    key={ava}
                                    className={`
                relative group flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${containerClass}
              `}
                                >
                                    {/* Cabeçalho do Card: Nota AVA */}
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Nota AVA</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{ava}</span>
                                    </div>

                                    {/* Corpo: Seta e Resultado */}
                                    <div className="flex items-center justify-between mb-2">
                                        <FaArrowRight className="text-gray-300 text-xs" />

                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Prova</span>
                                            <div className={`text-xl font-black leading-none ${textClass}`}>
                                                {needed > 10 ? '>10' : needed.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cabeçalho do Card: Nota AVA */}
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Média final</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{ava}</span>
                                    </div>

                                    {/* Corpo: Seta e Resultado */}
                                    <div className="flex items-center justify-between">
                                        <FaArrowRight className="text-gray-300 text-xs" />

                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Exame</span>
                                            <div className={`text-xl font-black leading-none ${textClass}`}>
                                                {neededExam > 10 ? '>10' : neededExam.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ícone de Fundo (Decorativo) */}
                                    <Icon className={`absolute -bottom-1 -left-1 text-4xl opacity-5 pointer-events-none ${textClass}`} />
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-[10px] text-gray-400 mt-4">
                        *Cálculo baseado no peso padrão (50% Prova / 50% AVA) e média 5.0
                    </p>
                </div>
            )}

        </>
    );
};