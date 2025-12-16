export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
};

export const PostCardSkeleton = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};