'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaGraduationCap, FaSave, FaEraser, FaChartLine, FaSearch, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useToast } from './ToastProvider';
import { getAllSubjects } from '@/actions/subject-actions';

interface Subject {
  id: string;
  name: string;
  grade: number | string;
  credits: number;
}

interface DbSubject {
  id: string;
  name: string;
}

export const CrCalculator = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [cr, setCr] = useState<number>(0);
  
  // Estado para controlar o Modal de Confirmação
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    const init = async () => {
      const loadedDbSubjects = await getAllSubjects();
      setDbSubjects(loadedDbSubjects);

      const saved = localStorage.getItem('univesp_cr_data');
      if (saved) {
        try {
          setSubjects(JSON.parse(saved));
        } catch (e) {
          console.error("Erro ao carregar dados", e);
        }
      } else {
        setSubjects([createEmptySubject(), createEmptySubject(), createEmptySubject()]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    calculateCR();
  }, [subjects]);

  const createEmptySubject = (): Subject => ({
    id: crypto.randomUUID(),
    name: '',
    grade: '',
    credits: 80
  });

  const handleAddSubject = () => {
    setSubjects([...subjects, createEmptySubject()]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length === 1) {
      setSubjects([createEmptySubject()]);
      return;
    }
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // 1. Alterado: Apenas abre o modal
  const handleClearAllClick = () => {
    setIsDeleteModalOpen(true);
  };

  // 2. Novo: Executa a limpeza de fato
  const confirmClearAll = () => {
    const emptyState = [createEmptySubject()];
    setSubjects(emptyState);
    setIsDeleteModalOpen(false);
    localStorage.setItem('univesp_cr_data', JSON.stringify(emptyState));
    showToast('Calculadora limpa com sucesso!', 'success');
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSave = () => {
    localStorage.setItem('univesp_cr_data', JSON.stringify(subjects));
    showToast('Histórico salvo no navegador!', 'success');
  };

  const calculateCR = () => {
    let totalScore = 0;
    let totalCredits = 0;

    subjects.forEach(sub => {
      const grade = Number(sub.grade);
      const credits = Number(sub.credits);
      if (sub.grade !== '' && !isNaN(grade) && !isNaN(credits)) {
        totalScore += grade * credits;
        totalCredits += credits;
      }
    });

    setCr(totalCredits === 0 ? 0 : totalScore / totalCredits);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      
      {/* Placar Principal */}
      <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-blue-900/30 border border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FaGraduationCap className="text-9xl transform translate-x-4 -translate-y-4 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              Coeficiente de Rendimento
            </h2>
            <p className="text-blue-200 mt-2 text-sm sm:text-base max-w-md font-medium">
              Sua média global ponderada. Preencha suas notas para descobrir seu desempenho histórico.
            </p>
          </div>
          
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Seu CR Atual</span>
            <div className="text-6xl sm:text-7xl font-black tracking-tighter tabular-nums leading-none text-white drop-shadow-lg">
              {cr.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Área de Cálculo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-visible">
        
        {/* Header Desktop */}
        <div className="hidden sm:flex bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider backdrop-blur-sm">
          <div className="flex-1 pl-2">Disciplina</div>
          <div className="w-32 text-center">Nota</div>
          <div className="w-40 text-center">Carga (h)</div>
          <div className="w-12"></div>
        </div>

        {/* Lista de Disciplinas */}
        <div className="p-4 sm:p-0 space-y-4 sm:space-y-0">
          {subjects.map((subject, index) => (
            <div 
              key={subject.id} 
              className="group flex flex-col sm:flex-row gap-3 sm:gap-6 items-center sm:px-6 sm:py-4 sm:border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors bg-gray-50/50 sm:bg-transparent rounded-xl sm:rounded-none p-4 sm:p-0 border sm:border-0 border-gray-200 dark:border-gray-700"
            >
              <div className="sm:hidden flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-gray-400">Disciplina #{index + 1}</span>
                <button onClick={() => handleRemoveSubject(subject.id)} className="text-red-400 p-1">
                  <FaTrash />
                </button>
              </div>

              <SubjectAutocomplete 
                 value={subject.name}
                 dbSubjects={dbSubjects}
                 onChange={(val) => updateSubject(subject.id, 'name', val)}
              />

              <div className="w-full sm:w-auto flex gap-4">
                <div className="flex-1 sm:w-32 relative group/input">
                  <label className="sm:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Nota</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="0.0"
                      min="0"
                      max="10"
                      step="0.1"
                      value={subject.grade}
                      onChange={(e) => updateSubject(subject.id, 'grade', e.target.value)}
                      className={`
                        w-full bg-white dark:bg-gray-900 border-2 rounded-xl px-4 py-3 sm:py-2.5 text-center font-bold outline-none transition-all
                        ${Number(subject.grade) >= 5 
                          ? 'border-green-200 focus:border-green-500 text-green-700 dark:text-green-400 dark:border-green-900/30' 
                          : subject.grade !== '' 
                            ? 'border-red-200 focus:border-red-500 text-red-700 dark:text-red-400 dark:border-red-900/30'
                            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 text-gray-900 dark:text-white'}
                        focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20
                      `}
                    />
                  </div>
                </div>

                <div className="flex-1 sm:w-40 relative">
                  <label className="sm:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Horas</label>
                  <div className="relative">
                    <select 
                      value={subject.credits}
                      onChange={(e) => updateSubject(subject.id, 'credits', Number(e.target.value))}
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-2.5 text-center text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer text-gray-700 dark:text-gray-200 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                    >
                      <option value={40}>40h</option>
                      <option value={60}>60h</option>
                      <option value={80}>80h (Padrão)</option>
                      <option value={100}>100h</option>
                      <option value={120}>120h</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleRemoveSubject(subject.id)}
                className="hidden sm:flex w-10 h-10 items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Remover disciplina"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer de Ações */}
        <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
          <button 
            onClick={handleAddSubject}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-bold text-sm shadow-sm"
          >
            <FaPlus /> Adicionar Disciplina
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
             <button 
              onClick={handleClearAllClick} // Chama o modal
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-all font-bold text-sm"
            >
              <FaEraser />
            </button>
            
            <button 
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 transition-all font-bold text-sm"
            >
              <FaSave /> Salvar Histórico
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
         <FaChartLine /> Seus dados ficam salvos de forma segura no seu navegador.
      </p>

      {/* === MODAL DE CONFIRMAÇÃO (NOVO) === */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700 relative">
            
            {/* Ícone de Atenção */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Limpar calculadora?
            </h3>
            
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
              Isso removerá todas as disciplinas e notas preenchidas. Essa ação não pode ser desfeita.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAll}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all"
              >
                Sim, limpar
              </button>
            </div>

            {/* Botão de Fechar no canto */}
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTE: Autocomplete (Mantido igual) ---
const SubjectAutocomplete = ({ value, dbSubjects, onChange }: { value: string, dbSubjects: DbSubject[], onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => setQuery(value), [value]);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filtered = query === '' 
        ? [] 
        : dbSubjects.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

    const handleSelect = (name: string) => {
        setQuery(name);
        onChange(name);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        setIsOpen(true);
    };

    return (
        <div className="w-full sm:flex-1 relative" ref={wrapperRef}>
            <label className="sm:hidden text-[10px] font-bold text-gray-500 uppercase mb-1 block">Disciplina</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 text-xs" />
                </div>
                <input 
                    type="text"
                    placeholder="Busque ou digite a matéria..."
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-3 sm:py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                />
            </div>

            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <ul className="max-h-60 overflow-y-auto py-1">
                        {filtered.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleSelect(item.name)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 flex items-center justify-between group"
                                >
                                    <span>{item.name}</span>
                                    {item.name === query && <FaCheck className="text-blue-500 text-xs" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};