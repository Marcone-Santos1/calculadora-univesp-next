'use client';

import { ImportedQuestion } from "@/Contracts/import-contracts";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaTags } from "react-icons/fa";

interface QuestionReviewCardProps {
    question: ImportedQuestion;
    index: number;
    onUpdate: (index: number, updated: ImportedQuestion) => void;
    onDelete: (index: number) => void;
}

export function QuestionReviewCard({ question, index, onUpdate, onDelete }: QuestionReviewCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [editedQuestion, setEditedQuestion] = useState(question);

    const handleSave = () => {
        onUpdate(index, editedQuestion);
        setIsEditing(false);
    };

    const toggleCorrect = (altIndex: number) => {
        setEditedQuestion({
            ...editedQuestion,
            correctAlternativeIndex: editedQuestion.correctAlternativeIndex === altIndex ? undefined : altIndex
        });
    };

    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Header / Summary */}
            <div
                className="p-4 flex justify-between items-center cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        Q{index + 1}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {question.statement.replace(/[*#]/g, '').slice(0, 60)}...
                        </h3>
                        <div className="flex gap-2 text-xs text-zinc-500 mt-1">
                            <span className="flex items-center gap-1"><FaTags className="w-3 h-3" /> {question.tags?.join(', ') || 'Sem tags'}</span>
                            <span>•</span>
                            <span>{question.alternatives.length} Alternativas</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); setExpanded(true); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <FaTrash />
                    </button>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                    <button className="text-zinc-400">
                        {expanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            {expanded && (
                <div className="p-6 space-y-6 bg-white dark:bg-zinc-900">
                    {isEditing ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                            {/* Editor Mode */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Enunciado</label>
                                <div data-color-mode="dark">
                                    <MDEditor
                                        value={editedQuestion.statement}
                                        onChange={(val) => setEditedQuestion({ ...editedQuestion, statement: val || '' })}
                                        preview="edit"
                                        height={200}
                                        className="rounded-xl border-zinc-200 dark:border-zinc-700 !bg-zinc-50 dark:!bg-zinc-950"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Alternativas</label>
                                <div className="space-y-3">
                                    {editedQuestion.alternatives.map((alt, i) => (
                                        <div key={i} className="flex gap-3 items-start group/alt">
                                            <div
                                                className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all ${editedQuestion.correctAlternativeIndex === i
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:border-green-400'
                                                    }`}
                                                onClick={() => toggleCorrect(i)}
                                                title="Marcar como correta"
                                            >
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 ring-blue-500/50 transition-all font-mono text-sm"
                                                    value={alt}
                                                    onChange={(e) => {
                                                        const newAlts = [...editedQuestion.alternatives];
                                                        newAlts[i] = e.target.value;
                                                        setEditedQuestion({ ...editedQuestion, alternatives: newAlts });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                className="mt-2 text-red-400 opacity-0 group-hover/alt:opacity-100 hover:text-red-600 transition-opacity"
                                                onClick={() => {
                                                    const newAlts = editedQuestion.alternatives.filter((_, idx) => idx !== i);
                                                    setEditedQuestion({ ...editedQuestion, alternatives: newAlts });
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="text-sm text-blue-500 hover:underline pl-11"
                                        onClick={() => setEditedQuestion({ ...editedQuestion, alternatives: [...editedQuestion.alternatives, "Nova Alternativa"] })}
                                    >
                                        + Adicionar Alternativa
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Tags</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 ring-blue-500/50"
                                    placeholder="Separe por vírgulas (Ex: Cálculo, Derivadas)"
                                    value={editedQuestion.tags?.join(', ') || ''}
                                    onChange={(e) => setEditedQuestion({ ...editedQuestion, tags: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-3">
                                <button
                                    onClick={() => { setIsEditing(false); setEditedQuestion(question); }}
                                    className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* View Mode */}
                            <div className="prose dark:prose-invert max-w-none bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                <MDEditor.Markdown source={question.statement} />
                            </div>

                            <div className="grid gap-3">
                                {question.alternatives.map((alt, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${question.correctAlternativeIndex === i
                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800'
                                            }`}
                                    >
                                        <div className={`
                                            min-w-[32px] h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${question.correctAlternativeIndex === i ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}
                                        `}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div className="pt-1">{alt}</div>
                                        {question.correctAlternativeIndex === i && (
                                            <FaCheck className="ml-auto text-green-500 mt-1" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
