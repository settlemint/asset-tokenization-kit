import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { formatDate } from "@/lib/utils/date";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateBondInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new bond
 *
 * @remarks
 * Creates a new bond contract through the bond factory
 */
const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, cap: $cap, faceValue: $faceValue, maturityDate: $maturityDate, underlyingAsset: $underlyingAsset}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a bond
 *
 * @remarks
 * Stores additional metadata about the bond in Hasura
 */
const CreateOffchainBond = hasuraGraphql(`
  mutation CreateOffchainBond($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}) {
      id
    }
  }
`);

/**
 * Function to create a new bond
 *
 * @param input - Validated input for creating the bond
 * @param user - The user creating the bond
 * @returns The transaction hash
 */
export const createBondFunction = withAccessControl(
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
      verificationType,
      isin,
      cap,
      faceValue,
      maturityDate,
      underlyingAsset,
      predictedAddress,
      price,
      assetAdmins,
    },
    ctx: { user },
  }: {
    parsedInput: CreateBondInput;
    ctx: { user: User };
  }) => {
    const capExact = String(parseUnits(String(cap), decimals));
    const maturityDateTimestamp = formatDate(maturityDate, {
      type: "unixSeconds",
      locale: "en",
    });

    await hasuraClient.request(CreateOffchainBond, {
      id: predictedAddress,
      isin: isin,
    });

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    });

    const createBondResult = await portalClient.request(BondFactoryCreate, {
      address: BOND_FACTORY_ADDRESS,
      from: user.wallet,
      name: assetName,
      symbol: String(symbol),
      decimals,
      cap: capExact,
      faceValue: String(faceValue),
      maturityDate: maturityDateTimestamp,
      underlyingAsset: underlyingAsset.id,
      challengeResponse: await handleChallenge(
        user.wallet,
        verificationCode,
        verificationType
      ),
    });

    const createTxHash = createBondResult.BondFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error("Failed to create bond: no transaction hash received");
    }

    // Wait for the stablecoin creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    const roleGrantHashes = await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      "bond",
      user
    );
    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);
