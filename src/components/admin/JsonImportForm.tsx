'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCloudUploadAlt, FaFilePdf, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { parseJsonQuestions, saveImportedQuestions, ParsedQuestion, ParsedAlternative } from '@/actions/import-json-actions';
import { processPdfWithGemini } from '@/actions/pdf-import-actions';

interface Subject {
    id: string;
    name: string;
}

export function JsonImportForm({ subjects }: { subjects: Subject[] }) {
    const router = useRouter();

    // Step 1 State
    const [subjectId, setSubjectId] = useState('');
    const [importMethod, setImportMethod] = useState<'json' | 'pdf'>('pdf');
    const [jsonContent, setJsonContent] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    // Step 2 State
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
    const [step, setStep] = useState<1 | 2>(1);

    // Upload Drag State
    const [isDragging, setIsDragging] = useState(false);

    // Global UI State
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<'' | 'uploading' | 'analyzing' | 'saving'>('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string, savedTitles?: string[] } | null>(null);

    // --- STEP 1: PARSE JSON / PDF ---
    const handleParse = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (!subjectId) {
            setFeedback({ type: 'error', message: 'Por favor, selecione uma disciplina.' });
            return;
        }

        if (importMethod === 'json' && !jsonContent.trim()) {
            setFeedback({ type: 'error', message: 'Por favor, insira o conteúdo JSON.' });
            return;
        }

        if (importMethod === 'pdf' && !pdfFile) {
            setFeedback({ type: 'error', message: 'Por favor, selecione um arquivo PDF.' });
            return;
        }

        setLoading(true);

        try {
            let result;
            if (importMethod === 'json') {
                setLoadingStatus('analyzing');
                result = await parseJsonQuestions(jsonContent);
            } else {
                setLoadingStatus('uploading');
                const formData = new FormData();
                formData.append('file', pdfFile as File);

                // Simulate a tiny delay for "uploading" visual before the long "analyzing" phase wait
                await new Promise(resolve => setTimeout(resolve, 800));
                setLoadingStatus('analyzing');

                result = await processPdfWithGemini(formData);
            }

            if (result.success && result.data) {
                if (result.data.length === 0) {
                    setFeedback({ type: 'error', message: 'Nenhuma questão nova foi encontrada (todas já existem ou o formato é inválido).' });
                } else {
                    setParsedQuestions(result.data);
                    setStep(2);
                }
            } else {
                setFeedback({ type: 'error', message: result.error ?? 'Erro ao processar JSON.' });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro na requisição. Tente novamente.' });
        } finally {
            setLoading(false);
            setLoadingStatus('');
        }
    };

    // --- DRAG AND DROP HANDLERS ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (files[0].type === 'application/pdf') {
                setPdfFile(files[0]);
                setFeedback(null);
            } else {
                setFeedback({ type: 'error', message: 'Por favor, envie apenas arquivos PDF.' });
            }
        }
    };

    // --- STEP 2: EDITING QUESTIONS ---

    const updateQuestionStatement = (qIndex: number, newText: string) => {
        const newQuestions = [...parsedQuestions];
        newQuestions[qIndex].statement = newText;
        setParsedQuestions(newQuestions);
    };

    const updateAlternativeText = (qIndex: number, aIndex: number, newText: string) => {
        const newQuestions = [...parsedQuestions];
        newQuestions[qIndex].options[aIndex].text = newText;
        setParsedQuestions(newQuestions);
    };

    const setCorrectAlternative = (qIndex: number, selectedLetter: string) => {
        const newQuestions = [...parsedQuestions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.map(opt => ({
            ...opt,
            isCorrect: opt.letter === selectedLetter
        }));
        setParsedQuestions(newQuestions);
    };

    const removeQuestion = (qIndex: number) => {
        const newQuestions = parsedQuestions.filter((_, i) => i !== qIndex);
        setParsedQuestions(newQuestions);
        if (newQuestions.length === 0) {
            setStep(1); // Volta caso todas sejam removidas
            setFeedback({ type: 'error', message: 'Todas as questões foram removidas. Tente um novo JSON.' });
        }
    };

    // --- STEP 2: SAVE FINAL ---

    const handleSave = async () => {
        setFeedback(null);

        setLoading(true);
        setLoadingStatus('saving');

        try {
            const result = await saveImportedQuestions(subjectId, parsedQuestions);

            if (result.success) {
                setFeedback({
                    type: 'success',
                    message: result.message ?? 'Importação concluída.',
                    savedTitles: result.savedTitles
                });
                setJsonContent('');
                setPdfFile(null);
                setParsedQuestions([]);
                setStep(1);
                router.refresh();
            } else {
                setFeedback({ type: 'error', message: result.error ?? 'Erro ao salvar as questões.' });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro na requisição de salvamento.' });
        } finally {
            setLoading(false);
            setLoadingStatus('');
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">

            {feedback && (
                <div className="space-y-6">
                    <div className={`p-4 rounded-md flex items-center gap-3 border ${feedback.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                        : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                        }`}>
                        {feedback.type === 'success' ? <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" /> : <FaExclamationCircle className="text-red-500 flex-shrink-0" />}
                        <span className="font-semibold text-base">{feedback.message}</span>
                    </div>

                    {feedback.savedTitles && feedback.savedTitles.length > 0 && (
                        <div className="w-full bg-slate-50 dark:bg-[#1e293b] border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-slate-700/80">
                                Questões Recentes Importadas ({feedback.savedTitles.length})
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {feedback.savedTitles.map((title, i) => (
                                    <div key={i} className="bg-white dark:bg-[#334155]/60 hover:dark:bg-[#334155]/80 border border-gray-100 dark:border-slate-700/50 rounded-lg p-4 flex flex-col gap-1 shadow-sm transition-all">
                                        <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-1" title={title}>
                                            {title}
                                        </p>
                                        <div className="flex justify-between items-center w-full mt-1.5">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                by Admin • {subjects.find(s => s.id === subjectId)?.name || 'Disciplina'}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                                                {new Date().toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === STEP 1: INPUT JSON === */}
            {step === 1 && (
                <form onSubmit={handleParse} className="space-y-6">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Disciplina
                        </label>
                        <select
                            id="subject"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full sm:w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={loading}
                        >
                            <option value="">Selecione uma disciplina...</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={importMethod === 'pdf'} onChange={() => setImportMethod('pdf')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Importação Automática (PDF com IA)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={importMethod === 'json'} onChange={() => setImportMethod('json')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Importação Manual (JSON)</span>
                        </label>
                    </div>

                    {importMethod === 'json' ? (
                        <div>
                            <label htmlFor="json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                JSON de Questões
                            </label>
                            <textarea
                                id="json"
                                value={jsonContent}
                                onChange={(e) => setJsonContent(e.target.value)}
                                className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                placeholder="Cole o array JSON aqui..."
                                disabled={loading}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                O JSON deve ser um array contendo os objetos de questão com as chaves `statement` e `options` (com `a`, `b`, `c`, `d`, `e`). As duplicadas serão descartadas automaticamente na visualização.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Arquivo PDF da Prova
                            </label>

                            <div
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
                                    flex flex-col items-center justify-center gap-4 cursor-pointer text-center
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
                                    }
                                    ${loading ? 'opacity-50 pointer-events-none' : ''}
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !loading && document.getElementById('pdf-upload-input')?.click()}
                            >
                                <input
                                    id="pdf-upload-input"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setPdfFile(e.target.files[0]);
                                            setFeedback(null);
                                        }
                                    }}
                                    disabled={loading}
                                />

                                {pdfFile ? (
                                    <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                                        <FaFilePdf className="text-4xl mb-3 text-red-500" />
                                        <span className="font-medium">{pdfFile.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        <p className="text-sm mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                                            Clique ou arraste outro arquivo para trocar
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`
                                            w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors
                                            ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                        `}>
                                            <FaCloudUploadAlt className="text-3xl" />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                                                Selecione um PDF
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                ou arraste e solte o arquivo aqui
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                A Inteligência Artificial (Gemini 2.5 Flash) analisará o PDF e extrairá todas as questões automaticamente, formatando as alternativas e equações matemáticas (LaTeX).
                            </p>

                            {/* PROGRESS BAR */}
                            {loading && importMethod === 'pdf' && (
                                <div className="mt-6 border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 shadow-inner">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <FaSpinner className="animate-spin" />
                                            {loadingStatus === 'uploading' ? 'Transferindo arquivo PDF...' : 'Analisando documento com IA...'}
                                        </span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {loadingStatus === 'uploading' ? '25%' : (loadingStatus === 'analyzing' ? '75%' : '100%')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2.5 mb-2.5 overflow-hidden">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-700 ease-in-out relative"
                                            style={{ width: loadingStatus === 'uploading' ? '25%' : (loadingStatus === 'analyzing' ? '75%' : '100%') }}
                                        >
                                            <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                        {loadingStatus === 'analyzing' && 'O Gemini está extraindo questões e processando as fórmulas de matemática. Isso pode levar alguns segundos.'}
                                        {loadingStatus === 'uploading' && 'Fazendo o upload seguro do PDF para o servidor.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6 md:mt-8">
                        <button
                            type="submit"
                            disabled={loading || (importMethod === 'pdf' && !pdfFile)}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 w-full sm:w-auto shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin text-lg" />
                                    {loadingStatus === 'uploading' && 'Enviando PDF...'}
                                    {loadingStatus === 'analyzing' && (importMethod === 'pdf' ? 'Analisando PDF (Pode levar alguns segundos)...' : 'Extraindo formato JSON...')}
                                </>
                            ) : (
                                importMethod === 'pdf' ? 'Processar PDF com Inteligência Artificial' : 'Revisar Questões JSON'
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* === STEP 2: EDIT AND SAVE === */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Etapa de Revisão</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Foram encontradas {parsedQuestions.length} questões novas válidas. Edite o conteúdo, marque a alternativa correta de cada uma e conclua a importação.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {parsedQuestions.map((q, qIndex) => (
                            <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Questão {qIndex + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Remover
                                    </button>
                                </div>

                                {/* Enunciado */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enunciado</label>
                                    <textarea
                                        value={q.statement}
                                        onChange={(e) => updateQuestionStatement(qIndex, e.target.value)}
                                        rows={4}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Alternativas */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alternativas (Opcional marcar a correta)</label>
                                    {q.options.map((opt, aIndex) => (
                                        <div key={opt.letter} className={`flex items-start gap-3 p-2 rounded-md border ${opt.isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <div className="pt-1">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={opt.isCorrect}
                                                    onChange={() => setCorrectAlternative(qIndex, opt.letter)}
                                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <div className="flex-1 flex gap-2">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase block pt-1">{opt.letter})</span>
                                                <textarea
                                                    value={opt.text}
                                                    onChange={(e) => updateAlternativeText(qIndex, aIndex, e.target.value)}
                                                    rows={1}
                                                    className={`w-full p-1 text-sm bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 ${opt.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-200'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin text-lg" />
                                    Salvando no Banco de Dados...
                                </>
                            ) : (
                                'Confirmar e Importar'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
