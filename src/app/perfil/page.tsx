import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserStats, getUserQuestions, getUserComments } from '@/actions/user-actions';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserActivityList } from '@/components/profile/UserActivityList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meu Perfil | Calculadora Univesp',
    description: 'Gerencie suas atividades e visualize suas estatísticas.',
};

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    const [stats, questions, comments] = await Promise.all([
        getUserStats(session.user.id!),
        getUserQuestions(session.user.id!),
        getUserComments(session.user.id!)
    ]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <ProfileHeader
                    user={session.user}
                    stats={stats}
                />

                <UserActivityList
                    questions={questions}
                    comments={comments}
                />
            </div>
        </div>
    );
}
