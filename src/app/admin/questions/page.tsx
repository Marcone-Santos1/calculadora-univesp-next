import { getAdminQuestions, getAdminSubjects } from '@/actions/admin-actions';
import { QuestionsList } from '@/components/admin/QuestionsList';
import { AdminQuestionFilters } from '@/components/admin/AdminQuestionFilters';
import { Pagination } from '@/components/ui/Pagination';

interface AdminQuestionsPageProps {
    searchParams: Promise<{
        search?: string;
        subjectId?: string;
        status?: string;
        page?: string;
    }>;
}

export default async function AdminQuestionsPage(props: AdminQuestionsPageProps) {
    const params = await props.searchParams;
    const search = params.search;
    const subjectId = params.subjectId;
    const status = params.status as 'verified' | 'unverified' | 'pending' | undefined;
    const page = Number(params.page) || 1;

    // Fetch questions and subjects
    const [{ questions, meta }, subjects] = await Promise.all([
        getAdminQuestions({ search, subjectId, status, page, limit: 10 }),
        getAdminSubjects()
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Questions</h1>
                <p className="text-gray-600 dark:text-gray-400">View, verify, and delete questions.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-0">
                <a
                    href="/admin/questions"
                    className={`pb-3 px-1 font-medium transition-colors relative ${!status
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    All Questions
                </a>
                <a
                    href="/admin/questions?status=pending"
                    className={`pb-3 px-1 font-medium transition-colors relative flex items-center gap-2 ${status === 'pending'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Verification Requests
                </a>
            </div>

            <AdminQuestionFilters subjects={subjects} />

            <QuestionsList questions={questions} />

            <div className="flex justify-center">
                <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    baseUrl="/admin/questions"
                    searchParams={params}
                />
            </div>
        </div>
    );
}
