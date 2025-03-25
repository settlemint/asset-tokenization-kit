import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from '@/lib/utils/typebox';
import { parseUnits } from "viem";
import type { WithdrawInput } from "./withdraw-schema";

/**
 * GraphQL mutation for withdrawing the underlying asset of a bond
 */
const BondWithdrawUnderlyingAsset = portalGraphql(`
  mutation BondWithdrawUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondWithdrawUnderlyingAssetInput!
  ) {
    BondWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing the underlying asset of a yield schedule
 */
const FixedYieldWithdrawUnderlyingAsset = portalGraphql(`
  mutation FixedYieldWithdrawUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FixedYieldWithdrawUnderlyingAssetInput!
  ) {
    FixedYieldWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing token from an equity
 */
const EquityWithdrawToken = portalGraphql(`
  mutation EquityWithdrawToken(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: EquityWithdrawTokenInput!
  ) {
    EquityWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a fund
 */
const FundWithdrawToken = portalGraphql(`
  mutation FundWithdrawToken(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FundWithdrawTokenInput!
  ) {
    FundWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a cryptocurrency
 */
const CryptoCurrencyWithdrawToken = portalGraphql(`
  mutation CryptoCurrencyWithdrawToken(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: CryptoCurrencyWithdrawTokenInput!
  ) {
    CryptoCurrencyWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a stablecoin
 */
const StableCoinWithdrawToken = portalGraphql(`
  mutation StableCoinWithdrawToken(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: StableCoinWithdrawTokenInput!
  ) {
    StableCoinWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a tokenized deposit
 */
const TokenizedDepositWithdrawToken = portalGraphql(`
  mutation TokenizedDepositWithdrawToken(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: TokenizedDepositWithdrawTokenInput!
  ) {
    TokenizedDepositWithdrawToken(
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
 * Function to withdraw tokens or underlying assets from a contract
 *
 * @param input - Validated input containing address, pincode, amount, to, underlyingAssetAddress, and assettype
 * @param user - The user executing the withdraw operation
 * @returns Array of transaction hashes
 */
export async function withdrawFunction({
  parsedInput: {
    assettype,
    target,
    targetAddress,
    pincode,
    amount,
    to,
    underlyingAssetAddress,
    underlyingAssetType
  },
  ctx: { user },
}: {
  parsedInput: WithdrawInput;
  ctx: { user: User };
}) {
  const asset = await getAssetDetail({
    address: underlyingAssetAddress,
    assettype: "cryptocurrency", // Underlying asset is typically a cryptocurrency
  });

  // Token input format (for tokens)
  const tokenInput = {
    token: underlyingAssetAddress,
    to,
    amount: parseUnits(amount.toString(), asset.decimals).toString(),
  };

  // Common parameters for token mutations
  const tokenParams = {
    address: targetAddress,
    from: user.wallet,
    input: tokenInput,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "bond": {
      // Get underlying asset details
      const underlyingAsset = await getAssetDetail({
        address: underlyingAssetAddress,
        assettype: underlyingAssetType
      });

      if (!underlyingAsset) {
        throw new Error(`Missing underlying asset details for ${underlyingAssetType} with address: ${underlyingAssetAddress}`);
      }

      const bondFormattedAmount = parseUnits(
        amount.toString(),
        underlyingAsset.decimals
      ).toString();


      if (target === "bond") {
        const response = await portalClient.request(BondWithdrawUnderlyingAsset, {
          address: targetAddress,
          from: user.wallet,
          input: {
            to,
            amount: bondFormattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get bond withdrawal transaction hash");
        }

        return safeParse(t.Hashes(), [response.BondWithdrawUnderlyingAsset.transactionHash]);
      } else {
        const response = await portalClient.request(FixedYieldWithdrawUnderlyingAsset, {
          address: targetAddress,
          from: user.wallet,
          input: {
            to,
            amount: bondFormattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.FixedYieldWithdrawUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get yield schedule withdrawal transaction hash");
        }

        return safeParse(t.Hashes(), [response.FixedYieldWithdrawUnderlyingAsset.transactionHash]);
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
    case "tokenizeddeposit": {
      const response = await portalClient.request(
        TokenizedDepositWithdrawToken,
        tokenParams
      );
      return safeParse(t.Hashes(), [
        response.TokenizedDepositWithdrawToken?.transactionHash,
      ]);
    }
    default:
      throw new Error("Invalid asset type");
  }
}
