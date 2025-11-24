import React from 'react';
import Link from 'next/link';
import { Subject } from '@/Contracts/Subject';
import { FaBook, FaCalculator, FaCode, FaFlask, FaGlobe, FaLanguage } from 'react-icons/fa';

interface SubjectCarouselProps {
    subjects: Subject[];
}

const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cálculo') || lower.includes('matemática')) return <FaCalculator />;
    if (lower.includes('algoritmos') || lower.includes('programação')) return <FaCode />;
    if (lower.includes('física') || lower.includes('química')) return <FaFlask />;
    if (lower.includes('inglês') || lower.includes('português')) return <FaLanguage />;
    if (lower.includes('ética') || lower.includes('sociedade')) return <FaGlobe />;
    return <FaBook />;
};

export const SubjectCarousel: React.FC<SubjectCarouselProps> = ({ subjects }) => {
    return (
        <div className="w-full py-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 px-1">Matérias Populares</h3>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
                {subjects.map((subject) => (
                    <Link
                        href={`/questoes?subject=${subject.id}`}
                        key={subject.id}
                        className={`
                            flex-shrink-0 w-40 h-32 rounded-xl p-4 
                            flex flex-col justify-between items-start 
                            transition-transform hover:scale-105 hover:shadow-lg
                            cursor-pointer snap-start
                            ${subject.color || 'bg-gray-500'} text-white
                        `}
                    >
                        <div className="text-2xl opacity-80">
                            {getIcon(subject.name)}
                        </div>
                        <span className="font-semibold text-sm leading-tight">
                            {subject.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
