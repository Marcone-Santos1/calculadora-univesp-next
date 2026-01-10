import { auth } from '@/lib/auth';
import { getMockExam } from '@/actions/mock-exam-actions';
import { redirect } from 'next/navigation';
import { SimuladoRunnerClient } from '@/components/simulados/SimuladoRunnerClient';

export default async function SimuladoPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const { id } = await params;
    const exam = await getMockExam(id);

    if (!exam) redirect('/simulados');
    if (exam.status === 'COMPLETED') redirect(`/simulados/${id}/resultado`);

    // Transform data for client (ensure types match)
    const clientExam = {
        id: exam.id,
        totalQuestions: exam.totalQuestions,
        questions: exam.questions.map(mq => ({
            id: mq.id,
            selectedAlternativeId: mq.selectedAlternativeId,
            question: {
                id: mq.question.id,
                text: mq.question.text,
                alternatives: mq.question.alternatives.map(a => ({
                    id: a.id,
                    letter: a.letter,
                    text: a.text
                }))
            }
        }))
    };

    return <SimuladoRunnerClient exam={clientExam} />;
}
