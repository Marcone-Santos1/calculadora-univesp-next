import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,
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
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // Fetch isAdmin from database user
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { isAdmin: true }
                });
                session.user.isAdmin = dbUser?.isAdmin || false;
            }
            return session;
        },
    },
})
