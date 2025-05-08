import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { ApproveInput } from "./approve-schema";

/**
 * GraphQL mutation for approving a spend for a stablecoin
 *
 * @remarks
 * Approves a spend for a stablecoin
 */
const StableCoinApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinApproveInput!) {
    StableCoinApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for approving a spend for a bond
 *
 * @remarks
 * Approves a spend for a bond
 */
const BondApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondApproveInput!) {
    BondApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for approving a spend for a cryptocurrency
 *
 * @remarks
 * Approves a spend for a cryptocurrency
 */
const CryptoCurrencyApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: CryptoCurrencyApproveInput!) {
    CryptoCurrencyApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for approving a spend for a fund
 *
 * @remarks
 * Approves a spend for a fund
 */
const FundApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: FundApproveInput!) {
    FundApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for approving a spend for a equity
 *
 * @remarks
 * Approves a spend for a equity
 */
const EquityApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: EquityApproveInput!) {
    EquityApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for approving a spend for a tokenized deposit
 *
 * @remarks
 * Approves a spend for a tokenized deposit
 */
const DepositApprove = portalGraphql(`
  mutation Approve($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: DepositApproveInput!) {
    DepositApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to approve a spend for an asset
 *
 * @param input - Validated input for approving a spend
 * @param user - The user approving the spend
 * @returns Array of transaction hashes
 */
export const approveFunction = async ({
  parsedInput: {
    address,
    amount,
    spender,
    verificationCode,
    verificationType,
    assettype,
  },
  ctx: { user },
}: {
  parsedInput: ApproveInput;
  ctx: { user: User };
}) => {
  const { decimals } = await getAssetDetail({
    address,
    assettype,
  });
  const params: VariablesOf<
    | typeof DepositApprove
    | typeof StableCoinApprove
    | typeof BondApprove
    | typeof CryptoCurrencyApprove
    | typeof FundApprove
    | typeof EquityApprove
  > = {
    address: address,
    from: user.wallet,
    input: {
      value: parseUnits(amount.toString(), decimals).toString(),
      spender,
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  };

  switch (assettype) {
    case "stablecoin": {
      const response = await portalClient.request(StableCoinApprove, params);
      return safeParse(t.Hashes(), [
        response.StableCoinApprove?.transactionHash,
      ]);
    }
    case "bond": {
      const response = await portalClient.request(BondApprove, params);
      return safeParse(t.Hashes(), [response.BondApprove?.transactionHash]);
    }
    case "cryptocurrency": {
      const response = await portalClient.request(
        CryptoCurrencyApprove,
        params
      );
      return safeParse(t.Hashes(), [
        response.CryptoCurrencyApprove?.transactionHash,
      ]);
    }
    case "fund": {
      const response = await portalClient.request(FundApprove, params);
      return safeParse(t.Hashes(), [response.FundApprove?.transactionHash]);
    }
    case "equity": {
      const response = await portalClient.request(EquityApprove, params);
      return safeParse(t.Hashes(), [response.EquityApprove?.transactionHash]);
    }
    case "deposit": {
      const response = await portalClient.request(DepositApprove, params);
      return safeParse(t.Hashes(), [response.DepositApprove?.transactionHash]);
    }
    default:
      exhaustiveGuard(assettype);
  }
};
