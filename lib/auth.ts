import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";

const useMockAuth =
  process.env.USE_MOCK_DATA === "true" || !process.env.GITHUB_ID;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    ...(useMockAuth
      ? [
          CredentialsProvider({
            name: "Demo",
            credentials: {
              username: { label: "Username", type: "text" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (
                credentials?.username === "demo" &&
                credentials?.password === "demo"
              ) {
                const user = await prisma.user.findUnique({
                  where: { email: "demo@movie-twitter.local" },
                });
                if (user) return user;
                return prisma.user.create({
                  data: {
                    email: "demo@movie-twitter.local",
                    name: "Demo User",
                    username: "demo",
                  },
                });
              }
              return null;
            },
          }),
        ]
      : []),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  session: {
    strategy: useMockAuth ? "jwt" : "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        (session.user as { id: string }).id =
          (user as { id: string })?.id ?? (token.id as string);
        (session.user as { username?: string }).username =
          (user as { username?: string })?.username ?? (token.username as string);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
