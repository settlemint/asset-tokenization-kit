import { portalGraphql } from "@/lib/settlemint/portal";
import type {
  PredictAddressInput,
  PredictAddressOutput,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { PredictAddressOutputSchema } from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_DEPOSIT_ADDRESS_QUERY = portalGraphql(`
  query PredictDepositAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKDepositFactoryImplementationPredictDepositAddressInitialModulePairsInput!]!
  ) {
    ATKDepositFactoryImplementation(address: $address) {
      predictDepositAddress(
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

export const depositPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.deposit) {
    throw new Error("Invalid token type");
  }

  const result = await context.portalClient.query(
    PREDICT_DEPOSIT_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      ...input,
    },
    z.object({
      ATKDepositFactoryImplementation: z.object({
        predictDepositAddress: PredictAddressOutputSchema,
      }),
    })
  );

  return result.ATKDepositFactoryImplementation.predictDepositAddress;
};
