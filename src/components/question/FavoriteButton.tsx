'use client';

import { FaStar, FaRegStar } from 'react-icons/fa';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface FavoriteButtonProps {
    questionId: string;
    className?: string;
}

export function FavoriteButton({ questionId, className = '' }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useUserPreferences();
    const favorited = isFavorite(questionId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if button is inside a Link
        e.stopPropagation();
        toggleFavorite(questionId);
    };

    return (
        <button
            onClick={handleClick}
            className={`transition-all hover:scale-110 ${className}`}
            title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
            {favorited ? (
                <FaStar className="text-yellow-500 dark:text-yellow-400" />
            ) : (
                <FaRegStar className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400" />
            )}
        </button>
    );
}
