"use server";

import type { MintWizardSchema } from "@/app/wallet/tokens/[address]/details/_forms/mint-token-form-validation";
import { auth } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const MintTokenMutation = portalGraphql(`
mutation Mint($address: String = "", $from: String = "", $amount: String = "", $to: String = "") {
  StarterKitERC20Mint(
    address: $address
    from: $from
    input: {amount: $amount, to: $to}
    gasLimit: "2000000"
  ) {
    transactionHash
  }
}
`);

export async function mintToken(address: string, data: MintWizardSchema) {
  const { amount, toAddress } = data;
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const result = await portalClient.request(MintTokenMutation, {
    address: address,
    from: session.user.wallet,
    amount: (BigInt(amount) * BigInt("1000000000000000000")).toString(),
    to: toAddress,
  });

  const transactionHash = result.StarterKitERC20Mint?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
}
