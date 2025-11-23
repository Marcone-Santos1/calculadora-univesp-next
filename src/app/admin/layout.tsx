import { redirect } from 'next/navigation';
import { checkIsAdmin } from '@/lib/admin-auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.Node;
}) {
    const isAdmin = await checkIsAdmin();

    if (!isAdmin) {
        redirect('/questoes');
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
