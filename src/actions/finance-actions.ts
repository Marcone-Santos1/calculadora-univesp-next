import { auth } from "@/lib/auth"; // Assuming NextAuth v5 or similar setup based on file structure
import { prisma as db } from "@/lib/prisma"; // Aliasing to db to minimize code changes
import { AdTransactionStatus, AdTransactionType } from "@prisma/client";

const ABACATEPAY_URL = "https://api.abacatepay.com/v1"; // Verify actual URL

export async function createDeposit(amountInCents: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { advertiserProfile: true },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Ensure advertiser profile exists
    let advertiserId = user.advertiserProfile?.id;
    if (!advertiserId) {
        const newAdvertiser = await db.advertiserProfile.create({
            data: {
                userId: user.id,
            },
        });
        advertiserId = newAdvertiser.id;
    }

    // 1. Create Pending Transaction
    const transaction = await db.adTransaction.create({
        data: {
            advertiserId: advertiserId!,
            type: AdTransactionType.DEPOSIT,
            amount: amountInCents,
            status: AdTransactionStatus.PENDING,
        },
    });

    // 2. Call AbacatePay API
    try {
        const customerData = {
            name: user.name || "Cliente sem nome",
            email: user.email || "email@nao.informado",
            cellphone: user.advertiserProfile?.cellphone || "",
            taxId: user.advertiserProfile?.taxId || ""
        };

        if (!customerData.cellphone || !customerData.taxId) {
            throw new Error("Dados incompletos: Telefone e CPF/CNPJ são obrigatórios.");
        }

        const response = await fetch(`${ABACATEPAY_URL}/billing/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                frequency: "ONE_TIME",
                methods: ["PIX"],
                products: [
                    {
                        externalId: "deposit",
                        name: "Saldo Plataforma de Anúncios",
                        quantity: 1,
                        price: amountInCents,
                    },
                ],
                returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/advertiser/dashboard/finance`,
                completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/advertiser/dashboard/finance?success=true`,
                customer: customerData,
                metadata: {
                    transactionId: transaction.id,
                    userId: user.id,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AbacatePay Error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        const paymentUrl = data.data.url;

        return { url: paymentUrl };

    } catch (error) {
        console.error("AbacatePay Error:", error);
        // Mark transaction as failed?
        await db.adTransaction.update({
            where: { id: transaction.id },
            data: { status: AdTransactionStatus.FAILED },
        });
        throw new Error("Failed to create payment");
    }
}
