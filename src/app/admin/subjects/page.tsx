import { getAdminSubjects } from '@/actions/admin-actions';
import { SubjectsManager } from '@/components/admin/SubjectsManager';

export default async function AdminSubjectsPage() {
    const subjects = await getAdminSubjects();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Subjects Management
            </h1>

            <SubjectsManager subjects={subjects} />
        </div>
    );
}
