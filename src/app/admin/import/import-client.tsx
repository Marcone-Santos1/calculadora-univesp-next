'use client'

import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { extractQuestionsFromImage } from '@/actions/ai-actions'
import { saveImportedQuestions } from '@/actions/import-actions'
import { ImportedQuestion } from '@/Contracts/import-contracts'
import { QuestionReviewCard } from '@/components/admin/QuestionReviewCard'
import { useToast } from '@/components/ToastProvider'
import { FaRobot, FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaSave, FaSpinner } from 'react-icons/fa'

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface ImportClientProps {
    subjects: { id: string, name: string }[]
}

type LogType = { message: string, type: 'info' | 'success' | 'error' | 'warning', timestamp: string };

export default function ImportClient({ subjects }: ImportClientProps) {
    const { showToast } = useToast()

    // Core State
    const [file, setFile] = useState<File | null>(null)
    const [numPages, setNumPages] = useState<number>(0)

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [logs, setLogs] = useState<LogType[]>([])
    const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'REVIEW'>('UPLOAD')

    // Data State
    const [scannedQuestions, setScannedQuestions] = useState<ImportedQuestion[]>([])
    const [subjectId, setSubjectId] = useState('')
    const [week, setWeek] = useState('')

    // System
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message: msg, type, timestamp: time }]);
    }

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        addLog(`PDF carregado com ${numPages} páginas.`, 'success');
    }

    const processPage = async (pageIndex: number): Promise<ImportedQuestion[]> => {
        const pageNum = pageIndex + 1;
        const canvas = canvasRefs.current[pageIndex];

        if (!canvas) {
            addLog(`Erro: Canvas da página ${pageNum} não encontrado.`, 'error');
            return [];
        }

        addLog(`Processando página ${pageNum}...`, 'info');
        const imageBase64 = canvas.toDataURL('image/png');

        const result = await extractQuestionsFromImage(imageBase64);

        if (result.success && result.data) {
            addLog(`Página ${pageNum}: ${result.data.length} questões encontradas.`, 'success');
            return result.data;
        } else {
            if (result.error === 'RATE_LIMIT_EXCEEDED') {
                throw new Error('RATE_LIMIT');
            }
            addLog(`Erro na pág ${pageNum}: ${result.error}`, 'error');
            return [];
        }
    }

    const startProcessing = async () => {
        if (!file || numPages === 0) return;

        setIsProcessing(true);
        setStep('PROCESSING');
        setScannedQuestions([]);
        setLogs([]);
        addLog('Iniciando processamento AI...', 'info');

        const allQuestions: ImportedQuestion[] = [];

        for (let i = 0; i < numPages; i++) {
            setCurrentPage(i + 1);
            let success = false;
            let retries = 0;

            while (!success && retries < 3) {
                try {
                    // Smart Delay: Increases as we go deeper to respect rate limits
                    const delay = i === 0 ? 0 : 4000;
                    if (delay > 0) {
                        addLog(`Aguardando ${delay / 1000}s para evitar Rate Limit...`, 'warning');
                        await new Promise(r => setTimeout(r, delay));
                    }

                    const questions = await processPage(i);
                    allQuestions.push(...questions);
                    success = true;

                } catch (e: any) {
                    if (e.message === 'RATE_LIMIT') {
                        retries++;
                        const waitTime = 10000 * retries;
                        addLog(`Rate Limit atingido! Pausando por ${waitTime / 1000}s... (Tentativa ${retries}/3)`, 'warning');
                        await new Promise(r => setTimeout(r, waitTime));
                    } else {
                        addLog(`Erro fatal na página ${i + 1}`, 'error');
                        break; // Skip page
                    }
                }
            }
        }

        setScannedQuestions(allQuestions);
        setIsProcessing(false);
        setStep('REVIEW');
        addLog(`Finalizado! Total de ${allQuestions.length} questões.`, 'success');
        showToast('Processamento concluído!', 'success');
    }

    const handleSave = async () => {
        if (!subjectId || !week) {
            showToast('Preencha Matéria e Semana!', 'warning');
            return;
        }

        setIsProcessing(true);
        const res = await saveImportedQuestions(scannedQuestions, subjectId, week);
        setIsProcessing(false);

        if (res.success) {
            showToast(`${res.count} questões salvas com sucesso!`, 'success');
            setStep('UPLOAD');
            setFile(null);
            setScannedQuestions([]);
        } else {
            showToast(res.error || 'Erro ao salvar', 'error');
        }
    }

    // --- RENDER ---

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <FaRobot className="text-4xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            AI Exam Importer
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Transforme PDFs em questões estruturadas usando IA.</p>
                    </div>
                </div>

                {/* HIDDEN RENDERER */}
                {file && (
                    <div className="hidden">
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                            {Array.from(new Array(numPages), (_, i) => (
                                <Page
                                    key={i} pageNumber={i + 1}
                                    canvasRef={ref => canvasRefs.current[i] = ref}
                                    width={1200}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            ))}
                        </Document>
                    </div>
                )}

                {/* STEP 1: UPLOAD */}
                {step === 'UPLOAD' && (
                    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 shadow-xl transition-all hover:scale-[1.01]">
                        <input
                            type="file" accept="application/pdf" id="pdf-in" className="hidden"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="pdf-in" className="flex flex-col items-center gap-6 cursor-pointer group">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <FaFileUpload className="text-4xl text-blue-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-semibold mb-2">
                                    {file ? file.name : "Clique para selecionar o PDF"}
                                </h3>
                                <p className="text-zinc-400">Suporta arquivos escaneados ou digitais</p>
                            </div>
                        </label>

                        {file && numPages > 0 && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={startProcessing}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                                >
                                    <FaRobot /> Iniciar Processamento Mágico
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: PROCESSING */}
                {step === 'PROCESSING' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Progress */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                            <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * currentPage) / numPages} className="text-blue-500 transition-all duration-1000 ease-out" />
                                </svg>
                                <span className="absolute text-3xl font-bold">{Math.round((currentPage / numPages) * 100)}%</span>
                            </div>
                            <h3 className="text-xl font-semibold animate-pulse">Analisando Página {currentPage} de {numPages}</h3>
                            <p className="text-zinc-500 mt-2">A IA está lendo e transcrevendo as questões...</p>
                        </div>

                        {/* Logs Console */}
                        <div className="bg-black rounded-3xl p-6 shadow-xl font-mono text-sm overflow-hidden flex flex-col h-[400px]">
                            <div className="flex items-center gap-2 text-zinc-400 mb-4 border-b border-zinc-800 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2">System Logs</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-green-400' :
                                                log.type === 'warning' ? 'text-yellow-400' : 'text-blue-300'
                                        }`}>
                                        <span className="opacity-50">[{log.timestamp}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 'REVIEW' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg mb-8 flex flex-wrap gap-4 items-end sticky top-4 z-50">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Matéria</label>
                                <select
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 ring-blue-500"
                                    value={subjectId} onChange={e => setSubjectId(e.target.value)}
                                >
                                    <option value="">Selecione a Matéria...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Semana</label>
                                <input
                                    type="text" placeholder="Ex: Semana 1"
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 ring-blue-500"
                                    value={week} onChange={e => setWeek(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSave} disabled={isProcessing}
                                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                            >
                                {isProcessing ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                Salvar Tudo
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {scannedQuestions.map((q, i) => (
                                <QuestionReviewCard
                                    key={i} index={i} question={q}
                                    onUpdate={(idx, val) => {
                                        const n = [...scannedQuestions]; n[idx] = val; setScannedQuestions(n);
                                    }}
                                    onDelete={(idx) => {
                                        setScannedQuestions(scannedQuestions.filter((_, x) => x !== idx));
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
