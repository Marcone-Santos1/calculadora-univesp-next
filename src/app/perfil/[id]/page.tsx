import { auth } from '@/lib/auth';
import { getUserProfile, getUserStats, getUserQuestions, getUserComments } from '@/actions/user-actions';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserActivityList } from '@/components/profile/UserActivityList';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLevel } from '@/utils/reputation';
import { AchievementsList } from '@/components/profile/AchievementsList';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const user = await getUserProfile(id);

    if (!user) {
        return {
            title: 'Usuário não encontrado | Calculadora Univesp',
        };
    }

    const stats = await getUserStats(id);
    const hasContent = stats.questions > 0 || stats.comments > 0;

    const { title: userTitle, level } = getLevel(user.reputation || 0);
    const seoTitle = `${user.name} (${userTitle} - Lvl ${level}) | Comunidade Univesp`;

    return {
        title: seoTitle,
        description: `Perfil de ${user.name || 'usuário'} na Calculadora Univesp.`,
        robots: {
            index: hasContent,
            follow: true,
        },
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const { id } = await params;
    const session = await auth();
    const user = await getUserProfile(id);

    if (!user) {
        notFound();
    }

    const [stats, questions, comments] = await Promise.all([
        getUserStats(id),
        getUserQuestions(id),
        getUserComments(id)
    ]);

    const isOwner = session?.user?.id === user.id;

    // Adapt user object to match what ProfileHeader expects
    const profileUser = {
        id: user.id,
        name: user.name,
        email: isOwner ? user.email : null, // Only show email to owner
        image: user.image,
        bio: user.bio,
        location: user.location,
        website: user.website,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socialLinks: user.socialLinks as any,
        loginStreak: user.loginStreak
    };

    const unlockedAchievementIds = (user.achievements || []).map((ua: any) => ua.achievementId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <ProfileHeader
                    user={profileUser}
                    stats={stats}
                    isOwner={isOwner}
                />

                <div className="mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Conquistas</h2>
                    <AchievementsList unlockedIds={unlockedAchievementIds} />
                </div>

                <UserActivityList
                    questions={questions}
                    comments={comments}
                />
            </div>
        </div>
    );
}
