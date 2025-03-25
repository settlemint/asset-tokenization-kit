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
    target,
    address,
    pincode,
    amount,
    to,
  },
  ctx: { user },
}: {
  parsedInput: WithdrawInput;
  ctx: { user: User };
}) {
  const asset = await getAssetDetail({
    address,
    assettype: "bond"
  });

  const underlyingAssetAddress = target === "bond" ? asset.underlyingAsset.id : asset.yieldSchedule?.underlyingAsset.id;
  const underlyingAssetType = target === "bond" ? asset.underlyingAsset.type as "bond" | "cryptocurrency" | "stablecoin" | "equity" | "fund" | "tokenizeddeposit" :
    asset.yieldSchedule?.underlyingAsset.type as "bond" | "cryptocurrency" | "stablecoin" | "equity" | "fund" | "tokenizeddeposit";
  if (!underlyingAssetAddress) {
    throw new Error(`Missing ${target === "bond" ? "underlying" : "yield underlying"} asset address`);
  }

  const underlyingAsset = await getAssetDetail({
    address: underlyingAssetAddress,
    assettype: underlyingAssetType
  });
  if (!underlyingAsset) {
    throw new Error(`Missing ${target === "bond" ? "underlying" : "yield underlying"} asset address`);
  }

  const spender = target === "bond" ? address : asset.yieldSchedule?.id;
  if (!spender) {
    throw new Error(`Missing ${target === "bond" ? "bond" : "yield schedule"} address`);
  }

  const formattedAmount = parseUnits(
    amount.toString(),
    asset.decimals
  ).toString();

  if (target === "bond") {
    const response = await portalClient.request(BondWithdrawUnderlyingAsset, {
      address: spender,
      from: user.wallet,
      input: {
        to,
        amount: formattedAmount,
      },
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
      throw new Error("Failed to get transaction hash");
    }

    return safeParse(t.Hashes(), [
      response.BondWithdrawUnderlyingAsset.transactionHash,
    ]);
  } else {
    const response = await portalClient.request(FixedYieldWithdrawUnderlyingAsset, {
      address: spender,
      from: user.wallet,
      input: {
        to,
        amount: formattedAmount,
      },
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    if (!response.FixedYieldWithdrawUnderlyingAsset?.transactionHash) {
      throw new Error("Failed to get transaction hash");
    }

    return safeParse(t.Hashes(), [
      response.FixedYieldWithdrawUnderlyingAsset.transactionHash,
    ]);
  }
}
