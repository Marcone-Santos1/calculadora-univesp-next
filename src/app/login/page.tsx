
import { signIn } from "@/lib/auth";
import { FaGoogle } from "react-icons/fa";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
    const { callbackUrl } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Bem-vindo de volta!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Faça login para acessar o painel.</p>

                <form
                    action={async () => {
                        "use server";
                        await signIn("google", { redirectTo: callbackUrl || "/" });
                    }}
                >
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 font-medium py-3 px-4 rounded-xl transition-all"
                    >
                        <FaGoogle className="text-red-500" />
                        Entrar com Google
                    </button>
                </form>
            </div>
        </div>
    );
}
