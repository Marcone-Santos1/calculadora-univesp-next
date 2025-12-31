import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { auth } from '@/lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <ProfileLayout currentUserId={session?.user?.id}>
            {children}
        </ProfileLayout>
    );
}
