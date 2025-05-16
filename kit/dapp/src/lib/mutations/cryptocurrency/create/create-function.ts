import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { AddAssetPrice } from "@/lib/mutations/asset/price/add-price";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
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
  mutation CryptoCurrencyFactoryCreate(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: CryptoCurrencyFactoryCreateInput!
  ) {
    CryptoCurrencyFactoryCreate(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
      input: $input
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
export const createCryptoCurrencyFunction = withAccessControl(
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
      isin,
      internalid,
      verificationCode,
      verificationType,
      initialSupply,
      predictedAddress,
      price,
      assetAdmins,
    },
    ctx: { user },
  }: {
    parsedInput: CreateCryptoCurrencyInput;
    ctx: { user: User };
  }) => {
    const initialSupplyExact = String(
      parseUnits(String(initialSupply), decimals)
    );

    await hasuraClient.request(CreateOffchainCryptoCurrency, {
      id: predictedAddress,
      isin: isin,
      internalid: internalid,
    });

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    });

    const createCryptoCurrencyResult = await portalClient.request(
      CryptoCurrencyFactoryCreate,
      {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        from: user.wallet,
        input: {
          name: assetName,
          symbol: String(symbol),
          decimals,
          initialSupply: initialSupplyExact,
        },
        ...(await handleChallenge(
          user,
          user.wallet,
          verificationCode,
          verificationType
        )),
      }
    );

    const createTxHash =
      createCryptoCurrencyResult.CryptoCurrencyFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error(
        "Failed to create cryptocurrency: no transaction hash received"
      );
    }

    const hasMoreAdmins = assetAdmins.length > 0;

    if (!hasMoreAdmins) {
      return safeParse(t.Hashes(), [createTxHash]);
    }

    // Wait for the creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    const roleGrantHashes = await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      verificationType,
      "cryptocurrency",
      user
    );

    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);
