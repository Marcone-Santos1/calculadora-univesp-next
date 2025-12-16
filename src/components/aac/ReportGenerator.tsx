"use client";

import { ActivityData } from "@/actions/aac-actions";
import { useState } from "react";
import { FaFileAlt, FaCopy, FaTimes } from "react-icons/fa";

type Props = {
    activities: ActivityData[];
    userName?: string | null;
    userEmail?: string | null;
};

export function ReportGenerator({ activities, userName, userEmail }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [reportText, setReportText] = useState("");

    const generateReport = () => {
        // Calculate Totals
        const totalValid = activities.reduce((acc, curr) => acc + curr.validHours, 0);

        // Build Text
        const header = `RELATÓRIO DE ATIVIDADES ACADÊMICO-CIENTÍFICO-CULTURAIS (AAC)\n\n` +
            `ALUNO: ${userName || "Nome do Aluno"}\n` +
            `EMAIL: ${userEmail || ""}\n` +
            `DATA: ${new Date().toLocaleDateString()}\n\n` +
            `--------------------------------------------------------------------------------\n\n`;

        const intro = `1. INTRODUÇÃO\n\n` +
            `O presente relatório tem como objetivo descrever as atividades realizadas para cumprimento da carga horária de AAC exigida pelo curso. As atividades foram selecionadas visando o aprimoramento profissional e acadêmico.\n\n`;

        let body = `2. DETALHAMENTO DAS ATIVIDADES\n\n`;

        activities.forEach((activity, index) => {
            body += `ATIVIDADE ${index + 1}: ${activity.title}\n`;
            body += `Categoria: ${activity.category}\n`;
            body += `Instituição: ${activity.institution || "N/A"}\n`;
            body += `Carga Horária Original: ${activity.originalHours}h | Computada: ${activity.validHours}h\n`;
            body += `Período: ${activity.startDate ? new Date(activity.startDate).toLocaleDateString() : "Data não informada"}\n`;
            body += `Descrição do Aprendizado: ${activity.description || "Sem descrição."}\n\n`;
            body += `-----------------------------------------------\n\n`;
        });

        const summaryTable = `3. QUADRO RESUMO\n\n` +
            `ATVIDADE | HORAS VÁLIDAS\n` +
            activities.map(a => `${a.title.padEnd(50).substring(0, 50)} | ${a.validHours}h`).join('\n') +
            `\n\nTOTAL DE HORAS COMPUTADAS: ${totalValid}h\n\n`;

        const conclusion = `4. CONCLUSÃO\n\n` +
            `Declaro serem verdadeiras as informações prestadas e estar ciente das normas da instituição referente ao aproveitamento de AAC.`;

        setReportText(header + intro + body + summaryTable + conclusion);
        setIsOpen(true);
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(reportText);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <>
            <button
                onClick={generateReport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
            >
                <FaFileAlt /> Gerar Relatório
            </button>

            {/* Success Toast / Small Modal */}
            {showSuccess && (
                <div className="fixed top-20 right-4 z-[60] bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-slideIn">
                    <FaCopy className="text-xl" />
                    <div>
                        <p className="font-bold">Copiado!</p>
                        <p className="text-sm">Texto pronto para colar.</p>
                    </div>
                </div>
            )}

            {isOpen && (
                // ... Existing Modal content ...
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaFileAlt className="text-green-600" /> Prévia do Relatório
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-sm text-gray-500 mb-2">Copie o texto abaixo e cole no seu editor de texto (Word/Docs).</p>
                            <textarea
                                className="w-full h-full min-h-[400px] p-4 font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                value={reportText}
                                readOnly
                            />
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-2xl">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
                            >
                                <FaCopy /> Copiar Texto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
