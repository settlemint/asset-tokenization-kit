"use server";

import { signIn } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { settlemint } from "@/lib/settlemint";
import { genSalt, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signUpActionSchema } from "../schemas/sign-up-schema";

export const signUpAction = actionClient.schema(signUpActionSchema).action(async ({ parsedInput }) => {
  try {
    const { provider, ...formData } = parsedInput;

    const wallet = await settlemint.hasura.gql.getWalletByEmail({
      email: formData.username,
    });

    if (!wallet.starterkit_wallets_by_pk) {
      const hasAdmin = await settlemint.hasura.gql.hasAtLeastOneAdmin();
      const role = [(hasAdmin.starterkit_wallets_aggregate.aggregate?.count ?? 0) > 0 ? "user" : "admin"];

      const wallet = await settlemint.portal.gql.createUserWallet({
        keyVaultId: process.env.SETTLEMINT_USER_WALLETS_KEY_VAULT_ID ?? "",
        name: formData.username,
      });

      const salt = await genSalt(10);
      const hashedPassword = await hash(formData.password, salt);

      await settlemint.hasura.gql.createNewWallet({
        email: formData.username,
        password: hashedPassword,
        wallet: wallet.createWallet?.address ?? "",
        role,
      });
    }

    return await signIn(provider, formData, { redirectTo: "/wallet" });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth/error?error=${error.type}`);
    }
    throw error;
  }
});
