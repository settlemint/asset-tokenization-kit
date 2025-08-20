import { portalGraphql } from "@/lib/settlemint/portal";
import {
  type PredictAddressInput,
  type PredictAddressOutput,
  PredictAddressOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

const PREDICT_BOND_ADDRESS_QUERY = portalGraphql(`
  query PredictBondAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKBondFactoryImplementationPredictBondAddressInitialModulePairsInput!]!
    $cap: String!
    $faceValue: String!
    $maturityDate: String!
    $denominationAsset: String!
  ) {
    ATKBondFactoryImplementation(address: $address) {
      predictBondAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        cap_: $cap
        bondParams: {
          faceValue: $faceValue
          maturityDate: $maturityDate
          denominationAsset: $denominationAsset
        }
      ) {
        predictedAddress
      }
    }
  }
`);

export const bondPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  if (input.type !== AssetTypeEnum.bond) {
    throw new Error("Invalid token type");
  }

  const result = await context.portalClient.query(
    PREDICT_BOND_ADDRESS_QUERY,
    {
      address: context.factoryAddress,
      ...input,
      faceValue: input.faceValue.toString(),
      cap: input.cap.toString(),
    },
    z.object({
      ATKBondFactoryImplementation: z.object({
        predictBondAddress: PredictAddressOutputSchema,
      }),
    })
  );

  return result.ATKBondFactoryImplementation.predictBondAddress;
};
