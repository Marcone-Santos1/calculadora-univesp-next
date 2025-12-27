
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { createDeposit } from "@/actions/finance-actions";
import { AdTransactionStatus, AdTransactionType } from "@prisma/client";
import { FaWallet, FaHistory, FaQrcode } from "react-icons/fa";
import { redirect } from "next/navigation";

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

                {/* Deposit Form */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Adicionar Créditos</h2>
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
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Pagar com PIX
                        </button>
                    </form>
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
