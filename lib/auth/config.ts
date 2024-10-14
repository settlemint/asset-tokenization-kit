import type { NextAuthConfig } from "next-auth";

export const authConfig: Omit<NextAuthConfig, "providers"> = {
  secret: process.env.SETTLEMINT_AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    newUser: "/auth/new-user",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.wallet = (user as { wallet: string }).wallet;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.wallet = token.wallet as string;
      }
      return session;
    },
  },
};
