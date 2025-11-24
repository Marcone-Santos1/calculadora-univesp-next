'use client';

import React, { useState } from 'react';
import { createQuestion } from '@/actions/question-actions';
import { FaImage } from 'react-icons/fa';

interface Subject {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
}

export const QuestionForm: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {
    const [alternatives, setAlternatives] = useState([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ]);

    const handleAlternativeChange = (index: number, value: string) => {
        const newAlternatives = [...alternatives];
        newAlternatives[index].text = value;
        setAlternatives(newAlternatives);
    };

    return (
        <form action={createQuestion} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matéria
                </label>
                <select
                    name="subjectId"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Selecione uma matéria</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semana / Atividade
                </label>
                <input
                    type="text"
                    name="week"
                    placeholder="Ex: Semana 3, Avaliação 1"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Pergunta
                </label>
                <input
                    type="text"
                    name="title"
                    placeholder="Resumo da dúvida..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detalhes da Questão
                </label>
                <textarea
                    name="text"
                    rows={6}
                    placeholder="Cole o texto da questão aqui. Suporta Markdown básico."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alternativas</h3>
                <input type="hidden" name="alternatives" value={JSON.stringify(alternatives)} />
                <div className="space-y-3">
                    {alternatives.map((alt, index) => (
                        <div key={alt.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center font-bold bg-gray-100 dark:bg-gray-700 rounded-full">
                                {alt.id}
                            </div>
                            <input
                                type="text"
                                value={alt.text}
                                onChange={(e) => handleAlternativeChange(index, e.target.value)}
                                placeholder={`Alternativa ${alt.id}`}
                                className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
                Publicar Pergunta
            </button>
        </form>
    );
};
