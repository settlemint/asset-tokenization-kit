import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { settlemint } from "./settlemint";

const credentialsSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const providers: Provider[] = [
  Credentials({
    credentials: {
      username: { label: "Email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const validatedCredentials = credentialsSchema.safeParse(credentials);

      if (!validatedCredentials.success) {
        return null;
      }

      const { username, password } = validatedCredentials.data;

      const walletResponse = await settlemint.hasura.gql.getWalletByEmail({ email: username });

      // we could not find a wallet with this email address
      if (!walletResponse.wallets_by_pk?.email) {
        return null;
      }

      const passwordCorrect = await compare(password, walletResponse.wallets_by_pk.password);

      // the hashed password from the database does not match the one provided
      if (!passwordCorrect) {
        return null;
      }

      const { email, wallet } = walletResponse.wallets_by_pk;

      return { email, wallet };
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
  })
  .filter((provider) => provider.id !== "credentials");

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.SETTLEMINT_AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    newUser: "/auth/new-user",
    error: "/auth/error",
  },
  providers,
});
