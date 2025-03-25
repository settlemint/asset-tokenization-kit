import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { AddAssetPrice } from "@/lib/mutations/asset/price/add-price";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { CreateCryptoCurrencyInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const CryptoCurrencyFactoryCreate = portalGraphql(`
  mutation CryptoCurrencyFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $initialSupply: String!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, initialSupply: $initialSupply}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a cryptocurrency
 *
 * @remarks
 * Stores additional metadata about the cryptocurrency in Hasura
 */
const CreateOffchainCryptoCurrency = hasuraGraphql(`
  mutation CreateOffchainCryptoCurrency($id: String!) {
    insert_asset_one(object: {id: $id}) {
      id
    }
  }
`);

/**
 * Function to create a new cryptocurrency
 *
 * @param input - Validated input for creating the cryptocurrency
 * @param user - The user creating the cryptocurrency
 * @returns The transaction hash
 */
export async function createCryptoCurrencyFunction({
  parsedInput: {
    assetName,
    symbol,
    decimals,
    pincode,
    initialSupply,
    predictedAddress,
    price,
  },
  ctx: { user },
}: {
  parsedInput: CreateCryptoCurrencyInput;
  ctx: { user: User };
}) {
  const initialSupplyExact = String(
    parseUnits(String(initialSupply), decimals)
  );

  await hasuraClient.request(CreateOffchainCryptoCurrency, {
    id: predictedAddress,
  });

  await hasuraClient.request(AddAssetPrice, {
    assetId: predictedAddress,
    amount: String(price.amount),
    currency: price.currency,
  });

  const data = await portalClient.request(CryptoCurrencyFactoryCreate, {
    address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: String(symbol),
    decimals,
    initialSupply: initialSupplyExact,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  const transactionHash = data.CryptoCurrencyFactoryCreate?.transactionHash;

  return safeParse(t.Hashes(), [transactionHash]);
}
