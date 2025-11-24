import React from 'react';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', fullScreen = false }) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        : "flex flex-col items-center justify-center py-12";

    return (
        <div className={containerClasses}>
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">
                {message}
            </p>
        </div>
    );
};
