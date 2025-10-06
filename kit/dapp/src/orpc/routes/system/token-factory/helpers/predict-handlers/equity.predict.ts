import { encodeComplianceParams } from "@/lib/compliance/encoding/index";
import { portalGraphql } from "@/lib/settlemint/portal";
import {
  type PredictAddressInput,
  type PredictAddressOutput,
  PredictAddressOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_EQUITY_ADDRESS_QUERY = portalGraphql(`
  query PredictEquityAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKEquityFactoryImplementationPredictEquityAddressInitialModulePairsInput!]!
  ) {
    ATKEquityFactoryImplementation(address: $address) {
      predictEquityAddress(
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

export const equityPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.equity) {
    throw new Error("Invalid token type");
  }

  const { basePrice: _, ...params } = input;
  const result = await context.portalClient.query(
    PREDICT_EQUITY_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      from: context.walletAddress,
      ...params,
      initialModulePairs: input.initialModulePairs.map((pair) => ({
        module: pair.module,
        params: encodeComplianceParams(pair),
      })),
    },
    z.object({
      ATKEquityFactoryImplementation: z.object({
        predictEquityAddress: PredictAddressOutputSchema,
      }),
    })
  );

  return result.ATKEquityFactoryImplementation.predictEquityAddress;
};
