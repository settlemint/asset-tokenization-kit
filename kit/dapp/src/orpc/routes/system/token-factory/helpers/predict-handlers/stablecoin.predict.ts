import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  PredictAddressOutputSchema,
  type PredictAddressInput,
  type PredictAddressOutput,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
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
