import { env } from "@/lib/env";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { APIError } from "better-auth/api";
import { createPublicClient, http, parseEther } from "viem";
import { anvil } from "viem/chains";
import { toHex } from "viem/utils";

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

  // When developing locally we need to fund the wallet
  const isLocal = env.SETTLEMINT_INSTANCE === "local";

  if (isLocal) {
    try {
      // Fund with 100 ETH for testing
      const balanceInHex = toHex(parseEther("100"));

      // Use the blockchain endpoint from environment
      // In Docker, this will be http://txsigner:3000
      // In local dev, this will be http://localhost:8545 or similar
      const blockchainUrl = env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT;

      try {
        const client = createPublicClient({
          chain: anvil,
          transport: http(blockchainUrl),
        });

        await client.request({
          method: "anvil_setBalance",
          params: [walletAddress, balanceInHex],
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      } catch {
        // Don't throw - wallet creation should still succeed
        // The test will fail later if funding is actually needed
      }
    } catch {
      // Ignore outer errors
    }
  }

  return walletAddress;
}
