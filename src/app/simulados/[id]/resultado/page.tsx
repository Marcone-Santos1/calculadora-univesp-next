import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FaClock, FaTrophy, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';

export default async function SimuladoResultadoPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;

    const exam = await prisma.mockExam.findFirst({
        where: { id, userId: session.user.id },
        include: {
            questions: {
                include: {
                    question: {
                        include: {
                            alternatives: true // Include all data including isCorrect
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!exam || exam.status !== 'COMPLETED') redirect('/simulados');

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}m ${s}s`;
    };

    const percentage = Math.round((exam.score / exam.totalQuestions) * 100);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header / Score Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden mb-8 text-center relative">
                <div className={`h-2 w-full ${percentage >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div className="p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 text-4xl mb-4 shadow-sm animate-bounce-slow">
                        <FaTrophy />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Simulado Finalizado!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Confira abaixo o seu desempenho.</p>

                    <div className="flex justify-center gap-8 mb-6">
                        <div className="text-center">
                            <p className="text-sm uppercase font-bold text-gray-400">Nota Final</p>
                            <p className={`text-5xl font-black ${percentage >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {exam.score}<span className="text-2xl text-gray-400">/{exam.totalQuestions}</span>
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm uppercase font-bold text-gray-400">XP Ganho</p>
                            <p className="text-5xl font-black text-purple-600">+{exam.xpEarned}</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-300 font-mono text-sm">
                        <FaClock /> Tempo Total: {formatTime(exam.timeSpent)}
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Gabarito e Revisão</h2>

            <div className="space-y-6">
                {exam.questions.map((mq, index) => {
                    const correctAlt = mq.question.alternatives.find(a => a.isCorrect);
                    const selectedAlt = mq.question.alternatives.find(a => a.id === mq.selectedAlternativeId);

                    return (
                        <div key={mq.id} className={`bg-white dark:bg-zinc-900 rounded-xl border p-6 flex gap-4 ${mq.isCorrect ? 'border-green-200 dark:border-green-900/30' : 'border-red-200 dark:border-red-900/30'
                            }`}>
                            <div className="shrink-0">
                                {mq.isCorrect ? (
                                    <FaCheckCircle className="text-2xl text-green-500" />
                                ) : (
                                    <FaTimesCircle className="text-2xl text-red-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">Questão {index + 1}</p>
                                <div className="font-medium text-gray-800 dark:text-gray-200 mb-4 prose dark:prose-invert max-w-none">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{mq.question.text}</ReactMarkdown>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {!mq.isCorrect && selectedAlt && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                            <span className="font-bold">Sua resposta ({selectedAlt.letter}):</span>
                                            <span>{selectedAlt.text}</span>
                                        </div>
                                    )}
                                    {correctAlt && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                            <span className="font-bold">Resposta correta ({correctAlt.letter}):</span>
                                            <span>{correctAlt.text}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center gap-4 mt-12">
                <Link href="/simulados" className="px-6 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold transition-colors flex items-center gap-2">
                    <FaArrowLeft /> Voltar ao Painel
                </Link>
                <Link href="/simulados/novo" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-2">
                    <FaRedo /> Novo Simulado
                </Link>
            </div>
        </div>
    );
}
