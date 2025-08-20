import { portalGraphql } from "@/lib/settlemint/portal";
import {
  type PredictAddressInput,
  type PredictAddressOutput,
  PredictAddressOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_STABLECOIN_ADDRESS_QUERY = portalGraphql(`
  query PredictStableCoinAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKStableCoinFactoryImplementationPredictStableCoinAddressInitialModulePairsInput!]!
  ) {
    ATKStableCoinFactoryImplementation(address: $address) {
      predictStableCoinAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
      ) {
        predictedAddress
      }
    }
  }
`);

export const stablecoinPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.stablecoin) {
    throw new Error("Invalid token type");
  }

  const result = await context.portalClient.query(
    PREDICT_STABLECOIN_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      ...input,
    },
    z.object({
      ATKStableCoinFactoryImplementation: z.object({
        predictStableCoinAddress: PredictAddressOutputSchema,
      }),
    })
  );

  return result.ATKStableCoinFactoryImplementation.predictStableCoinAddress;
};
