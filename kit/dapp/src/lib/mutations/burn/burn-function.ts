import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { BurnInput } from "./burn-schema";

/**
 * GraphQL mutation for burning bond tokens
 */
const BondBurn = portalGraphql(`
  mutation BondBurn($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondBurnInput!) {
    BondBurn(
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
 * GraphQL mutation for burning equity tokens
 */
const EquityBurn = portalGraphql(`
  mutation EquityBurn($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: EquityBurnInput!) {
    EquityBurn(
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
 * GraphQL mutation for burning fund tokens
 */
const FundBurn = portalGraphql(`
  mutation FundBurn($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: FundBurnInput!) {
    FundBurn(
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
 * GraphQL mutation for burning stablecoin tokens
 */
const StableCoinBurn = portalGraphql(`
  mutation StableCoinBurn($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinBurnInput!) {
    StableCoinBurn(
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
 * GraphQL mutation for burning tokenized deposit tokens
 */
const DepositBurn = portalGraphql(`
  mutation DepositBurn($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: DepositBurnInput!) {
    DepositBurn(
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
 * Function to burn tokens of different asset types
 *
 * @param input - Validated input for burning tokens
 * @param user - The user initiating the burn operation
 * @returns The transaction hash
 */
export const burnFunction = async ({
  parsedInput: {
    address,
    verificationCode,
    verificationType,
    amount,
    assettype,
  },
  ctx: { user },
}: {
  parsedInput: BurnInput;
  ctx: { user: User };
}) => {
  // Get token details based on asset type
  const { decimals } = await getAssetDetail({
    address,
    assettype,
  });

  // Common parameters for all mutations
  const params: VariablesOf<
    | typeof BondBurn
    | typeof EquityBurn
    | typeof FundBurn
    | typeof StableCoinBurn
    | typeof DepositBurn
  > = {
    address,
    from: user.wallet,
    input: {
      value: parseUnits(amount.toString(), decimals).toString(),
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  };

  switch (assettype) {
    case "bond": {
      const response = await portalClient.request(BondBurn, params);
      return safeParse(t.Hashes(), [response.BondBurn?.transactionHash]);
    }
    case "cryptocurrency": {
      throw new Error("Cryptocurrency does not support burn operations");
    }
    case "equity": {
      const response = await portalClient.request(EquityBurn, params);
      return safeParse(t.Hashes(), [response.EquityBurn?.transactionHash]);
    }
    case "fund": {
      const response = await portalClient.request(FundBurn, params);
      return safeParse(t.Hashes(), [response.FundBurn?.transactionHash]);
    }
    case "stablecoin": {
      const response = await portalClient.request(StableCoinBurn, params);
      return safeParse(t.Hashes(), [response.StableCoinBurn?.transactionHash]);
    }
    case "deposit": {
      const response = await portalClient.request(DepositBurn, params);
      return safeParse(t.Hashes(), [response.DepositBurn?.transactionHash]);
    }
    default:
      throw new Error("Invalid asset type");
  }
};
