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
  mutation BondTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: BondTransferInput!
  ) {
    Transfer: BondTransfer(
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
 * GraphQL mutation to transfer cryptocurrency tokens
 */
const CryptoCurrencyTransfer = portalGraphql(`
  mutation CryptoCurrencyTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: CryptoCurrencyTransferInput!
  ) {
    Transfer: CryptoCurrencyTransfer(
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
 * GraphQL mutation to transfer equity tokens
 */
const EquityTransfer = portalGraphql(`
  mutation EquityTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: EquityTransferInput!
  ) {
    Transfer: EquityTransfer(
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
 * GraphQL mutation to transfer fund tokens
 */
const FundTransfer = portalGraphql(`
  mutation FundTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: FundTransferInput!
  ) {
    Transfer: FundTransfer(
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
 * GraphQL mutation to transfer stablecoin tokens
 */
const StableCoinTransfer = portalGraphql(`
  mutation StableCoinTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: StableCoinTransferInput!
  ) {
    Transfer: StableCoinTransfer(
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
 * GraphQL mutation to transfer tokenized deposit tokens
 */
const DepositTransfer = portalGraphql(`
  mutation DepositTransfer(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: DepositTransferInput!
  ) {
    Transfer: DepositTransfer(
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
      input: {
        value: parseUnits(value.toString(), decimals).toString(),
        to,
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
