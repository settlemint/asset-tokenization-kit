"use server";

import { settlemint } from "@/lib/settlemint";
import { redirect } from "next/navigation";
import { signInAction } from "../../signin/actions/sign-in";

export async function signUpAction(provider: string, formData: FormData) {
  const wallet = await settlemint.hasura.gql.getWalletByEmail({
    email: formData.get("email") as string,
  });

  if (wallet.wallets_by_pk) {
    return redirect(`/auth/signin?email=${formData.get("email")}`);
  }

  const hasAdmin = await settlemint.hasura.gql.hasAtLeastOneAdmin();
  const role = [(hasAdmin.wallets_aggregate.aggregate?.count ?? 0) > 0 ? "user" : "admin"];

  // create wallet in portal

  await settlemint.hasura.gql.createNewWallet({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    wallet: "",
    role,
  });

  return signInAction(provider, formData);
}
