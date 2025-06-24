/**
 * Account Creation Handler
 *
 * This handler creates blockchain wallet accounts for authenticated users through
 * the SettleMint Portal. Unlike system and factory creation, this operation is
 * synchronous and doesn't require transaction tracking as wallet creation happens
 * off-chain in the Portal's key management system.
 *
 * @see {@link ./account.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client
 */

import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { AccountCreateMessagesSchema } from "./account.create.schema";

/**
 * GraphQL mutation to create a new wallet in the SettleMint Portal.
 *
 * Creates a new HD wallet derived from the specified key vault,
 * with the userId as the wallet name for identification.
 *
 * @param keyVaultId - The HD key vault ID to derive the wallet from
 * @param userId - The user ID to associate with the wallet
 * @returns The newly created wallet address
 */
const CREATE_ACCOUNT_MUTATION = portalGraphql(`
  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
      address
    }
  }
`);

/**
 * Creates a new blockchain wallet account for an authenticated user.
 *
 * This handler performs synchronous wallet creation through the Portal's key management
 * system. Unlike transaction-based operations (system/factory creation), this doesn't
 * require async iteration or transaction tracking as wallets are created off-chain.
 *
 * The handler performs the following operations:
 * 1. Verifies the user doesn't already have a wallet
 * 2. Creates a new HD wallet in the SettleMint Portal
 * 3. Updates the user record in the database with the new wallet address
 *
 * @auth Required - User must be authenticated
 * @middleware databaseMiddleware - Provides database connection
 * @middleware portalMiddleware - Provides Portal GraphQL client
 *
 * @param input.messages - Optional custom messages for localization
 *
 * @returns {string} The Ethereum address of the newly created wallet
 *
 * @throws {ORPCError} RESOURCE_ALREADY_EXISTS - If the user already has a wallet
 * @throws {ORPCError} PORTAL_ERROR - If wallet creation fails in the Portal
 *
 * @example
 * ```typescript
 * // Create a wallet for the authenticated user
 * const walletAddress = await client.account.create({});
 * console.log(`Wallet created: ${walletAddress}`);
 *
 * // With custom error messages
 * const walletAddress = await client.account.create({
 *   messages: {
 *     walletAlreadyExists: "You already have a wallet",
 *     walletCreationFailed: "Failed to create wallet"
 *   }
 * });
 * ```
 */
export const create = authRouter.account.create
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async ({ input, context, errors }) => {
    // Auth is guaranteed by authRouter
    const sender = context.auth.user;

    // Parse messages with defaults using Zod schema
    const messages = AccountCreateMessagesSchema.parse(input.messages ?? {});

    if (sender.wallet) {
      // 409 Conflict is more appropriate for "resource already exists"
      throw errors.RESOURCE_ALREADY_EXISTS({
        message: messages.walletAlreadyExists,
      });
    }

    // Note: Unlike transaction operations, wallet creation uses a query instead of mutate
    // because it's a synchronous operation that returns data directly without mining
    const CreateWalletResponseSchema = z.object({
      createWallet: z
        .object({
          address: z.string(),
        })
        .nullable(),
    });

    // Execute the wallet creation query
    const result = await context.portalClient.query(
      CREATE_ACCOUNT_MUTATION,
      {
        userId: sender.id,
        keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
      },
      CreateWalletResponseSchema,
      messages.walletCreationFailed
    );

    if (!result.createWallet?.address) {
      throw errors.PORTAL_ERROR({
        message: messages.walletCreationFailed,
        data: {
          operation: "createWallet",
          details: "Failed to create wallet in portal service",
        },
      });
    }

    // Update the user record with the new wallet address
    await context.db
      .update(user)
      .set({
        wallet: getEthereumAddress(result.createWallet.address),
      })
      .where(eq(user.id, sender.id));

    // Return the newly created wallet address
    return result.createWallet.address;
  });
