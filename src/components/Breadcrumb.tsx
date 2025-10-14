import { FaChevronRight } from 'react-icons/fa';
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
    <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {links.map((link, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <FaChevronRight className="w-3 h-3 text-gray-400 mx-1" />
            )}
            {link.path ? (
              <Link href={link.path} className="hover:text-blue-500 dark:hover:text-blue-400">
                {link.name}
              </Link>
            ) : (
              <span className="font-medium text-gray-700 dark:text-gray-200">{link.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};