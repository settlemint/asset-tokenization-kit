import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { grantRoleFunction } from "../../asset/access-control/grant-role/grant-role-function";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateFundInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new fund
 *
 * @remarks
 * Creates a new fund contract through the fund factory
 */
const FundFactoryCreate = portalGraphql(`
  mutation FundFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, fundCategory: $fundCategory, fundClass: $fundClass, managementFeeBps: $managementFeeBps}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a fund
 *
 * @remarks
 * Stores additional metadata about the fund in Hasura
 */
const CreateOffchainFund = hasuraGraphql(`
  mutation CreateOffchainFund($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
      isin
    }
  }
`);

/**
 * Function to create a new fund token
 *
 * @param input - Validated input for creating a fund
 * @param user - The user creating the fund
 * @returns Array of transaction hashes
 */
export async function createFundFunction({
  parsedInput: {
    assetName,
    symbol,
    decimals,
    pincode,
    isin,
    fundCategory,
    fundClass,
    managementFeeBps,
    predictedAddress,
    price,
    tokenAdmins,
  },
  ctx: { user },
}: {
  parsedInput: CreateFundInput;
  ctx: { user: User };
}) {
  await hasuraClient.request(CreateOffchainFund, {
    id: predictedAddress,
    isin,
  });

  await hasuraClient.request(AddAssetPrice, {
    assetId: predictedAddress,
    amount: String(price.amount),
    currency: price.currency,
  });

  const data = await portalClient.request(FundFactoryCreate, {
    address: FUND_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: symbol.toString(),
    decimals,
    challengeResponse: await handleChallenge(user.wallet, pincode),
    fundCategory,
    fundClass,
    managementFeeBps,
  });

  const createTxHash = data.FundFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create fund: no transaction hash received");
  }

  await waitForTransactions([createTxHash]);

  // After fund is created, grant roles to admins in parallel
  const grantRolePromises = tokenAdmins.map(async (admin) => {
    const roles = {
      DEFAULT_ADMIN_ROLE: admin.roles.includes("admin"),
      SUPPLY_MANAGEMENT_ROLE: admin.roles.includes("issuer"),
      USER_MANAGEMENT_ROLE: admin.roles.includes("user-manager"),
    };

    return grantRoleFunction({
      parsedInput: {
        address: predictedAddress,
        roles,
        userAddress: admin.wallet,
        pincode,
        assettype: "stablecoin",
      },
      ctx: { user },
    });
  });

  // Get all role grant transaction hashes
  const grantRoleResults = await Promise.all(grantRolePromises);
  const roleGrantHashes = grantRoleResults.flatMap((result) => result);

  // Combine all transaction hashes
  const allTransactionHashes = [createTxHash, ...roleGrantHashes];

  return safeParse(t.Hashes(), [data.FundFactoryCreate?.transactionHash]);
}
