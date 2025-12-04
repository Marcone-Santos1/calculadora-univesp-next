/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { FaTrash, FaEdit, FaPlus, FaTimes, FaCheck, FaBook } from 'react-icons/fa';
import { createSubject, updateSubject, deleteSubject } from '@/actions/admin-actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import {SubjectFormModal} from "@/components/admin/SubjectFormModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6', icon: '📚' });
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#3B82F6', icon: '📚' });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({ name: subject.name, color: subject.color, icon: subject.icon });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    // Pequeno delay para limpar o form apenas após a animação (opcional)
    setTimeout(() => setFormData({ name: '', color: '#3B82F6', icon: '📚' }), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingId) {
          await updateSubject(editingId, formData);
          showToast('Subject updated successfully', 'success');
        } else {
          await createSubject(formData);
          showToast('Subject created successfully', 'success');
        }
        handleCloseModal();
        router.refresh();
      } catch (error: any) {
        showToast(error.message || 'Operation failed', 'error');
      }
    });
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

  return (
    <div>
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          <FaPlus /> Nova Matéria
        </button>
      </div>

      {/* Modal Component */}
      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingId}
        isPending={isPending}
      />

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma matéria encontrada.</p>
          <button onClick={openCreateModal} className="text-blue-600 hover:underline">
            Adicione a primeira
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 text-2xl">
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      {subject._count.questions} questões
                    </p>
                  </div>
                </div>
                <div
                  className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800"
                  style={{ backgroundColor: subject.color }}
                  title={`Cor: ${subject.color}`}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                <button
                  onClick={() => handleEdit(subject)}
                  disabled={isPending}
                  className="flex-1 py-2 px-3 text-sm font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-xs" /> Editar
                </button>
                <button
                  onClick={() => setDeleteId(subject.id)}
                  disabled={isPending || subject._count.questions > 0}
                  className="flex-1 py-2 px-3 text-sm font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={subject._count.questions > 0 ? 'Não é possível excluir matéria com questões' : 'Excluir'}
                >
                  <FaTrash className="text-xs" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Excluir Matéria"
        message="Tem certeza que deseja excluir esta matéria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}