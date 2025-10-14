import { HistoryEntryProp } from "@/Contracts/HistoryEntryProp";
import { MdDelete } from "react-icons/md";

interface HistoryProps {
  entries: HistoryEntryProp[];
  onClear: () => void;
}

export function History({ entries, onClear }: HistoryProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Histórico de Cálculos</h3>
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          aria-label="Limpar histórico"
        >
          <MdDelete />
          Limpar
        </button>
      </div>
      <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-500 dark:scrollbar-track-gray-700 rounded-md">
        {entries.map((entry) => (
          <li key={entry.id} className="p-2 bg-white dark:bg-gray-600 rounded-md flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{entry.type}: </span>
              <span className="text-gray-600 dark:text-gray-300">{entry.result}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{entry.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}