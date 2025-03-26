import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { FreezeInput } from "./freeze-schema";

/**
 * GraphQL mutation to freeze a specific user account from a bond
 */
const BondFreeze = portalGraphql(`
  mutation BondFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    BondFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from an equity
 */
const EquityFreeze = portalGraphql(`
  mutation EquityFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    EquityFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a fund
 */
const FundFreeze = portalGraphql(`
  mutation FundFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    FundFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a stablecoin
 */
const StableCoinFreeze = portalGraphql(`
  mutation StableCoinFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    StableCoinFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a tokenized deposit
 */
const DepositFreeze = portalGraphql(`
  mutation DepositFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    DepositFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to freeze a specific amount of tokens for a user
 *
 * @param input - Validated input containing address, pincode, userAddress, amount, and assettype
 * @param user - The user executing the freeze operation
 * @returns Array of transaction hashes
 */
export async function freezeFunction({
  parsedInput: { address, pincode, userAddress, amount, assettype },
  ctx: { user },
}: {
  parsedInput: FreezeInput;
  ctx: { user: User };
}) {
  // Get token details based on asset type
  const { decimals } = await getAssetDetail({
    address,
    assettype,
  });

  // Common parameters for all mutations
  const params = {
    address,
    user: userAddress,
    from: user.wallet,
    amount: parseUnits(amount.toString(), decimals).toString(),
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "bond": {
      const response = await portalClient.request(BondFreeze, params);
      return safeParse(t.Hashes(), [response.BondFreeze?.transactionHash]);
    }
    case "cryptocurrency": {
      throw new Error("Cryptocurrency does not support freeze operations");
    }
    case "equity": {
      const response = await portalClient.request(EquityFreeze, params);
      return safeParse(t.Hashes(), [response.EquityFreeze?.transactionHash]);
    }
    case "fund": {
      const response = await portalClient.request(FundFreeze, params);
      return safeParse(t.Hashes(), [response.FundFreeze?.transactionHash]);
    }
    case "stablecoin": {
      const response = await portalClient.request(StableCoinFreeze, params);
      return safeParse(t.Hashes(), [
        response.StableCoinFreeze?.transactionHash,
      ]);
    }
    case "deposit": {
      const response = await portalClient.request(DepositFreeze, params);
      return safeParse(t.Hashes(), [response.DepositFreeze?.transactionHash]);
    }
    default:
      throw new Error("Invalid asset type");
  }
}
