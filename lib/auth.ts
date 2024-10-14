import NextAuth, { type DefaultSession } from "next-auth";
import { authConfig } from "./auth/config";
import { providers } from "./auth/providers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: providers,
});

declare module "next-auth" {
  interface Session {
    user: {
      wallet: string;
    } & DefaultSession["user"];
  }
}
