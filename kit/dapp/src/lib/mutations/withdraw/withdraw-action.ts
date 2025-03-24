"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { action } from "../safe-action";
import { WithdrawSchema } from "./withdraw-schema";

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

export const withdraw = action
  .schema(WithdrawSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: {
        address,
        pincode,
        amount,
        to,
        underlyingAssetAddress,
        assettype,
      },
      ctx: { user },
    }) => {
      const asset = await getAssetDetail({
        address: underlyingAssetAddress,
        assettype: "cryptocurrency", // Underlying asset is typically a cryptocurrency
      });

      // Bond input format (for underlying asset)
      const bondInput = {
        to,
        amount: parseUnits(amount.toString(), asset.decimals).toString(),
      };

      // Token input format (for tokens)
      const tokenInput = {
        token: underlyingAssetAddress,
        to,
        amount: parseUnits(amount.toString(), asset.decimals).toString(),
      };

      // Common parameters for bond mutations
      const bondParams = {
        address,
        from: user.wallet,
        input: bondInput,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      // Common parameters for token mutations
      const tokenParams = {
        address,
        from: user.wallet,
        input: tokenInput,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(
            BondWithdrawUnderlyingAsset,
            bondParams
          );
          return safeParse(t.Hashes(), [
            response.BondWithdrawUnderlyingAsset?.transactionHash,
          ]);
        }
        case "cryptocurrency": {
          const response = await portalClient.request(
            CryptoCurrencyWithdrawToken,
            tokenParams
          );
          return safeParse(t.Hashes(), [
            response.CryptoCurrencyWithdrawToken?.transactionHash,
          ]);
        }
        case "equity": {
          const response = await portalClient.request(
            EquityWithdrawToken,
            tokenParams
          );
          return safeParse(t.Hashes(), [
            response.EquityWithdrawToken?.transactionHash,
          ]);
        }
        case "fund": {
          const response = await portalClient.request(
            FundWithdrawToken,
            tokenParams
          );
          return safeParse(t.Hashes(), [
            response.FundWithdrawToken?.transactionHash,
          ]);
        }
        case "stablecoin": {
          const response = await portalClient.request(
            StableCoinWithdrawToken,
            tokenParams
          );
          return safeParse(t.Hashes(), [
            response.StableCoinWithdrawToken?.transactionHash,
          ]);
        }
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositWithdrawToken,
            tokenParams
          );
          return safeParse(t.Hashes(), [
            response.TokenizedDepositWithdrawToken?.transactionHash,
          ]);
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
