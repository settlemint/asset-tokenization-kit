/**
 * Stablecoin Token Creation Handler
 *
 * This handler creates stablecoin tokens through the ATKStableCoinFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating stablecoin tokens with configurable properties like name,
 * symbol, and decimal precision.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during stablecoin creation
 * 4. Returns the transaction hash of the successful stablecoin creation
 * @generator
 * @see {@link ./stablecoin.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import type { Context } from "@/orpc/context/context";

import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";

const CREATE_STABLECOIN_MUTATION = portalGraphql(`
  mutation CreateStableCoinMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKStableCoinFactoryImplementationATKStableCoinFactoryImplementationCreateStableCoinInitialModulePairsInput!]!
    $challengeId: String
    $challengeResponse: String
    $countryCode: Int!
  ) {
    CreateStableCoin: ATKStableCoinFactoryImplementationCreateStableCoin(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        countryCode_: $countryCode
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const stablecoinCreateHandler = async (
  input: TokenCreateInput,
  context: TokenCreateContext,
  _requestContext: Context
) => {
  if (input.type !== AssetTypeEnum.stablecoin) {
    throw new Error("Invalid token type");
  }

  return createToken(input, context, () => {
    return context.portalClient.mutate(
      CREATE_STABLECOIN_MUTATION,
      {
        ...context.mutationVariables,
        symbol: input.symbol,
        name: input.name,
        decimals: input.decimals,
        countryCode: input.countryCode,
        initialModulePairs: input.initialModulePairs.map((pair) => ({
          module: pair.module,
          params: pair.params,
        })),
      },
      context.walletVerification
    );
  });
};
