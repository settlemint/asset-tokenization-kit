import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { UpdateCollateralInput } from "./update-collateral-schema";

/**
 * GraphQL mutation for updating a stablecoin's collateral amount
 */
const StableCoinUpdateCollateral = portalGraphql(`
  mutation StableCoinUpdateCollateral($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinUpdateCollateralInput!) {
    StableCoinUpdateCollateral(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for updating a tokenized deposit's collateral amount
 */
const DepositUpdateCollateral = portalGraphql(`
  mutation DepositUpdateCollateral($address: String!, $from: String!, $challengeResponse: String!, $input: DepositUpdateCollateralInput!) {
    DepositUpdateCollateral(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to update the collateral amount for a token
 *
 * @param input - Validated input containing address, pincode, amount, and assettype
 * @param user - The user executing the update collateral operation
 * @returns Array of transaction hashes
 */
export async function updateCollateralFunction({
  parsedInput: { address, pincode, amount, assettype },
  ctx: { user },
}: {
  parsedInput: UpdateCollateralInput;
  ctx: { user: User };
}) {
  const asset = await getAssetDetail({ address, assettype });

  // Input format for collateral updates
  const collateralInput = {
    amount: parseUnits(amount.toString(), asset.decimals).toString(),
  };

  // Common parameters for collateral update mutations
  const params = {
    address,
    from: user.wallet,
    input: collateralInput,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "stablecoin": {
      const response = await portalClient.request(
        StableCoinUpdateCollateral,
        params
      );
      return safeParse(t.Hashes(), [
        response.StableCoinUpdateCollateral?.transactionHash,
      ]);
    }
    case "deposit": {
      const response = await portalClient.request(
        DepositUpdateCollateral,
        params
      );
      return safeParse(t.Hashes(), [
        response.DepositUpdateCollateral?.transactionHash,
      ]);
    }
    default:
      throw new Error("Invalid asset type for collateral update");
  }
}
