import Link from 'next/link';
import { FaFlagCheckered, FaHourglassHalf, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

interface MockExam {
    id: string;
    score: number;
    totalQuestions: number;
    status: 'COMPLETED' | 'IN_PROGRESS';
    createdAt: Date;
    timeSpent: number;
}

export function SimuladoHistoryTimeline({ history }: { history: MockExam[] }) {
    if (history.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FaFlagCheckered size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nenhum simulado ainda</h3>
                <p className="text-gray-500 dark:text-gray-400">Comece agora mesmo para ver sua evolução!</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-zinc-800" />

            {history.map((exam, index) => {
                const percentage = Math.round((exam.score / exam.totalQuestions) * 100);
                const isCompleted = exam.status === 'COMPLETED';
                const date = new Date(exam.createdAt);

                return (
                    <div key={exam.id} className="relative group">
                        {/* Dot */}
                        <div className={`
                            absolute -left-[29px] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-zinc-950 z-10
                            ${isCompleted
                                ? (percentage >= 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-yellow-500')
                                : 'bg-blue-500 animate-pulse'}
                        `} />

                        <Link
                            href={isCompleted ? `/simulados/${exam.id}/resultado` : `/simulados/${exam.id}`}
                            className="block bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group-hover:border-blue-200 dark:group-hover:border-blue-900/30"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            #{exam.id.slice(-4)}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <FaCalendarAlt size={10} />
                                            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                                        {isCompleted ? 'Simulado Finalizado' : 'Em Andamento'}
                                    </h4>

                                    <div className="flex items-center gap-3">
                                        {isCompleted ? (
                                            <div className={`px-2 py-1 rounded-md text-xs font-bold ${percentage >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {percentage}% Acerto
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                                                <FaHourglassHalf />
                                                Continuar
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {exam.totalQuestions} questões
                                        </span>
                                    </div>
                                </div>

                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 text-gray-400">
                                    <FaChevronRight />
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
