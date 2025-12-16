'use client';

import { useState, useRef } from 'react';
import { 
  FaCommentDots, 
  FaTimes, 
  FaBug, 
  FaLightbulb, 
  FaPaperPlane, 
  FaSpinner, 
  FaCheckCircle,
  FaExclamationCircle 
} from 'react-icons/fa';
import { submitFeedback } from '@/actions/feedback-actions';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

type FeedbackType = 'IDEA' | 'BUG' | 'OTHER';

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('IDEA');
  const { showToast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.append('pageUrl', pathname);
    formData.append('type', selectedType); // Força o tipo selecionado visualmente

    const result = await submitFeedback(formData);

    if (result.success) {
      setIsSuccess(true);
      showToast("Feedback enviado com sucesso.", 'success');
      if (formRef.current) formRef.current.reset();
      
      // Fecha automaticamente após 3 segundos
      setTimeout(() => {
        setIsOpen(false);
        // Reseta o estado para a próxima vez (após a animação de fechar)
        setTimeout(() => setIsSuccess(false), 300);
      }, 3000);
    } else {
      showToast(result.error || "Erro ao enviar.", 'error');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:bottom-10 sm:right-10 font-sans">
      
      {/* O Painel (Popover) com Animação de Entrada */}
      <div 
        className={`
          mb-4 w-[340px] bg-white dark:bg-gray-900 
          rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 
          overflow-hidden transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute bottom-0 right-0'}
        `}
      >
        
        {/* Header com Gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg leading-tight">Feedback</h3>
            <p className="text-blue-100 text-xs opacity-90">Ajude a melhorar a plataforma</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Corpo do Widget */}
        <div className="p-5">
          {isSuccess ? (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm">
                <FaCheckCircle />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">Recebido!</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-[200px]">
                Obrigado por contribuir com a comunidade Univesp.
              </p>
            </div>
          ) : (
            <form ref={formRef} action={handleSubmit} className="space-y-5">
              
              {/* Seletor de Tipo (Visual Cards) */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Do que se trata?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('IDEA')}
                    className={`
                      flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all text-xs font-medium
                      ${selectedType === 'IDEA' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                  >
                    <FaLightbulb className={selectedType === 'IDEA' ? 'text-lg' : 'text-lg opacity-50'} />
                    Ideia
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('BUG')}
                    className={`
                      flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all text-xs font-medium
                      ${selectedType === 'BUG' 
                        ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400 shadow-sm ring-1 ring-red-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                  >
                    <FaBug className={selectedType === 'BUG' ? 'text-lg' : 'text-lg opacity-50'} />
                    Erro
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('OTHER')}
                    className={`
                      flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all text-xs font-medium
                      ${selectedType === 'OTHER' 
                        ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-400 shadow-sm ring-1 ring-purple-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                  >
                    <FaExclamationCircle className={selectedType === 'OTHER' ? 'text-lg' : 'text-lg opacity-50'} />
                    Outro
                  </button>
                </div>
                {/* Input Hidden para passar o valor no Server Action */}
                <input type="hidden" name="type" value={selectedType} />
              </div>

              {/* Área de Texto */}
              <div className="relative">
                <textarea
                  name="message"
                  required
                  placeholder={
                    selectedType === 'BUG' ? "Descreva o erro e onde ele ocorreu..." :
                    selectedType === 'IDEA' ? "Qual funcionalidade você gostaria de ver?" :
                    "Diga o que está pensando..."
                  }
                  className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32 transition-all placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Enviar Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Botão Flutuante (FAB) com Efeito Pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 z-50
          ${isOpen 
            ? 'bg-white text-gray-600 rotate-90 dark:bg-gray-800 dark:text-gray-200' 
            : 'bg-blue-600 text-white hover:-translate-y-1 hover:shadow-blue-600/40'}
        `}
      >
        {/* Ping Animation para chamar atenção se estiver fechado */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping duration-[2000ms]"></span>
        )}
        
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaCommentDots className="text-2xl" />
        )}
      </button>
    </div>
  );
};