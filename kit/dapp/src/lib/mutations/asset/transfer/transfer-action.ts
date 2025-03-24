"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import {
  type TransferFormAssetType,
  getTransferFormSchema,
} from "./transfer-schema";

const TransferStableCoin = portalGraphql(`
  mutation TransferStableCoin($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

const TransferFund = portalGraphql(`
  mutation TransferFund($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

const TransferBond = portalGraphql(`
  mutation TransferBond($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

const TransferEquity = portalGraphql(`
  mutation TransferEquity($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

const TransferCryptoCurrency = portalGraphql(`
  mutation TransferCryptoCurrency($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

const TransferTokenizedDeposit = portalGraphql(`
  mutation TransferTokenizedDeposit($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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

export const transferAsset = action
  .schema(getTransferFormSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: { address, to, value, pincode, assetType, decimals },
      ctx: { user },
    }) => {
      const data = await portalClient.request(getQuery(assetType), {
        address: address,
        from: user.wallet,
        to: to,
        value: parseUnits(value.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParse(t.Hashes(), [data?.Transfer?.transactionHash]);
    }
  );

function getQuery(assetType: TransferFormAssetType) {
  switch (assetType) {
    case "stablecoin":
      return TransferStableCoin;
    case "fund":
      return TransferFund;
    case "bond":
      return TransferBond;
    case "equity":
      return TransferEquity;
    case "cryptocurrency":
      return TransferCryptoCurrency;
    case "tokenizeddeposit":
      return TransferTokenizedDeposit;
    default: {
      const _exhaustiveCheck: never = assetType;
      throw new Error(`Unsupported asset type: ${String(_exhaustiveCheck)}`);
    }
  }
}
