/* eslint-disable @typescript-eslint/no-explicit-any */
import {FormEvent, useEffect, useRef} from "react";
import {FaBook, FaCheck, FaTimes} from "react-icons/fa";

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  formData: { name: string; color: string; icon: string };
  setFormData: (data: any) => void;
  isEditing: boolean;
  isPending: boolean;
}

export function SubjectFormModal({
                            isOpen,
                            onClose,
                            onSubmit,
                            formData,
                            setFormData,
                            isEditing,
                            isPending
                          }: SubjectFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Previne scroll no fundo
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Editar Matéria' : 'Nova Matéria'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Atualize os detalhes abaixo.' : 'Preencha as informações para criar.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes/>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Preview Card */}
          <div className="flex justify-center mb-2">
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <span className="text-2xl">{formData.icon || '📚'}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
    {formData.name || 'Nome da Matéria'}
    </span>
              <div
                className="w-4 h-4 rounded-full"
                style={{backgroundColor: formData.color}}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nome da Matéria
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaBook/>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ex: Cálculo I"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cor do Tema
              </label>
              <div
                className="flex items-center gap-2 h-[46px] w-full p-1 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 cursor-pointer overflow-hidden relative">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="h-full aspect-square rounded-lg border border-gray-200 shadow-sm"
                  style={{backgroundColor: formData.color}}
                />
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400 uppercase">
                  {formData.color}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ícone (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                maxLength={2}
                placeholder="📚"
                className="w-full px-4 py-2.5 text-center text-xl border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <>
                  <FaCheck/> {isEditing ? 'Salvar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}