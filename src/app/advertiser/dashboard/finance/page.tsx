import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { createDeposit } from "@/actions/finance-actions";
import { PaymentSuccessBanner } from "@/components/advertiser/PaymentSuccessBanner";
import { PixSubmitButton } from "@/components/advertiser/PixSubmitButton";
import { AdTransactionStatus, AdTransactionType } from "@prisma/client";
import { FaWallet, FaHistory } from "react-icons/fa";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getFinanceData(userId: string): Promise<AdvertiserProfile | null> {
    const profile = await db.advertiserProfile.findUnique({
        where: { userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });
    return profile;
}

const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700'
};



type Transaction = {
    id: string;
    advertiserId: string;
    type: AdTransactionType;
    amount: number;
    status: AdTransactionStatus;
    gatewayId: string | null;
    metadata: any;
    createdAt: Date;
};

type AdvertiserProfile = {
    id: string;
    userId: string;
    balance: number;
    taxId: string | null;
    cellphone: string | null;
    createdAt: Date;
    updatedAt: Date;
    transactions: Transaction[];
};


export default async function FinancePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const profile = await getFinanceData(session.user.id);

    return (
        <div className="space-y-6">
            <Suspense fallback={null}>
                <PaymentSuccessBanner />
            </Suspense>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <FaWallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Atual</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {((profile?.balance || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deposit Form or Profile Completion Check */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Adicionar Créditos</h2>

                    {(!profile?.taxId || !profile.cellphone) ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-yellow-600 dark:text-yellow-500 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Perfil Incompleto</h3>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 mb-3">
                                        Para realizar depósitos, é obrigatório informar seu CPF/CNPJ e Telefone.
                                    </p>
                                    <a
                                        href="/advertiser/dashboard/settings"
                                        className="inline-flex items-center text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:underline"
                                    >
                                        Completar Perfil &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form
                            action={async (formData) => {
                                "use server";
                                const amount = Number(formData.get("amount")) * 100; // Convert to cents
                                if (amount < 500) return; // Min R$ 5,00
                                const result = await createDeposit(amount);
                                if (result?.url) {
                                    redirect(result.url);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Depósito (R$)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    min="5"
                                    step="1"
                                    defaultValue="50"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo: R$ 5,00</p>
                            </div>
                            <PixSubmitButton />
                        </form>
                    )}
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaHistory /> Histórico Recente
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Valor</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {profile?.transactions?.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {tx.type === 'DEPOSIT' ? 'Depósito' : 'Consumo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                                        {(tx.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tx.status]}`}>{tx.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {(!profile?.transactions || profile.transactions.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma transação encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
