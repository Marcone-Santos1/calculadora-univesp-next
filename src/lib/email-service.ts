import { MailerooClient, EmailAddress } from "maileroo-sdk";
import { BaseEmailTemplate } from "./email-templates";

const API_KEY = process.env.MAILEROO_API_KEY;
const FROM_EMAIL = process.env.MAILEROO_FROM_EMAIL || "noreply@calculadoraunivesp.com";

let mailerooClient: any = null;

if (API_KEY) {
    mailerooClient = new MailerooClient(API_KEY);
}

export const EmailService = {
    /**
     * Sends a broadcast email to a list of recipients.
     * Note: For large lists, we should use Batch API or iterate in chunks.
     * Maileroo basic implementation for single sends in loop for now (MVP).
     */
    sendBroadcastEmail: async (
        subject: string,
        htmlContent: string,
        recipients: { email: string; name?: string }[]
    ) => {
        if (!mailerooClient) {
            console.log("⚠️ Maileroo API Key not found. Email logging mode:");
            console.log(`To: ${recipients.length} recipients`);
            console.log(`Subject: ${subject}`);
            return { success: false, error: "Missing API Key" };
        }

        console.log(`📧 Sending broadcast email to ${recipients.length} users via Maileroo...`);
        let successCount = 0;
        let failCount = 0;

        // Simple iteration for MVP. Ideally should use Bcc or Batch if supported by specific plan/SDK.
        // Checking SDK docs, basic send is one by one or using 'to' array if we want them to see each other (bad for broadcast).
        // Valid strategy for broadcast: Send to self, Bcc everyone else? Or individual sends.
        // Individual sends are safer for privacy but slower.

        // For this implementation, we will try to use the bulk send if available or iterate.
        // Maileroo SDK documentation confirms 'send' method.

        for (const recipient of recipients) {
            console.log(`📧 Sending email to ${recipient.email}...`);

            try {
                await mailerooClient.sendBasicEmail({
                    to: [new EmailAddress(recipient.email, recipient.name)],
                    from: new EmailAddress(FROM_EMAIL, "Calculadora Univesp"),
                    subject: subject,
                    html: BaseEmailTemplate(htmlContent, subject),
                    plain: htmlContent.replace(/<[^>]*>?/gm, ""), // Basic stripping
                    tracking: true
                });
                successCount++;
            } catch (error) {
                console.error(`Failed to send to ${recipient.email}:`, error);
                failCount++;
            }
        }

        return { success: true, sent: successCount, failed: failCount };
    },

    /**
     * Send a single transactional email
     */
    sendEmail: async (to: { email: string; name?: string } | string, subject: string, html: string) => {
        if (!mailerooClient) {
            console.log(`[MOCK EMAIL] To: ${JSON.stringify(to)}, Subject: ${subject}`);
            return { success: false, error: "Missing API Key" };
        }

        const emailAddr = typeof to === 'string'
            ? new EmailAddress(to)
            : new EmailAddress(to.email, to.name);

        try {
            await mailerooClient.sendBasicEmail({
                to: [emailAddr],
                from: new EmailAddress(FROM_EMAIL, "Calculadora Univesp"),
                subject,
                html: BaseEmailTemplate(html, subject),
                plain: html.replace(/<[^>]*>?/gm, ""),
                tracking: true
            });
            return { success: true };
        } catch (error) {
            console.error("Maileroo send error:", error);
            return { success: false, error };
        }
    }
};
