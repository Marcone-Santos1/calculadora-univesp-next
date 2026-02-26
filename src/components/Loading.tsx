import React from 'react';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', fullScreen = true }) => {

    const containerClasses = fullScreen
        ? "min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"
        : "flex flex-col items-center justify-center py-12 bg-gray-900";

    return (
        <div className={containerClasses}>
            {/* Modern spinner */}
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {message}
            </p>
        </div>
    );
};
