import Link from "next/link";
import {ElementType} from "react";

export const FilterOption = ({
                        href,
                        active,
                        icon: Icon,
                        label,
                        count,
                        onClick
                      }: {
  href: string;
  active: boolean;
  icon?: ElementType;
  label: string;
  count?: number;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 group ${
      active
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    <div className="flex items-center gap-2.5 overflow-hidden">
      {Icon && (
        <span className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
          <Icon/> {/* Renderizando como componente */}
        </span>
      )}
      <span className="truncate">{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active
          ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 group-hover:bg-white dark:group-hover:bg-gray-700'
      }`}>
        {count}
      </span>
    )}
  </Link>
);