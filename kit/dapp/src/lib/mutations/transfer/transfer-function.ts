import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { TransferInput } from "./transfer-schema";

/**
 * GraphQL mutation to transfer bond tokens
 */
const BondTransfer = portalGraphql(`
  mutation BondTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: BondTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer cryptocurrency tokens
 */
const CryptoCurrencyTransfer = portalGraphql(`
  mutation CryptoCurrencyTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: CryptoCurrencyTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer equity tokens
 */
const EquityTransfer = portalGraphql(`
  mutation EquityTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: EquityTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer fund tokens
 */
const FundTransfer = portalGraphql(`
  mutation FundTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: FundTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer stablecoin tokens
 */
const StableCoinTransfer = portalGraphql(`
  mutation StableCoinTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: StableCoinTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to transfer tokenized deposit tokens
 */
const DepositTransfer = portalGraphql(`
  mutation DepositTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!, $verificationId: String) {
    Transfer: DepositTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to transfer tokens to a recipient
 *
 * @param input - Validated input containing address, verificationCode, value, to, and assettype
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
    parsedInput: {
      address,
      verificationCode,
      verificationType,
      value,
      to,
      assettype,
    },
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
    const params: VariablesOf<
      | typeof BondTransfer
      | typeof CryptoCurrencyTransfer
      | typeof EquityTransfer
      | typeof FundTransfer
      | typeof StableCoinTransfer
      | typeof DepositTransfer
    > = {
      address,
      from: user.wallet,
      value: parseUnits(value.toString(), decimals).toString(),
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
      case "deposit": {
        const response = await portalClient.request(DepositTransfer, params);
        return safeParse(t.Hashes(), [response.Transfer?.transactionHash]);
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
