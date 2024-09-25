import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { settlemint } from "./settlemint";

const credentialsSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const validatedCredentials = credentialsSchema.safeParse(credentials);

        if (!validatedCredentials.success) {
          return null;
        }

        const { username: email, password } = validatedCredentials.data;

        const wallet = await settlemint.hasura.gql.getWalletByEmail({ email });

        // we could not find a wallet with this email address
        if (!wallet.wallets_by_pk?.email) {
          return null;
        }

        const passwordCorrect = await compare(password, wallet.wallets_by_pk.password);

        // the hashed password from the database does not match the one provided
        if (!passwordCorrect) {
          return null;
        }

        return wallet.wallets_by_pk;
      },
    }),
  ],
});
