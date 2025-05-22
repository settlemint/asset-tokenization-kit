import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-hasura";
import { parseUnits } from "viem";
import type { TopUpInput } from "./top-up-schema";

/**
 * GraphQL mutations for approving token spending for each asset type
 */
const BondApprove = portalGraphql(`
  mutation BondApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: BondApproveInput!
  ) {
    BondApprove(
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

const CryptoCurrencyApprove = portalGraphql(`
  mutation CryptoCurrencyApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: CryptoCurrencyApproveInput!
  ) {
    CryptoCurrencyApprove(
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

const EquityApprove = portalGraphql(`
  mutation EquityApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: EquityApproveInput!
  ) {
    EquityApprove(
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

const FundApprove = portalGraphql(`
  mutation FundApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: FundApproveInput!
  ) {
    FundApprove(
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

const StableCoinApprove = portalGraphql(`
  mutation StableCoinApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: StableCoinApproveInput!
  ) {
    StableCoinApprove(
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

const DepositApprove = portalGraphql(`
  mutation DepositApprove(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: DepositApproveInput!
  ) {
    DepositApprove(
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
 * GraphQL mutation for topping up the underlying asset of a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondTopUpUnderlyingAsset = portalGraphql(`
  mutation TopUpUnderlyingAsset(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: BondTopUpUnderlyingAssetInput!
  ) {
    BondTopUpUnderlyingAsset(
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
 * GraphQL mutation for topping up the underlying asset of a yield schedule
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FixedYieldTopUpUnderlyingAsset = portalGraphql(`
  mutation FixedYieldTopUpUnderlyingAsset(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: FixedYieldTopUpUnderlyingAssetInput!
  ) {
    FixedYieldTopUpUnderlyingAsset(
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
      verificationCode,
      verificationType,
      bondAddress,
      underlyingAssetAddress,
    },
    ctx: { user },
  }: {
    parsedInput: TopUpInput;
    ctx: { user: User };
  }) => {
    const isYield = target === "yield";

    const bondDetails = await getAssetDetail({
      address: bondAddress,
      assettype: "bond",
    }) as Awaited<ReturnType<typeof getBondDetail>>;
    if (!bondDetails) {
      throw new Error("Missing bond details");
    }
    if (isYield && !bondDetails.yieldSchedule) {
      throw new Error("Bond does not have a yield schedule");
    }

    const formattedAmount = parseUnits(
      amount.toString(),
      isYield ? bondDetails.yieldSchedule!.underlyingAsset.decimals : bondDetails.underlyingAsset.decimals
    ).toString();

    const spender = isYield ? bondDetails.yieldSchedule!.id : bondDetails.id;

    // Common parameters for all approve mutations
    const approveParams: VariablesOf<
      | typeof BondApprove
      | typeof CryptoCurrencyApprove
      | typeof EquityApprove
      | typeof FundApprove
      | typeof StableCoinApprove
      | typeof DepositApprove
    > = {
      address: underlyingAssetAddress,
      from: user.wallet,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      input: {
        spender,
        value: formattedAmount,
      },
    };

    // Approve spending of the underlying asset based on asset type
    let approvalTxHash;

    switch (bondDetails.underlyingAsset.type) {
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
    if (isYield) {
      const response = await portalClient.request(
        FixedYieldTopUpUnderlyingAsset,
        {
          address: spender,
          from: user.wallet,
          input: {
            amount: formattedAmount,
          },
          ...(await handleChallenge(
            user,
            user.wallet,
            verificationCode,
            verificationType
          )),
        }
      );

      if (!response.FixedYieldTopUpUnderlyingAsset?.transactionHash) {
        throw new Error("Failed to get transaction hash");
      }

      return safeParse(t.Hashes(), [
        response.FixedYieldTopUpUnderlyingAsset.transactionHash,
      ]);
    } else {
      const response = await portalClient.request(BondTopUpUnderlyingAsset, {
        address: spender,
        from: user.wallet,
        input: {
          amount: formattedAmount,
        },
        ...(await handleChallenge(
          user,
          user.wallet,
          verificationCode,
          verificationType
        )),
      });

      if (!response.BondTopUpUnderlyingAsset?.transactionHash) {
        throw new Error("Failed to get transaction hash");
      }

      return safeParse(t.Hashes(), [
        response.BondTopUpUnderlyingAsset.transactionHash,
      ]);
    }
  }
);
