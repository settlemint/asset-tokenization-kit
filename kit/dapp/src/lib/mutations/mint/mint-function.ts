import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { MintInput } from "./mint-schema";

/**
 * GraphQL mutation to mint new bond tokens
 */
const BondMint = portalGraphql(`
  mutation BondMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    BondMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new cryptocurrency tokens
 */
const CryptoCurrencyMint = portalGraphql(`
  mutation CryptoCurrencyMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    CryptoCurrencyMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new equity tokens
 */
const EquityMint = portalGraphql(`
  mutation EquityMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    EquityMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new fund tokens
 */
const FundMint = portalGraphql(`
  mutation FundMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    FundMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new stablecoin tokens
 */
const StableCoinMint = portalGraphql(`
  mutation StableCoinMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    StableCoinMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to mint new tokenized deposit tokens
 */
const DepositMint = portalGraphql(`
  mutation DepositMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $verificationId: String) {
    DepositMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to mint new tokens for a specific asset type
 *
 * @param input - Validated input containing address, verificationCode, amount, to, and assettype
 * @param user - The user executing the mint operation
 * @returns Array of transaction hashes
 */
export const mintFunction = withAccessControl(
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
      to,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: MintInput;
    ctx: { user: User };
  }) => {
    // Get token details based on asset type
    const { decimals } = await getAssetDetail({
      address,
      assettype,
    });

    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondMint
      | typeof CryptoCurrencyMint
      | typeof EquityMint
      | typeof FundMint
      | typeof StableCoinMint
      | typeof DepositMint
    > = {
      address,
      from: user.wallet,
      amount: parseUnits(amount.toString(), decimals).toString(),
      to,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
        const response = await portalClient.request(BondMint, params);
        return safeParse(t.Hashes(), [response.BondMint?.transactionHash]);
      }
      case "cryptocurrency": {
        const response = await portalClient.request(CryptoCurrencyMint, params);
        return safeParse(t.Hashes(), [
          response.CryptoCurrencyMint?.transactionHash,
        ]);
      }
      case "equity": {
        const response = await portalClient.request(EquityMint, params);
        return safeParse(t.Hashes(), [response.EquityMint?.transactionHash]);
      }
      case "fund": {
        const response = await portalClient.request(FundMint, params);
        return safeParse(t.Hashes(), [response.FundMint?.transactionHash]);
      }
      case "stablecoin": {
        const response = await portalClient.request(StableCoinMint, params);
        return safeParse(t.Hashes(), [
          response.StableCoinMint?.transactionHash,
        ]);
      }
      case "deposit": {
        const response = await portalClient.request(DepositMint, params);
        return safeParse(t.Hashes(), [response.DepositMint?.transactionHash]);
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
