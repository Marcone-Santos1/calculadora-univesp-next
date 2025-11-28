import { getReports } from '@/actions/report-actions';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import { ReportActions } from '@/components/admin/reports/ReportActions';

export default async function AdminReportsPage() {
    const reports = await getReports();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Denúncias ({reports.filter(r => r.status === 'PENDING').length} pendentes)
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Motivo</th>
                                <th className="p-4">Conteúdo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4 text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                                        {report.reason}
                                    </td>
                                    <td className="p-4">
                                        {report.questionId && (
                                            <Link
                                                href={`/questoes/${report.questionId}`}
                                                target="_blank"
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                Ver Questão <FaExternalLinkAlt className="text-xs" />
                                            </Link>
                                        )}
                                        {report.commentId && (
                                            <div className="text-gray-600 dark:text-gray-300 italic">
                                                "{report.comment?.text.substring(0, 50)}..."
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : report.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <ReportActions
                                            reportId={report.id}
                                            status={report.status}
                                            contentType={report.questionId ? 'question' : 'comment'}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
