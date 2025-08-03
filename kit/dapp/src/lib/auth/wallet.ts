import { env } from "@/lib/env";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { APIError } from "better-auth/api";

export async function createWallet(email: string) {
  const CREATE_ACCOUNT_MUTATION = portalGraphql(`
    mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
      createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
        address
      }
    }
  `);

  const result = await portalClient.request(CREATE_ACCOUNT_MUTATION, {
    userId: email,
    keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
  });
  if (!result.createWallet?.address) {
    throw new APIError("BAD_REQUEST", {
      message: "Failed to create wallet",
    });
  }

  const walletAddress = getEthereumAddress(result.createWallet.address);

  return walletAddress;
}
