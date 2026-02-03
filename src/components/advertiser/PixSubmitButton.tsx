"use client";

import { useFormStatus } from "react-dom";

export function PixSubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
        >
            {pending ? (
                <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processando...
                </>
            ) : (
                "Pagar com PIX"
            )}
        </button>
    );
}
