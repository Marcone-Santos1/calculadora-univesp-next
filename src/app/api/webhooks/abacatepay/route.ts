import { prisma as db } from "@/lib/prisma";
import { AdTransactionStatus, AdTransactionType } from "@prisma/client";
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
        const metadata = body.data.billing.metadata;
        const transactionId = metadata.transactionId;

        if (!transactionId) {
            return NextResponse.json({ error: "No transaction ID" }, { status: 400 });
        }

        try {
            await db.$transaction(async (tx) => {
                // 1. Get Transaction
                const transaction = await tx.adTransaction.findUnique({
                    where: { id: transactionId },
                });

                if (!transaction || transaction.status === AdTransactionStatus.COMPLETED) {
                    return; // Already processed or not found
                }

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
