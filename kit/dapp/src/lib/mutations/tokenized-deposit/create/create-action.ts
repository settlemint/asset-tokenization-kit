"use server";

import { handleChallenge } from "@/lib/challenge";
import { TOKENIZED_DEPOSIT_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { CreateTokenizedDepositSchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new tokenized deposit
 *
 * @remarks
 * Creates a new tokenized deposit contract through the tokenized deposit factory
 */
const TokenizedDepositFactoryCreate = portalGraphql(`
  mutation TokenizedDepositFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $collateralLivenessSeconds: Float!) {
    TokenizedDepositFactoryCreate(
      address: $address
      from: $from
      input: { name: $name, symbol: $symbol, decimals: $decimals, collateralLivenessSeconds: $collateralLivenessSeconds}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a tokenized deposit
 *
 * @remarks
 * Stores additional metadata about the tokenized deposit in Hasura
 */
const CreateOffchainTokenizedDeposit = hasuraGraphql(`
  mutation CreateOffchainTokenizedDeposit($id: String!, $isin: String, $value_in_base_currency: numeric) {
    insert_asset_one(object: {id: $id, isin: $isin, value_in_base_currency: $value_in_base_currency}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

export const createTokenizedDeposit = action
  .schema(CreateTokenizedDepositSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        collateralLivenessValue,
        collateralLivenessTimeUnit,
        pincode,
        isin,
        predictedAddress,
        valueInBaseCurrency,
      },
      ctx: { user },
    }) => {
      await hasuraClient.request(CreateOffchainTokenizedDeposit, {
        id: predictedAddress,
        isin,
        value_in_base_currency: String(valueInBaseCurrency),
      });

      const collateralLivenessSeconds =
        collateralLivenessValue *
        getTimeUnitSeconds(collateralLivenessTimeUnit);

      const data = await portalClient.request(TokenizedDepositFactoryCreate, {
        address: TOKENIZED_DEPOSIT_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol: symbol.toString(),
        decimals,
        collateralLivenessSeconds,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParse(t.Hashes(), [
        data.TokenizedDepositFactoryCreate?.transactionHash,
      ]);
    }
  );
