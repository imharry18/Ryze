import { PrismaAdapter } from "@auth/prisma-adapter";
import { pg } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(pg), // Tells NextAuth to use Postgres
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await pg.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("User not found");

        // If user has no password (e.g. Google login user trying to use password), fail
        if (!user.password) throw new Error("Please login with Google");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.username = token.username;
        session.user.image = token.picture; // Pass DP to client
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.picture = user.image;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  }
};