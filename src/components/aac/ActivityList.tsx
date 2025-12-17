"use client";

import { ActivityData } from "@/actions/aac-actions";
import { AacCategory } from "@prisma/client";
import { FaTrash, FaExclamationTriangle, FaEye, FaEdit } from "react-icons/fa";
import { useState } from "react";

type Props = {
    activities: ActivityData[];
    onDelete: (id: string) => Promise<void>;
    onView: (activity: ActivityData) => void;
    onEdit: (activity: ActivityData) => void;
};

const categoryLabels: Record<AacCategory, string> = {
    [AacCategory.COURSE]: "Curso/Certificado",
    [AacCategory.CULTURAL]: "Cultural",
    [AacCategory.EXPERIENCE]: "Vivência Profissional",
    [AacCategory.INTERNSHIP]: "Estágio",
    [AacCategory.OTHER]: "Outros"
};

const categoryColors: Record<AacCategory, string> = {
    [AacCategory.COURSE]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    [AacCategory.CULTURAL]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    [AacCategory.EXPERIENCE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    [AacCategory.INTERNSHIP]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    [AacCategory.OTHER]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

import { ConfirmModal } from "@/components/aac/ConfirmModal";

export function ActivityList({ activities, onDelete, onView, onEdit }: Props) {

    // Manage open menu by ID to prevent all menus opening at once
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [activityToDelete, setActivityToDelete] = useState<ActivityData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleActionClick = (activity: ActivityData) => {
        // Toggle: if same ID is open, close it. Else open new.
        if (openMenuId === activity.id) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(activity.id || null);
        }
    };

    const handleActionClose = () => {
        setOpenMenuId(null);
    };

    // Triggered from Dropdown Item
    const RequestDelete = (activity: ActivityData) => {
        setActivityToDelete(activity);
        handleActionClose();
        setShowDeleteConfirm(true);
    };

    // Triggered from Confirm Modal
    const handleConfirmDelete = async () => {
        if (activityToDelete?.id) {
            await onDelete(activityToDelete.id);
        }
        setShowDeleteConfirm(false);
        setActivityToDelete(null);
    };

    const handleView = (activity: ActivityData) => {
        onView(activity);
        handleActionClose();
    };

    const handleEdit = (activity: ActivityData) => {
        onEdit(activity);
        handleActionClose();
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p>Nenhuma atividade cadastrada.</p>
                <p className="text-sm">Comece adicionando seus certificados e cursos.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const isCapped = activity.validHours < activity.originalHours;
                const isMenuOpen = openMenuId === activity.id;

                return (
                    <div
                        key={activity.id || activity.title + activity.originalHours} // Fallback key for optimistic/local items without ID
                        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md"
                    >
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[activity.category as AacCategory] || categoryColors.OTHER}`}>
                                        {categoryLabels[activity.category as AacCategory] || activity.category}
                                    </span>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{activity.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.institution && <span className="font-medium mr-2">{activity.institution}</span>}
                                        {activity.endDate && <span>• {new Date(activity.endDate).toLocaleDateString()}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 border-gray-100 dark:border-gray-700">
                            {/* Hours Display */}
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Computado</span>
                                </div>
                                <div className="flex items-baseline justify-end gap-2">
                                    {isCapped && (
                                        <span className="text-sm text-gray-400 line-through decoration-red-500 decoration-2" title="Original">{activity.originalHours}h</span>
                                    )}
                                    <span className={`text-2xl font-bold ${isCapped ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>
                                        {activity.validHours}h
                                    </span>
                                </div>
                                {isCapped && (
                                    <p className="text-xs text-orange-500 flex items-center justify-end gap-1">
                                        <FaExclamationTriangle size={10} /> Limitado pelo regulamento
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {activity.id && (
                                <div className="relative group">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors" onClick={() => handleActionClick(activity)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10 animate-slideIn">
                                            <button
                                                onClick={() => handleView(activity)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <FaEye size={14} /> Ver
                                            </button>
                                            <button
                                                onClick={() => handleEdit(activity)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <FaEdit size={14} /> Editar
                                            </button>
                                            <button
                                                onClick={() => RequestDelete(activity)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <FaTrash size={14} /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Atividade?"
                description="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita e os dados serão perdidos permanentemente."
                confirmText="Excluir"
                cancelText="Cancelar"
                isDangerous={true}
            />
        </div>
    );
}
