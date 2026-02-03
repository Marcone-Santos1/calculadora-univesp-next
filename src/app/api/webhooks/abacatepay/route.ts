import { prisma as db } from "@/lib/prisma";
import { AdTransactionStatus, AdTransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

export async function POST(req: Request) {
    const bodyText = await req.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("X-Webhook-Signature");

    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!secret) {
        console.error("Missing ABACATEPAY_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    if (!signature) {
        console.error("Missing Signature");
        return NextResponse.json({ error: "Missing Signature" }, { status: 401 });
    }

    if (!verifySignature(bodyText, signature)) {
        console.error("Invalid Signature");
        return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText);
    const event = body.event; // 'billing.paid'

    if (event === "billing.paid") {
        const metadata = body.data?.billing?.metadata;
        let transactionId = metadata?.transactionId;

        // Fallback: AbacatePay may not echo metadata in webhooks; find by gatewayId (billing ID)
        if (!transactionId) {
            const billingId = body.data?.id ?? body.data?.billing?.id;
            if (billingId) {
                const byGateway = await db.adTransaction.findFirst({
                    where: { gatewayId: billingId, status: AdTransactionStatus.PENDING },
                    select: { id: true },
                });
                transactionId = byGateway?.id ?? undefined;
            }
        }

        if (!transactionId) {
            console.error("Webhook billing.paid: could not resolve transaction", {
                hasData: !!body.data,
                hasBilling: !!body.data?.billing,
                hasMetadata: !!metadata,
                billingId: body.data?.id ?? body.data?.billing?.id,
            });
            return NextResponse.json({ error: "No transaction ID in metadata" }, { status: 400 });
        }

        try {
            // 1. Get Transaction with User
            // We need to fetch it separately first because $transaction types are tricky with includes sometimes, 
            // but cleaner to just do it inside.
            let userEmail: string | null = null;
            let userName = "";

            await db.$transaction(async (tx) => {
                // 1. Get Transaction
                const transaction = await tx.adTransaction.findUnique({
                    where: { id: transactionId },
                    include: {
                        advertiser: {
                            include: { user: true }
                        }
                    }
                });

                if (!transaction || transaction.status === AdTransactionStatus.COMPLETED) {
                    return; // Already processed or not found
                }

                userEmail = transaction.advertiser.user.email;
                userName = transaction.advertiser.user.name || "Anunciante";

                // 2. Update Transaction
                await tx.adTransaction.update({
                    where: { id: transactionId },
                    data: {
                        status: AdTransactionStatus.COMPLETED,
                        gatewayId: body.data.id,
                    },
                });

                // 3. Update Advertiser Balance
                await tx.advertiserProfile.update({
                    where: { id: transaction.advertiserId },
                    data: {
                        balance: {
                            increment: transaction.amount,
                        },
                    },
                });

            });

            // Send Email
            if (userEmail) {
                const { PredefinedTemplates } = await import("@/lib/email-templates");
                const { EmailService } = await import("@/lib/email-service");

                const template = PredefinedTemplates.BILLING_PAID;
                const html = template.body(userName, body.data.billing.amount);
                await EmailService.sendEmail({ email: userEmail, name: userName }, template.subject, html);
            }

            revalidatePath("/advertiser/dashboard/finance");

            return NextResponse.json({ received: true });
        } catch (error) {
            console.error("Webhook Error", error);
            return NextResponse.json({ error: "Internal Error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

/**
 * Verifies if the webhook signature matches the expected HMAC.
 * @param rawBody Raw request body string.
 * @param signatureFromHeader The signature received from `X-Webhook-Signature`.
 * @returns true if the signature is valid, false otherwise.
 */
export function verifySignature(rawBody: string, signatureFromHeader: string) {
    const bodyBuffer = Buffer.from(rawBody, "utf8")

    const expectedSig = crypto
        .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
        .update(bodyBuffer)
        .digest("base64");

    const A = Buffer.from(expectedSig);
    const B = Buffer.from(signatureFromHeader);

    return A.length === B.length && crypto.timingSafeEqual(A, B);
}
