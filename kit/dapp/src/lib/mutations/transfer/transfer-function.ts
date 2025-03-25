import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { TransferInput } from "./transfer-schema";

/**
 * GraphQL mutation to transfer bond tokens
 */
const BondTransfer = portalGraphql(`
  mutation BondTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: BondTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer cryptocurrency tokens
 */
const CryptoCurrencyTransfer = portalGraphql(`
  mutation CryptoCurrencyTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: CryptoCurrencyTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer equity tokens
 */
const EquityTransfer = portalGraphql(`
  mutation EquityTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: EquityTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer fund tokens
 */
const FundTransfer = portalGraphql(`
  mutation FundTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: FundTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer stablecoin tokens
 */
const StableCoinTransfer = portalGraphql(`
  mutation StableCoinTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: StableCoinTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer tokenized deposit tokens
 */
const TokenizedDepositTransfer = portalGraphql(`
  mutation TokenizedDepositTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: TokenizedDepositTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to transfer tokens to a recipient
 *
 * @param input - Validated input containing address, pincode, value, to, and assettype
 * @param user - The user executing the transfer operation
 * @returns Array of transaction hashes
 */
export const transferAssetFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["transfer"],
    },
  },
  async ({
    parsedInput: { address, pincode, value, to, assettype },
    ctx: { user },
  }: {
    parsedInput: TransferInput;
    ctx: { user: User };
  }) => {
    // Get token details based on asset type
    const { decimals } = await getAssetDetail({
      address,
      assettype,
    });

    // Common parameters for all mutations
    const params = {
      address,
      from: user.wallet,
      value: parseUnits(value.toString(), decimals).toString(),
      to,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    };

    switch (assettype) {
      case "bond": {
        const response = await portalClient.request(BondTransfer, params);
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      case "cryptocurrency": {
        const response = await portalClient.request(
          CryptoCurrencyTransfer,
          params
        );
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      case "equity": {
        const response = await portalClient.request(EquityTransfer, params);
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      case "fund": {
        const response = await portalClient.request(FundTransfer, params);
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      case "stablecoin": {
        const response = await portalClient.request(StableCoinTransfer, params);
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      case "tokenizeddeposit": {
        const response = await portalClient.request(
          TokenizedDepositTransfer,
          params
        );
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
