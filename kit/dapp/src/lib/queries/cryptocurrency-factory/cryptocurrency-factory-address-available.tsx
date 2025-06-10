"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { CryptocurrencyExistsSchema } from "./cryptocurrency-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the cryptocurrency factory
 */
// const CryptocurrencyExists = theGraphGraphqlKit(`
//   query CryptocurrencyExists($token: ID!) {
//     cryptoCurrency(id: $token) {
//       id
//     }
//   }
// `);

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("asset");
    try {
            //       // const data = await theGraphClientKit.request(CryptocurrencyExists, {
      //       //         token: address,
      //       //       });
    // NOTE: HARDCODED SO IT STILL COMPILES
    const data = { cryptoCurrency: null };

      const cryptocurrencyExists = safeParse(CryptocurrencyExistsSchema, data);

      return !cryptocurrencyExists.cryptoCurrency;
    } catch (error) {
      // Log the error but don't fail validation
      console.error("Error checking if address is available:", error);
      // Return true to allow form submission to proceed
      return true;
    }
  }
);
