import {ElementType, ReactNode, useState} from "react";
import {FaChevronDown} from "react-icons/fa";

export const FilterSection = ({
                         title,
                         icon: Icon,
                         children,
                         defaultOpen = true,
                         isActive = false
                       }: {
  title: string;
  icon?: ElementType;
  children: ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group mb-2"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {Icon && <Icon className="text-gray-400 group-hover:text-blue-500" />}
          {title}
          {isActive && <div className="w-2 h-2 rounded-full bg-blue-500 ml-1" />}
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <FaChevronDown size={10} />
        </span>
      </button>

      <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};
