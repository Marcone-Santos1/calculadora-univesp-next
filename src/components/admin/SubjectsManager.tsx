/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useTransition } from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { createSubject, updateSubject, deleteSubject } from '@/actions/admin-actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface Subject {
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
    _count: { questions: number };
}

interface SubjectsManagerProps {
    subjects: Subject[];
}

export function SubjectsManager({ subjects }: SubjectsManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', color: '#3B82F6', icon: '📚' });
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (editingId) {
                    await updateSubject(editingId, formData);
                    showToast('Subject updated successfully', 'success');
                    setEditingId(null);
                } else {
                    await createSubject(formData);
                    showToast('Subject created successfully', 'success');
                    setIsAdding(false);
                }
                setFormData({ name: '', color: '#3B82F6', icon: '📚' });
                router.refresh();
            } catch (error: any) {
                showToast(error.message || 'Operation failed', 'error');
            }
        });
    };

    const handleEdit = (subject: Subject) => {
        setEditingId(subject.id);
        setFormData({ name: subject.name, color: subject.color, icon: subject.icon });
        setIsAdding(true);
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteSubject(id);
                showToast('Subject deleted successfully', 'success');
                router.refresh();
            } catch (error: any) {
                showToast(error.message || 'Failed to delete subject', 'error');
            }
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', color: '#3B82F6', icon: '📚' });
    };

    return (
        <div>
            {/* Add/Edit Form */}
            {isAdding && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {editingId ? 'Edit Subject' : 'Add New Subject'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Icon (Emoji)
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    maxLength={2}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <FaPlus /> Add Subject
                </button>
            )}

            {/* Subjects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{subject.icon}</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {subject.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {subject._count.questions} questions
                                    </p>
                                </div>
                            </div>
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: subject.color }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(subject)}
                                disabled={isPending}
                                className="flex-1 p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaEdit /> Edit
                            </button>
                            <button
                                onClick={() => setDeleteId(subject.id)}
                                disabled={isPending || subject._count.questions > 0}
                                className="flex-1 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                title={subject._count.questions > 0 ? 'Cannot delete subject with questions' : 'Delete'}
                            >
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && handleDelete(deleteId)}
                title="Delete Subject"
                message="Are you sure you want to delete this subject? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
