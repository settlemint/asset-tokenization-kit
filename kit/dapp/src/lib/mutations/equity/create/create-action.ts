"use server";

import { handleChallenge } from "@/lib/challenge";
import { EQUITY_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateEquitySchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new equity
 *
 * @remarks
 * Creates a new equity contract through the equity factory
 */
const EquityFactoryCreate = portalGraphql(`
  mutation EquityFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, equityCategory: $equityCategory, equityClass: $equityClass}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a equity
 *
 * @remarks
 * Stores additional metadata about the equity in Hasura
 */
const CreateOffchainEquity = hasuraGraphql(`
  mutation CreateOffchainEquity($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

export const createEquity = action
  .schema(CreateEquitySchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        equityCategory,
        equityClass,
        predictedAddress,
      },
      ctx: { user },
    }) => {
      await hasuraClient.request(CreateOffchainEquity, {
        id: predictedAddress,
        isin: isin,
      });

      const data = await portalClient.request(EquityFactoryCreate, {
        address: EQUITY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        challengeResponse: await handleChallenge(user.wallet, pincode),
        equityCategory,
        equityClass,
      });

      return safeParseTransactionHash([
        data.EquityFactoryCreate?.transactionHash,
      ]);
    }
  );
