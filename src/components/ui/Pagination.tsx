import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams: any;
}

export const Pagination = ({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) => {
    // Helper to generate URL for a page
    const getPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        if (page === 1) {
            params.delete('page'); // Cleaner URL for first page
        } else {
            params.set('page', page.toString());
        }
        const queryString = params.toString();
        return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    };

    // Calculate visible page numbers
    const getVisiblePages = () => {
        const delta = 2; // How many pages to show around current
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
        <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Paginação">
            {/* Previous Button */}
            <Link
                href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}
                className={`
                    flex items-center justify-center w-10 h-10 rounded-lg border transition-all
                    ${currentPage > 1
                        ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        : 'opacity-50 cursor-not-allowed border-transparent text-zinc-400'
                    }
                `}
                aria-disabled={currentPage <= 1}
                aria-label="Página anterior"
            >
                <FaChevronLeft className="w-3 h-3" />
            </Link>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {getVisiblePages().map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-zinc-400">
                            ...
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={getPageUrl(page as number)}
                            className={`
                                flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all
                                ${currentPage === page
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }
                            `}
                        >
                            {page}
                        </Link>
                    )
                ))}
            </div>

            {/* Next Button */}
            <Link
                href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
                className={`
                    flex items-center justify-center w-10 h-10 rounded-lg border transition-all
                    ${currentPage < totalPages
                        ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        : 'opacity-50 cursor-not-allowed border-transparent text-zinc-400'
                    }
                `}
                aria-disabled={currentPage >= totalPages}
                aria-label="Próxima página"
            >
                <FaChevronRight className="w-3 h-3" />
            </Link>
        </nav>
    );
};
