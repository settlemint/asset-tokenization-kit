import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { UpdateCollateralInput } from "./update-collateral-schema";

/**
 * GraphQL mutation for updating a stablecoin's collateral amount
 */
// const StableCoinUpdateCollateral = portalGraphql(`
//   mutation StableCoinUpdateCollateral($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinUpdateCollateralInput!) {
//     StableCoinUpdateCollateral(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//       input: $input
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for updating a tokenized deposit's collateral amount
 */
// const DepositUpdateCollateral = portalGraphql(`
//   mutation DepositUpdateCollateral($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: DepositUpdateCollateralInput!) {
//     DepositUpdateCollateral(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//       input: $input
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to update the collateral amount for a token
 *
 * @param input - Validated input containing address, verificationCode, amount, and assettype
 * @param user - The user executing the update collateral operation
 * @returns Array of transaction hashes
 */
export const updateCollateralFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      verificationCode,
      verificationType,
      amount,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: UpdateCollateralInput;
    ctx: { user: User };
  }) => {
    const asset = await getAssetDetail({ address, assettype });

    // Input format for collateral updates
    const collateralInput = {
      amount: parseUnits(amount.toString(), asset.decimals).toString(),
    };

    // Common parameters for collateral update mutations
    const params: VariablesOf<
      typeof StableCoinUpdateCollateral | typeof DepositUpdateCollateral
    > = {
      address,
      from: user.wallet,
      input: collateralInput,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "stablecoin": {
          // const response = await portalClient.request(
  //           StableCoinUpdateCollateral,
  //           params
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinUpdateCollateral?.transactionHash */,
          ])
        );
      }
      case "deposit": {
          // const response = await portalClient.request(
  //           DepositUpdateCollateral,
  //           params
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositUpdateCollateral?.transactionHash */,
          ])
        );
      }
      default:
        throw new Error("Invalid asset type for collateral update");
    }
  }
);
