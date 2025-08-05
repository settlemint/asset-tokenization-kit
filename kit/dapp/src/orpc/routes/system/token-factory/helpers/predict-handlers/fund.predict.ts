import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  PredictAddressOutputSchema,
  type PredictAddressInput,
  type PredictAddressOutput,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_FUND_ADDRESS_QUERY = portalGraphql(`
  query PredictFundAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKFundFactoryImplementationPredictFundAddressInitialModulePairsInput!]!
    $managementFeeBps: Int!
  ) {
    ATKFundFactoryImplementation(address: $address) {
      predictFundAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        managementFeeBps_: $managementFeeBps
      ) {
        predictedAddress
      }
    }
  }
`);

export const fundPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.fund) {
    throw new Error("Invalid token type");
  }

  const result = await context.portalClient.query(
    PREDICT_FUND_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      ...input,
    },
    z.object({
      ATKFundFactoryImplementation: z.object({
        predictFundAddress: PredictAddressOutputSchema,
      }),
    })
  );

  return result.ATKFundFactoryImplementation.predictFundAddress;
};
