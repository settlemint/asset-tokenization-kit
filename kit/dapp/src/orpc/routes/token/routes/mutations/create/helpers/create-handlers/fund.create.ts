/**
 * Fund Token Creation Handler
 *
 * This handler creates fund tokens through the ATKFundFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating fund tokens with configurable properties like name,
 * symbol, decimal precision, and management fee.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during fund creation
 * 4. Returns the transaction hash of the successful fund creation
 * @generator
 * @see {@link ./fund.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { encodeComplianceParams } from "@/lib/compliance/encoding/index";
import { portalGraphql } from "@/lib/settlemint/portal";
import type { Context } from "@/orpc/context/context";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";

const CREATE_FUND_MUTATION = portalGraphql(`
  mutation CreateFundMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKFundFactoryImplementationATKFundFactoryImplementationCreateFundInitialModulePairsInput!]!
    $challengeId: String
    $challengeResponse: String
    $managementFeeBps: Int!
    $countryCode: Int!
  ) {
    CreateFund: ATKFundFactoryImplementationCreateFund(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        managementFeeBps_: $managementFeeBps
        countryCode_: $countryCode
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const fundCreateHandler = async (
  input: TokenCreateInput,
  context: TokenCreateContext,
  _requestContext: Context
) => {
  if (input.type !== AssetTypeEnum.fund) {
    throw new Error("Invalid token type");
  }

  return createToken(input, context, () => {
    return context.portalClient.mutate(
      CREATE_FUND_MUTATION,
      {
        ...context.mutationVariables,
        symbol: input.symbol,
        name: input.name,
        decimals: input.decimals,
        countryCode: input.countryCode,
        managementFeeBps: input.managementFeeBps,
        initialModulePairs: input.initialModulePairs.map((pair) => ({
          module: pair.module,
          params: encodeComplianceParams(pair),
        })),
      },
      context.walletVerification
    );
  });
};
