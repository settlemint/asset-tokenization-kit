import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { UnpauseInput } from "./unpause-schema";

/**
 * GraphQL mutation for unpausing a bond contract
 */
const BondUnpause = portalGraphql(`
  mutation BondUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    BondUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing an equity contract
 */
const EquityUnpause = portalGraphql(`
  mutation EquityUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    EquityUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a fund contract
 */
const FundUnpause = portalGraphql(`
  mutation FundUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    FundUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a stablecoin contract
 */
const StableCoinUnpause = portalGraphql(`
  mutation StableCoinUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for unpausing a tokenized deposit contract
 */
const TokenizedDepositUnpause = portalGraphql(`
  mutation TokenizedDepositUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to unpause a token contract
 *
 * @param input - Validated input containing address, pincode, and assettype
 * @param user - The user executing the unpause operation
 * @returns Array of transaction hashes
 */
export async function unpauseFunction({
  parsedInput: { address, pincode, assettype },
  ctx: { user },
}: {
  parsedInput: UnpauseInput;
  ctx: { user: User };
}) {
  // Common parameters for all mutations
  const params = {
    address,
    from: user.wallet,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "bond": {
      const response = await portalClient.request(BondUnpause, params);
      return safeParse(t.Hashes(), [response.BondUnpause?.transactionHash]);
    }
    case "cryptocurrency": {
      throw new Error("Cryptocurrency does not support unpause operations");
    }
    case "equity": {
      const response = await portalClient.request(EquityUnpause, params);
      return safeParse(t.Hashes(), [response.EquityUnpause?.transactionHash]);
    }
    case "fund": {
      const response = await portalClient.request(FundUnpause, params);
      return safeParse(t.Hashes(), [response.FundUnpause?.transactionHash]);
    }
    case "stablecoin": {
      const response = await portalClient.request(StableCoinUnpause, params);
      return safeParse(t.Hashes(), [
        response.StableCoinUnpause?.transactionHash,
      ]);
    }
    case "tokenizeddeposit": {
      const response = await portalClient.request(
        TokenizedDepositUnpause,
        params
      );
      return safeParse(t.Hashes(), [
        response.TokenizedDepositUnpause?.transactionHash,
      ]);
    }
    default:
      throw new Error("Invalid asset type");
  }
}
