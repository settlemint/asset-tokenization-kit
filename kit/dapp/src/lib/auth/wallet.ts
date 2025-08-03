import { env } from "@/lib/env";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { APIError } from "better-auth/api";
import { createPublicClient, http, parseEther } from "viem";
import { anvil } from "viem/chains";
import { toHex } from "viem/utils";

const logger = createLogger();

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
  console.log(
    `[WALLET FUNDING] Check - SETTLEMINT_INSTANCE: ${env.SETTLEMINT_INSTANCE}, isLocal: ${isLocal}`
  );

  if (isLocal) {
    try {
      // Fund with 100 ETH for testing
      const balanceInHex = toHex(parseEther("100"));

      // Use the blockchain endpoint from environment
      // In Docker, this will be http://txsigner:3000
      // In local dev, this will be http://localhost:8545 or similar
      const blockchainUrl = env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT;

      console.log(
        `[WALLET FUNDING] Attempting to fund wallet ${walletAddress} with 100 ETH`
      );
      console.log(`[WALLET FUNDING] Using blockchain URL: ${blockchainUrl}`);
      console.log(`[WALLET FUNDING] Balance hex value: ${balanceInHex}`);

      try {
        const client = createPublicClient({
          chain: anvil,
          transport: http(blockchainUrl),
        });

        console.log(
          `[WALLET FUNDING] Created viem client, sending anvil_setBalance request...`
        );

        const result = await client.request({
          method: "anvil_setBalance",
          params: [walletAddress, balanceInHex],
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        console.log(
          `[WALLET FUNDING] Successfully funded wallet ${walletAddress} with 100 ETH using ${blockchainUrl}. Result: ${JSON.stringify(result)}`
        );
      } catch (error) {
        console.error(
          `[WALLET FUNDING] Failed to fund wallet using ${blockchainUrl}:`,
          error
        );
        console.error(`[WALLET FUNDING] Error details:`, error);
        // Don't throw - wallet creation should still succeed
        // The test will fail later if funding is actually needed
      }
    } catch (error) {
      console.error(
        "[WALLET FUNDING] Failed to fund wallet - outer catch",
        error
      );
    }
  } else {
    console.log(
      `[WALLET FUNDING] Skipping wallet funding - not in local environment (SETTLEMINT_INSTANCE=${env.SETTLEMINT_INSTANCE})`
    );
  }

  return walletAddress;
}
