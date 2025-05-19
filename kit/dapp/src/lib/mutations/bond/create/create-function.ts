import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { AddAssetPrice } from "@/lib/mutations/asset/price/add-price";
import { getAssetsPrice } from "@/lib/queries/asset-price/asset-price";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { formatDate } from "@/lib/utils/date";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { CreateBondInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new bond
 *
 * @remarks
 * Creates a new bond contract through the bond factory
 */
const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: BondFactoryCreateInput!
  ) {
    BondFactoryCreate(
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
 * GraphQL mutation for creating off-chain metadata for a bond
 *
 * @remarks
 * Stores additional metadata about the bond in Hasura
 */
const CreateOffchainBond = hasuraGraphql(`
  mutation CreateOffchainBond($id: String!, $isin: String, $internalid: String) {
    insert_asset_one(object: {id: $id, isin: $isin, internalid: $internalid}) {
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
      internalid,
      cap,
      faceValue,
      maturityDate,
      underlyingAsset,
      predictedAddress,
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
      internalid: internalid,
    });

    const underlyingAssetPrice = (
      await getAssetsPrice([underlyingAsset.id])
    ).get(underlyingAsset.id);

    if (!underlyingAssetPrice) {
      throw new Error(
        `Price not found for underlying asset, ${underlyingAsset.id}`
      );
    }

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(underlyingAssetPrice.amount * faceValue),
      currency: underlyingAssetPrice.currency,
    });

    const createBondResult = await portalClient.request(BondFactoryCreate, {
      address: BOND_FACTORY_ADDRESS,
      from: user.wallet,
      input: {
        name: assetName,
        symbol: String(symbol),
        decimals,
        cap: capExact,
        faceValue: String(faceValue),
        maturityDate: maturityDateTimestamp,
        underlyingAsset: underlyingAsset.id,
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    });

    const createTxHash = createBondResult.BondFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error("Failed to create bond: no transaction hash received");
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
      "bond",
      user
    );
    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);
