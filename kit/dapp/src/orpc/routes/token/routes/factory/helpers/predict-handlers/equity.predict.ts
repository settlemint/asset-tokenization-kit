import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  PredictAddressOutputSchema,
  type PredictAddressInput,
  type PredictAddressOutput,
} from "@/orpc/routes/token/routes/factory/factory.predict-address.schema";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_EQUITY_ADDRESS_QUERY = portalGraphql(`
  query PredictEquityAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKEquityFactoryImplementationATKEquityFactoryImplementationPredictEquityAddressInitialModulePairsInput!]!
    $requiredClaimTopics: [String!]!
  ) {
    ATKEquityFactoryImplementation(address: $address) {
      predictEquityAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        requiredClaimTopics_: $requiredClaimTopics
      ) {
        predictedAddress
      }
    }
  }
`);

export const equityPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.equity) {
    throw new Error("Invalid token type");
  }

  const result = await context.portalClient.query(
    PREDICT_EQUITY_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      ...input,
      initialModulePairs: [],
    },
    z.object({
      ATKEquityFactoryImplementation: z.object({
        predictEquityAddress: PredictAddressOutputSchema,
      }),
    }),
    "Failed to predict equity address"
  );

  return {
    predictedAddress:
      result.ATKEquityFactoryImplementation.predictEquityAddress
        .predictedAddress,
  };
};
