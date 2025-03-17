"use server";

import { handleChallenge } from "@/lib/challenge";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateFundSchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new fund
 *
 * @remarks
 * Creates a new fund contract through the fund factory
 */
const FundFactoryCreate = portalGraphql(`
  mutation FundFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, fundCategory: $fundCategory, fundClass: $fundClass, managementFeeBps: $managementFeeBps}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a fund
 *
 * @remarks
 * Stores additional metadata about the fund in Hasura
 */
const CreateOffchainFund = hasuraGraphql(`
  mutation CreateOffchainFund($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
      isin
    }
  }
`);

export const createFund = action
  .schema(CreateFundSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        fundCategory,
        fundClass,
        managementFeeBps,
        predictedAddress,
      },
      ctx: { user },
    }) => {
      await hasuraClient.request(CreateOffchainFund, {
        id: predictedAddress,
        isin,
      });

      const data = await portalClient.request(FundFactoryCreate, {
        address: FUND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        challengeResponse: await handleChallenge(user.wallet, pincode),
        fundCategory,
        fundClass,
        managementFeeBps,
      });

      return safeParseTransactionHash([
        data.FundFactoryCreate?.transactionHash,
      ]);
    }
  );
