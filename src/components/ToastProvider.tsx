'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    delay: number;
}

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    delay?: number;
}

interface ToastContextType {
    showToast: {
        (message: string, type?: ToastType, duration?: number, delay?: number): void;
        (options: ToastOptions): void;
    };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (messageOrOptions: string | ToastOptions, type: ToastType = 'info', duration: number = 4000, delay: number = 0) => {
        let msg: string;
        let toastType: ToastType;
        let toastDuration: number;
        let toastDelay: number;

        if (typeof messageOrOptions === 'object') {
            msg = messageOrOptions.message;
            toastType = messageOrOptions.type || 'info';
            toastDuration = messageOrOptions.duration ?? 4000;
            toastDelay = messageOrOptions.delay ?? 0;
        } else {
            msg = messageOrOptions;
            toastType = type;
            toastDuration = duration;
            toastDelay = delay;
        }

        const id = Math.random().toString(36).substr(2, 9);

        const addToast = () => {
            setToasts((prev) => [...prev, { id, message: msg, type: toastType, duration: toastDuration, delay: toastDelay }]);

            if (toastDuration !== Infinity) {
                setTimeout(() => {
                    removeToast(id);
                }, toastDuration);
            }
        };

        if (toastDelay > 0) {
            setTimeout(addToast, toastDelay);
        } else {
            addToast();
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaExclamationCircle className="text-red-500" />;
            case 'warning':
                return <FaExclamationCircle className="text-orange-500" />;
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getBgColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-orange-50 dark:bg-orange-900/90 border-orange-200 dark:border-orange-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right ${getBgColor(
                            toast.type
                        )}`}
                    >
                        <div className="text-xl">{getIcon(toast.type)}</div>
                        <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                            {toast.message}
                        </p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
