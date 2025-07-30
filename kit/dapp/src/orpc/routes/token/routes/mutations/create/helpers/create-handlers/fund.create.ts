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

import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

const CREATE_FUND_MUTATION = portalGraphql(`
  mutation CreateFundMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKFundFactoryImplementationATKFundFactoryImplementationCreateFundInitialModulePairsInput!]!
    $verificationId: String
    $challengeResponse: String!
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
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const fundCreateHandler = async (
  input: TokenCreateInput,
  context: TokenCreateContext
) => {
  if (input.type !== AssetTypeEnum.fund) {
    throw new Error("Invalid token type");
  }

  return createToken(input, context, () => {
    // Delete verification from input to avoid leaking it in the logs
    const { verification: _, ...otherInput } = input;
    return context.portalClient.mutate(
      CREATE_FUND_MUTATION,
      {
        ...otherInput,
        ...context.mutationVariables,
      },
      "Failed to create fund token"
    );
  });
};
