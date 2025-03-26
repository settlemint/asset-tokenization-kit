import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { TOKENIZED_DEPOSIT_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateDepositInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new tokenized deposit
 *
 * @remarks
 * Creates a new tokenized deposit contract through the tokenized deposit factory
 */
const DepositFactoryCreate = portalGraphql(`
  mutation DepositFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $collateralLivenessSeconds: Float!) {
    DepositFactoryCreate(
      address: $address
      from: $from
      input: { name: $name, symbol: $symbol, decimals: $decimals, collateralLivenessSeconds: $collateralLivenessSeconds}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a tokenized deposit
 *
 * @remarks
 * Stores additional metadata about the tokenized deposit in Hasura
 */
const CreateOffchainDeposit = hasuraGraphql(`
  mutation CreateOffchainDeposit($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

/**
 * Function to create a new tokenized deposit token
 *
 * @param input - Validated input for creating a tokenized deposit
 * @param user - The user creating the tokenized deposit
 * @returns Array of transaction hashes
 */
export async function createDepositFunction({
  parsedInput: {
    assetName,
    symbol,
    decimals,
    collateralLivenessValue,
    collateralLivenessTimeUnit,
    pincode,
    isin,
    predictedAddress,
    price,
  },
  ctx: { user },
}: {
  parsedInput: CreateDepositInput;
  ctx: { user: User };
}) {
  await hasuraClient.request(CreateOffchainDeposit, {
    id: predictedAddress,
    isin,
  });

  await hasuraClient.request(AddAssetPrice, {
    assetId: predictedAddress,
    amount: String(price.amount),
    currency: price.currency,
  });

  const collateralLivenessSeconds =
    collateralLivenessValue * getTimeUnitSeconds(collateralLivenessTimeUnit);

  const data = await portalClient.request(DepositFactoryCreate, {
    address: TOKENIZED_DEPOSIT_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: symbol.toString(),
    decimals,
    collateralLivenessSeconds,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  return safeParse(t.Hashes(), [data.DepositFactoryCreate?.transactionHash]);
}
