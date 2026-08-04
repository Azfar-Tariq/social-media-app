import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "@/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/password";

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        
        // Find existing user by email
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        const user = existingUsers[0];

        if (user) {
          // If user has a password set, verify it unless password was not supplied
          if (user.password && credentials.password) {
            const isValid = verifyPassword(credentials.password, user.password);
            if (!isValid) {
              throw new Error("Invalid password");
            }
          }
          return {
            id: user.id,
            name: user.name || normalizedEmail.split("@")[0],
            email: user.email,
            image: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || normalizedEmail)}`,
          };
        }

        // Auto-provision user for quick demo or new email signup
        const rawName = credentials.name?.trim() || normalizedEmail.split("@")[0];
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const hashedPassword = credentials.password ? hashPassword(credentials.password) : null;
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`;

        const [newUser] = await db
          .insert(users)
          .values({
            email: normalizedEmail,
            name: formattedName,
            password: hashedPassword,
            image: avatarUrl,
          })
          .returning();

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string || session.user.name;
        session.user.email = token.email as string || session.user.email;
        session.user.image = token.picture as string || session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

