import { getAdminQuestions } from '@/actions/admin-actions';
import { QuestionsList } from '@/components/admin/QuestionsList';

interface AdminQuestionsPageProps {
    searchParams: Promise<{
        search?: string;
    }>;
}

export default async function AdminQuestionsPage(props: AdminQuestionsPageProps) {
    const params = await props.searchParams;
    const search = params.search;

    const questions = await getAdminQuestions(search);
    const verificationRequests = await getAdminQuestions(search, undefined, true);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Questions</h1>
                <p className="text-gray-600 dark:text-gray-400">View, verify, and delete questions.</p>
            </div>

            <QuestionsList
                questions={questions}
                verificationRequests={verificationRequests}
                initialSearch={search}
            />
        </div>
    );
}
