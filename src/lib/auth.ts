import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt", // Use JWT for edge runtime compatibility
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    events: {
        async createUser({ user }) {
            const { EmailService } = await import('@/lib/email-service');
            const { PredefinedTemplates, BaseEmailTemplate } = await import('@/lib/email-templates');

            if (user.email) {
                const template = PredefinedTemplates.WELCOME;
                const html = BaseEmailTemplate(template.body(user.name?.split(' ')[0] || 'Estudante'), template.subject);

                await EmailService.sendEmail(
                    { email: user.email, name: user.name || 'User' },
                    template.subject,
                    html
                );
            }
        }
    },
    pages: {
        signIn: '/',
    },
    callbacks: {
        async jwt({ token, user }) {
            // Add isAdmin to JWT token on sign in
            if (user && user.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { isAdmin: true }
                });
                token.isAdmin = dbUser?.isAdmin || false;
                token.id = user.id;

                // Handle Daily Login (Fire and forget or await)
                // We use dynamic import to avoid potential circular dependencies, 
                // though reputation-actions seems clean.
                try {
                    const { handleDailyLogin } = await import('@/actions/reputation-actions');
                    await handleDailyLogin(user.id);
                } catch (error) {
                    console.error('Failed to handle daily login:', error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add isAdmin and id from JWT to session
            if (session.user) {
                session.user.id = token.id as string;
                session.user.isAdmin = token.isAdmin as boolean;
            }
            return session;
        },
    },
})
