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
    pages: {
        signIn: '/',
    },
    callbacks: {
        async jwt({ token, user }) {
            // Add isAdmin to JWT token on sign in
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { isAdmin: true }
                });
                token.isAdmin = dbUser?.isAdmin || false;
                token.id = user.id;
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
