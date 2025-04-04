import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { WithdrawInput } from "./withdraw-schema";

/**
 * GraphQL mutation for withdrawing the underlying asset of a bond
 */
const BondWithdrawUnderlyingAsset = portalGraphql(`
  mutation BondWithdrawUnderlyingAsset(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: BondWithdrawUnderlyingAssetInput!
  ) {
    BondWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing the underlying asset of a yield schedule
 */
const FixedYieldWithdrawUnderlyingAsset = portalGraphql(`
  mutation FixedYieldWithdrawUnderlyingAsset(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: FixedYieldWithdrawUnderlyingAssetInput!
  ) {
    FixedYieldWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing token from an equity
 */
const EquityWithdrawToken = portalGraphql(`
  mutation EquityWithdrawToken(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: EquityWithdrawTokenInput!
  ) {
    EquityWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a fund
 */
const FundWithdrawToken = portalGraphql(`
  mutation FundWithdrawToken(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: FundWithdrawTokenInput!
  ) {
    FundWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a cryptocurrency
 */
const CryptoCurrencyWithdrawToken = portalGraphql(`
  mutation CryptoCurrencyWithdrawToken(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: CryptoCurrencyWithdrawTokenInput!
  ) {
    CryptoCurrencyWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a stablecoin
 */
const StableCoinWithdrawToken = portalGraphql(`
  mutation StableCoinWithdrawToken(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: StableCoinWithdrawTokenInput!
  ) {
    StableCoinWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a tokenized deposit
 */
const DepositWithdrawToken = portalGraphql(`
  mutation DepositWithdrawToken(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: DepositWithdrawTokenInput!
  ) {
    DepositWithdrawToken(
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
 * Function to withdraw tokens or underlying assets from a contract
 *
 * @param input - Validated input containing address, verificationCode, amount, to, underlyingAssetAddress, and assettype
 * @param user - The user executing the withdraw operation
 * @returns Array of transaction hashes
 */
export const withdrawFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      assettype,
      target,
      targetAddress,
      verificationCode,
      verificationType,
      amount,
      to,
      underlyingAssetAddress,
      underlyingAssetType,
    },
    ctx: { user },
  }: {
    parsedInput: WithdrawInput;
    ctx: { user: User };
  }) => {
    const asset = await getAssetDetail({
      address: underlyingAssetAddress,
      assettype: "cryptocurrency", // Underlying asset is typically a cryptocurrency
    });

    // Token input format (for tokens)
    const tokenInput: VariablesOf<
      | typeof EquityWithdrawToken
      | typeof FundWithdrawToken
      | typeof CryptoCurrencyWithdrawToken
      | typeof StableCoinWithdrawToken
      | typeof DepositWithdrawToken
    >["input"] = {
      token: underlyingAssetAddress,
      to,
      amount: parseUnits(amount.toString(), asset.decimals).toString(),
    };

    // Common parameters for token mutations
    const tokenParams: VariablesOf<
      | typeof EquityWithdrawToken
      | typeof FundWithdrawToken
      | typeof CryptoCurrencyWithdrawToken
      | typeof StableCoinWithdrawToken
      | typeof DepositWithdrawToken
    > = {
      address: targetAddress,
      from: user.wallet,
      input: tokenInput,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
        // Get underlying asset details
        const underlyingAsset = await getAssetDetail({
          address: underlyingAssetAddress,
          assettype: underlyingAssetType,
        });

        if (!underlyingAsset) {
          throw new Error(
            `Missing underlying asset details for ${underlyingAssetType} with address: ${underlyingAssetAddress}`
          );
        }

        const bondFormattedAmount = parseUnits(
          amount.toString(),
          underlyingAsset.decimals
        ).toString();

        if (target === "bond") {
          const response = await portalClient.request(
            BondWithdrawUnderlyingAsset,
            {
              address: targetAddress,
              from: user.wallet,
              input: {
                to,
                amount: bondFormattedAmount,
              },
              ...(await handleChallenge(
                user,
                user.wallet,
                verificationCode,
                verificationType
              )),
            }
          );

          if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
            throw new Error("Failed to get bond withdrawal transaction hash");
          }

          return safeParse(t.Hashes(), [
            response.BondWithdrawUnderlyingAsset.transactionHash,
          ]);
        } else {
          const response = await portalClient.request(
            FixedYieldWithdrawUnderlyingAsset,
            {
              address: targetAddress,
              from: user.wallet,
              input: {
                to,
                amount: bondFormattedAmount,
              },
              ...(await handleChallenge(
                user,
                user.wallet,
                verificationCode,
                verificationType
              )),
            }
          );

          if (!response.FixedYieldWithdrawUnderlyingAsset?.transactionHash) {
            throw new Error(
              "Failed to get yield schedule withdrawal transaction hash"
            );
          }

          return safeParse(t.Hashes(), [
            response.FixedYieldWithdrawUnderlyingAsset.transactionHash,
          ]);
        }
      }
      case "cryptocurrency": {
        const response = await portalClient.request(
          CryptoCurrencyWithdrawToken,
          tokenParams
        );
        return safeParse(t.Hashes(), [
          response.CryptoCurrencyWithdrawToken?.transactionHash,
        ]);
      }
      case "equity": {
        const response = await portalClient.request(
          EquityWithdrawToken,
          tokenParams
        );
        return safeParse(t.Hashes(), [
          response.EquityWithdrawToken?.transactionHash,
        ]);
      }
      case "fund": {
        const response = await portalClient.request(
          FundWithdrawToken,
          tokenParams
        );
        return safeParse(t.Hashes(), [
          response.FundWithdrawToken?.transactionHash,
        ]);
      }
      case "stablecoin": {
        const response = await portalClient.request(
          StableCoinWithdrawToken,
          tokenParams
        );
        return safeParse(t.Hashes(), [
          response.StableCoinWithdrawToken?.transactionHash,
        ]);
      }
      case "deposit": {
        const response = await portalClient.request(
          DepositWithdrawToken,
          tokenParams
        );
        return safeParse(t.Hashes(), [
          response.DepositWithdrawToken?.transactionHash,
        ]);
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
