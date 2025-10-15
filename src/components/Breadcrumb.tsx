import { FaChevronRight, FaHome } from "react-icons/fa";
import Link from "next/link";

interface BreadcrumbLink {
  name: string;
  path?: string;
}

interface BreadcrumbProps {
  links: BreadcrumbLink[];
}

export const Breadcrumb = ({ links }: BreadcrumbProps) => {
  return (
    <nav
      className="mb-8 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-1 md:gap-2">
        {links.map((link, index) => {
          const isLast = index === links.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index === 0 && (
                <FaHome className="mr-2 text-gray-400 dark:text-gray-500 w-3 h-3" />
              )}

              {index > 0 && (
                <FaChevronRight className="mx-2 text-gray-400 dark:text-gray-600 w-3 h-3" />
              )}

              {link.path && !isLast ? (
                <Link
                  href={link.path}
                  className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {link.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
