"use client";

import { ActivityData } from "@/actions/aac-actions";
import { FaCalendarAlt, FaClock, FaUniversity, FaTag, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { AacCategory } from "@prisma/client";

type Props = {
    activity: ActivityData;
    onClose: () => void;
    onEdit: (activity: ActivityData) => void;
    onDelete?: (id: string) => void;
};

const categoryLabels: Record<AacCategory, string> = {
    [AacCategory.COURSE]: "Curso/Certificado",
    [AacCategory.CULTURAL]: "Cultural",
    [AacCategory.EXPERIENCE]: "Vivência Profissional",
    [AacCategory.INTERNSHIP]: "Estágio",
    [AacCategory.OTHER]: "Outros"
};

export function ActivityDetailsModal({ activity, onClose, onEdit, onDelete }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-2">
                            {categoryLabels[activity.category as AacCategory] || activity.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight pr-4">
                            {activity.title}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaClock /> Horas Originais</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">{activity.originalHours}h</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1"><FaClock /> Horas Computadas</p>
                            <p className="font-semibold text-green-700 dark:text-green-300 text-lg">{activity.validHours}h</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {activity.institution && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FaUniversity className="text-gray-400" />
                                <span className="font-medium">{activity.institution}</span>
                            </div>
                        )}
                        {activity.startDate && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>{new Date(activity.startDate).toLocaleDateString()}</span>
                                {activity.endDate && <span> - {new Date(activity.endDate).toLocaleDateString()}</span>}
                            </div>
                        )}
                    </div>

                    {activity.description && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">O que foi aprendido:</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                {activity.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-white dark:bg-gray-800 rounded-b-2xl">
                    {onDelete && activity.id ? (
                        <button
                            onClick={() => { onDelete(activity.id!); onClose(); }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                            <FaTrash /> Excluir
                        </button>
                    ) : (<div></div>)}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                        <button
                            onClick={() => { onEdit(activity); onClose(); }}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <FaEdit /> Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
