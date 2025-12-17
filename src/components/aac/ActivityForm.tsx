"use client";

import { useState, useEffect } from "react";
import { AacCategory } from "@prisma/client";
import { validateActivity } from "@/lib/aac-validation";
import { ActivityData } from "@/actions/aac-actions";
import { FaCalendarAlt, FaClock, FaUniversity, FaTag, FaInfoCircle, FaTimes } from "react-icons/fa";

type Props = {
    onSubmit: (data: Omit<ActivityData, "id" | "validHours">) => Promise<void>;
    existingActivities: ActivityData[];
    onCancel?: () => void;
    initialData?: ActivityData | null;
};

export function ActivityForm({ onSubmit, existingActivities, onCancel, initialData }: Props) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [category, setCategory] = useState<AacCategory>((initialData?.category as AacCategory) || AacCategory.COURSE);
    const [originalHours, setOriginalHours] = useState(initialData?.originalHours || 0);
    const [institution, setInstitution] = useState(initialData?.institution || "");
    const [date, setDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "");
    const [description, setDescription] = useState(initialData?.description || "");

    // Update state when initialData changes (re-opening form for diff item)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setCategory(initialData.category as AacCategory);
            setOriginalHours(initialData.originalHours);
            setInstitution(initialData.institution || "");
            setDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "");
            setDescription(initialData.description || "");
        } else {
            // Reset if closed/cleared
            // Optional: Do we want to reset if initialData becomes null? Yes.
            // But usually component is unmounted. 
        }
    }, [initialData]);

    // Validation Preview
    const validation = validateActivity({
        title,
        category,
        originalHours,
        endDate: date ? new Date(date) : null,
        institution,
        description
    }, existingActivities.filter(a => a.id !== initialData?.id)); // Exclude self from limits check during edit

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validation.isValid) return;

        await onSubmit({
            title,
            category,
            originalHours,
            institution,
            description,
            endDate: date ? new Date(date) : undefined,
            startDate: undefined // Simplified for now
        });

        // Reset or close
        if (onCancel) onCancel();
        else {
            if (!initialData) {
                setTitle("");
                setOriginalHours(0);
                setDescription("");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {initialData ? "Editar Atividade" : "Adicionar Nova Atividade"}
                </h3>
                {initialData && onCancel && (
                    <button onClick={onCancel} type="button" className="text-gray-400 hover:text-gray-500"><FaTimes /></button>
                )}
            </div>
            {/* Title */}
            <div>
                {/* ... rest of form ... */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Atividade</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Curso de Python Completo"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FaTag className="text-gray-400" /> Categoria</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value as AacCategory)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={AacCategory.COURSE}>Curso / Certificado</option>
                        <option value={AacCategory.CULTURAL}>Evento Cultural</option>
                        <option value={AacCategory.EXPERIENCE}>Vivência Profissional</option>
                        <option value={AacCategory.INTERNSHIP}>Estágio</option>
                        <option value={AacCategory.OTHER}>Outros</option>
                    </select>
                </div>

                {/* Hours */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FaClock className="text-gray-400" /> Carga Horária (Certificado)</label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={originalHours || ""}
                        onChange={e => setOriginalHours(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 60"
                    />

                    {/* Validation Feedback */}
                    {originalHours > 0 && (
                        <div className={`text-xs mt-1 font-medium ${validation.validHours < originalHours ? "text-orange-500" : "text-green-500"}`}>
                            Serão computadas: {validation.validHours}h
                            {validation.message && <span className="block text-gray-500 font-normal">{validation.message}</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FaUniversity className="text-gray-400" /> Instituição</label>
                    <input
                        type="text"
                        value={institution}
                        onChange={e => setInstitution(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Udemy, Alura"
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> Data de Conclusão</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Description / Learning */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FaInfoCircle className="text-gray-400" /> O que você aprendeu?</label>
                <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição para o relatório..."
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!validation.isValid}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors shadow-sm ${validation.isValid
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    Salvar Atividade
                </button>
            </div>

            {!validation.isValid && validation.message && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {validation.message}
                </div>
            )}
        </form>
    );
}
