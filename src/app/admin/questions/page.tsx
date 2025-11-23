import { getAdminQuestions } from '@/actions/admin-actions';
import { QuestionsList } from '@/components/admin/QuestionsList';

export default async function AdminQuestionsPage() {
    const questions = await getAdminQuestions();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Questions Management
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {questions.length} questions
                </div>
            </div>

            <QuestionsList questions={questions} />
        </div>
    );
}
