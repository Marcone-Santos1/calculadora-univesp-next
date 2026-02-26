import { getAdminSubjects } from '@/actions/admin-actions';
import { JsonImportForm } from '@/components/admin/JsonImportForm';
import Link from 'next/link';

export const metadata = {
    title: 'Importar Questões JSON | Admin',
};

export default async function JsonImportPage() {
    const subjects = await getAdminSubjects();

    // Pick only id and name for the form dropdown
    const simpleSubjects = subjects.map((s) => ({
        id: s.id,
        name: s.name,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/questions"
                    className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Importar JSON</h1>
                    <p className="text-gray-600 dark:text-gray-400">Importe questões em lote colando um arquivo JSON.</p>
                </div>
            </div>

            <JsonImportForm subjects={simpleSubjects} />

        </div>
    );
}
