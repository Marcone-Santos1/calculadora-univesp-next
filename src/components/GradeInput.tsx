import {PESOS} from "@/utils/Constants";
import {ChangeEvent} from "react";

interface GradeInputProp {
    name: string,
    placeholder: string,
    max?: number,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function GradeInput({placeholder, name, max, onChange}: GradeInputProp) {
    return (
        <input
            type="number"
            name={name}
            placeholder={placeholder}
            max={max ? max : PESOS.MAX_GRADE}
            onChange={onChange}
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-400 dark:text-gray-100 dark:border-gray-500 dark:focus:ring-gray-800 dark:bg-gray-700 dark:placeholder-gray-400 dark:hover:bg-gray-600"
        />
    );
}
