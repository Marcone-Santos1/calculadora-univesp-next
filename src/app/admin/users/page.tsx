import { getAdminUsers } from '@/actions/admin-actions';
import { UsersList } from '@/components/admin/UsersList';

export default async function AdminUsersPage() {
    const users = await getAdminUsers();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Users Management
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {users.length} users
                </div>
            </div>

            <UsersList users={users} />
        </div>
    );
}
