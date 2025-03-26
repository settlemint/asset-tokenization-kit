import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { TopUpInput } from "./top-up-schema";

/**
 * GraphQL mutations for approving token spending for each asset type
 */
const BondApprove = portalGraphql(`
  mutation BondApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondApproveInput!
  ) {
    BondApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const CryptoCurrencyApprove = portalGraphql(`
  mutation CryptoCurrencyApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: CryptoCurrencyApproveInput!
  ) {
    CryptoCurrencyApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const EquityApprove = portalGraphql(`
  mutation EquityApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: EquityApproveInput!
  ) {
    EquityApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const FundApprove = portalGraphql(`
  mutation FundApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FundApproveInput!
  ) {
    FundApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const StableCoinApprove = portalGraphql(`
  mutation StableCoinApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: StableCoinApproveInput!
  ) {
    StableCoinApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const DepositApprove = portalGraphql(`
  mutation DepositApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: DepositApproveInput!
  ) {
    DepositApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for topping up the underlying asset of a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondTopUpUnderlyingAsset = portalGraphql(`
  mutation TopUpUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondTopUpUnderlyingAssetInput!
  ) {
    BondTopUpUnderlyingAsset(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for topping up the underlying asset of a yield schedule
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FixedYieldTopUpUnderlyingAsset = portalGraphql(`
  mutation FixedYieldTopUpUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FixedYieldTopUpUnderlyingAssetInput!
  ) {
    FixedYieldTopUpUnderlyingAsset(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to top up the underlying asset of a bond
 *
 * @param input - Validated input for topping up the bond
 * @param user - The user initiating the top up operation
 * @returns The transaction hash
 */
export const topUpUnderlyingAssetFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      target,
      amount,
      pincode,
      targetAddress,
      underlyingAssetAddress,
      underlyingAssetType,
    },
    ctx: { user },
  }: {
    parsedInput: TopUpInput;
    ctx: { user: User };
  }) => {
    const asset = await getAssetDetail({
      address: targetAddress,
      assettype: "bond",
    });

    if (!asset) {
      throw new Error("Missing asset details");
    }

    const underlyingAsset = await getAssetDetail({
      address: underlyingAssetAddress,
      assettype: underlyingAssetType,
    });

    if (!underlyingAsset) {
      throw new Error(
        `Missing underlying asset details for ${underlyingAssetType} with address: ${underlyingAssetAddress}`
      );
    }

    const formattedAmount = parseUnits(
      amount.toString(),
      underlyingAsset.decimals
    ).toString();

    // Common parameters for all approve mutations
    const approveParams = {
      address: underlyingAssetAddress,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
      input: {
        spender: targetAddress,
        value: formattedAmount,
      },
    };

    // Approve spending of the underlying asset based on asset type
    let approvalTxHash;

    switch (underlyingAssetType) {
      case "bond": {
        const response = await portalClient.request(BondApprove, approveParams);
        approvalTxHash = response.BondApprove?.transactionHash;
        break;
      }
      case "cryptocurrency": {
        const response = await portalClient.request(
          CryptoCurrencyApprove,
          approveParams
        );
        approvalTxHash = response.CryptoCurrencyApprove?.transactionHash;
        break;
      }
      case "equity": {
        const response = await portalClient.request(
          EquityApprove,
          approveParams
        );
        approvalTxHash = response.EquityApprove?.transactionHash;
        break;
      }
      case "fund": {
        const response = await portalClient.request(FundApprove, approveParams);
        approvalTxHash = response.FundApprove?.transactionHash;
        break;
      }
      case "stablecoin": {
        const response = await portalClient.request(
          StableCoinApprove,
          approveParams
        );
        approvalTxHash = response.StableCoinApprove?.transactionHash;
        break;
      }
      case "deposit": {
        const response = await portalClient.request(
          DepositApprove,
          approveParams
        );
        approvalTxHash = response.DepositApprove?.transactionHash;
        break;
      }
      default:
        throw new Error("Invalid asset type");
    }

    if (!approvalTxHash) {
      throw new Error("Failed to approve spending of the underlying asset");
    }

    // Wait for the approval transaction to be confirmed before proceeding
    await waitForTransactions([approvalTxHash]);

    // Top up either the bond or the yield schedule
    if (target === "bond") {
      const response = await portalClient.request(BondTopUpUnderlyingAsset, {
        address: targetAddress,
        from: user.wallet,
        input: {
          amount: formattedAmount,
        },
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      if (!response.BondTopUpUnderlyingAsset?.transactionHash) {
        throw new Error("Failed to get transaction hash");
      }

      return safeParse(t.Hashes(), [
        response.BondTopUpUnderlyingAsset.transactionHash,
      ]);
    } else {
      const response = await portalClient.request(
        FixedYieldTopUpUnderlyingAsset,
        {
          address: targetAddress,
          from: user.wallet,
          input: {
            amount: formattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        }
      );

      if (!response.FixedYieldTopUpUnderlyingAsset?.transactionHash) {
        throw new Error("Failed to get transaction hash");
      }

      return safeParse(t.Hashes(), [
        response.FixedYieldTopUpUnderlyingAsset.transactionHash,
      ]);
    }
  }
);
