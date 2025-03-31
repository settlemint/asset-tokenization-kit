import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { EQUITY_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateEquityInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new equity
 *
 * @remarks
 * Creates a new equity contract through the equity factory
 */
const EquityFactoryCreate = portalGraphql(`
  mutation EquityFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, equityCategory: $equityCategory, equityClass: $equityClass}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a equity
 *
 * @remarks
 * Stores additional metadata about the equity in Hasura
 */
const CreateOffchainEquity = hasuraGraphql(`
    mutation CreateOffchainEquity($id: String!, $isin: String) {
      insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
        id
      }
  }
`);

/**
 * Function to create a new equity token
 *
 * @param input - Validated input for creating an equity
 * @param user - The user creating the equity
 * @returns Array of transaction hashes
 */
export const createEquityFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      assetName,
      symbol,
      decimals,
      verificationCode,
      isin,
      equityCategory,
      equityClass,
      predictedAddress,
      price,
      assetAdmins,
    },
    ctx: { user },
  }: {
    parsedInput: CreateEquityInput;
    ctx: { user: User };
  }) => {
    await hasuraClient.request(CreateOffchainEquity, {
      id: predictedAddress,
      isin: isin,
    });

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    });

    const createEquityResult = await portalClient.request(EquityFactoryCreate, {
      address: EQUITY_FACTORY_ADDRESS,
      from: user.wallet,
      name: assetName,
      symbol: symbol.toString(),
      decimals,
      challengeResponse: await handleChallenge(user.wallet, verificationCode),
      equityCategory,
      equityClass,
    });

    const createTxHash =
      createEquityResult.EquityFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error("Failed to create equity: no transaction hash received");
    }

    // Wait for the equity creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    const roleGrantHashes = await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      "equity",
      user
    );

    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);
