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
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/helpers/token/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/token.create.schema";

const CREATE_STABLECOIN_MUTATION = portalGraphql(`
  mutation CreateStableCoinMutation($address: String!, $from: String!, $symbol: String!, $name: String!, $decimals: Int!, $initialModulePairs: [ATKStableCoinFactoryImplementationATKStableCoinFactoryImplementationCreateStableCoinInitialModulePairsInput!]!, $requiredClaimTopics: [String!]!, $verificationId: String, $challengeResponse: String!) {
    CreateStableCoin: ATKStableCoinFactoryImplementationCreateStableCoin(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        requiredClaimTopics_: $requiredClaimTopics
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const stablecoinCreateHandler = async function* (
  input: TokenCreateInput,
  context: TokenCreateContext
) {
  if (input.type !== AssetTypeEnum.stablecoin) {
    throw new Error("Invalid token type");
  }

  yield* createToken(input, (creationFailedMessage, messages) => {
    return context.portalClient.mutate(
      CREATE_STABLECOIN_MUTATION,
      {
        ...input,
        ...context.mutationVariables,
      },
      creationFailedMessage,
      messages
    );
  });
};