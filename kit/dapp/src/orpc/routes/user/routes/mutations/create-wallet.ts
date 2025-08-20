import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getEthereumAddress } from "@atk/zod/src/ethereum-address";
import { eq } from "drizzle-orm/sql";
import type { VariablesOf } from "gql.tada";
import { createPublicClient, http, parseEther, toHex, zeroAddress } from "viem";
import { anvil } from "viem/chains";

const CREATE_ACCOUNT_MUTATION = portalGraphql(`
  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
      address
    }
  }
`);

export const createWallet = authRouter.user.createWallet
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async function ({ context: { auth, db, portalClient }, errors }) {
    if (auth.user.wallet !== zeroAddress) {
      throw errors.CONFLICT({
        message: "Wallet already created",
      });
    }

    const createAccountVariables: VariablesOf<typeof CREATE_ACCOUNT_MUTATION> =
      {
        userId: auth.user.id,
        keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
      };

    const result = await portalClient.raw.request(
      CREATE_ACCOUNT_MUTATION,
      createAccountVariables
    );

    if (!result.createWallet?.address) {
      throw errors.PORTAL_ERROR({
        message: "Failed to create wallet",
        data: {
          document: CREATE_ACCOUNT_MUTATION,
          variables: createAccountVariables,
        },
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

    await db
      .update(user)
      .set({
        wallet: walletAddress,
      })
      .where(eq(user.id, auth.user.id));

    return {
      wallet: walletAddress,
    };
  });
