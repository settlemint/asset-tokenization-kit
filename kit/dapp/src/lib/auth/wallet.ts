import { env } from "@/lib/env";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { APIError } from "better-auth/api";
import { createPublicClient, http } from "viem";
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

  // When developping locally we need to fund the wallet
  const isLocal = env.SETTLEMINT_INSTANCE === "local";
  if (isLocal) {
    try {
      const balanceInHex = toHex(1_000_000_000_000_000_000n);
      // For test environment, check if we're using test ports
      const isTestEnv =
        process.env.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT?.includes(
          ":18547"
        );
      const anvilPort = isTestEnv ? 18_545 : 8545;
      const client = createPublicClient({
        chain: anvil,
        transport: http(`http://localhost:${anvilPort}`),
      });

      await client.request({
        method: "anvil_setBalance",
        params: [walletAddress, balanceInHex],
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error) {
      logger.error("Failed to fund wallet", error);
    }
  }

  return walletAddress;
}
