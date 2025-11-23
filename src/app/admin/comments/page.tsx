import { getAdminComments } from '@/actions/admin-actions';
import { CommentsList } from '@/components/admin/CommentsList';

export default async function AdminCommentsPage() {
    const comments = await getAdminComments();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Comments Moderation
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {comments.length} comments
                </div>
            </div>

            <CommentsList comments={comments} />
        </div>
    );
}
