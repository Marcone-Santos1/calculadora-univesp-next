import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Perfil | Calculadora Univesp',
    description: 'Atualize suas informações de perfil.',
};

export default async function EditProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            socialLinks: true
        }
    });

    if (!user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Editar Perfil
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Atualize suas informações pessoais e como as pessoas veem você.
                    </p>
                </div>

                <ProfileEditForm user={user as any} />
            </div>
        </div>
    );
}
