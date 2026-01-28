import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await db.select().from(users).where(eq(users.username, credentials.username)).get();

                if (!user) {
                    return null;
                }

                const passwordMatch = await compare(credentials.password, user.passwordHash);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.username,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore // We know token.id exists because we put it there
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
};
