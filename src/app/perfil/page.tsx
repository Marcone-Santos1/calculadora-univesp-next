import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserStats, getUserQuestions, getUserComments, getUserProfile } from '@/actions/user-actions';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserActivityList } from '@/components/profile/UserActivityList';
import { AchievementsList } from '@/components/profile/AchievementsList';
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

    const [stats, questions, comments, userProfile] = await Promise.all([
        getUserStats(session.user.id!),
        getUserQuestions(session.user.id!),
        getUserComments(session.user.id!),
        getUserProfile(session.user.id!)
    ]);

    // Explicitly define the type for userProfile to include achievements
    type UserWithAchievements = NonNullable<typeof userProfile>;

    if (!userProfile) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <ProfileHeader
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user={userProfile as any}
                    stats={stats}
                    isOwner={session.user.id === userProfile.id}
                />

                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🏆 Conquistas
                    </h2>
                    <AchievementsList
                        unlockedIds={(userProfile as any).achievements.map((ua: { achievementId: string }) => ua.achievementId)}
                    />
                </div>

                <UserActivityList
                    questions={questions}
                    comments={comments}
                />
            </div>
        </div>
    );
}
