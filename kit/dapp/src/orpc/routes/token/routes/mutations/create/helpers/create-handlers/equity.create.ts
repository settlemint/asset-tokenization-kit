/**
 * Equity Token Creation Handler
 *
 * This handler creates equity tokens through the ATKEquityFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating equity tokens with configurable properties like name,
 * symbol, decimal precision, price, equity class, and equity category.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during equity creation
 * 4. Returns the transaction hash of the successful equity creation
 * @generator
 * @see {@link ./equity.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

const CREATE_EQUITY_MUTATION = portalGraphql(`
  mutation CreateEquityMutation($address: String!, $from: String!, $symbol: String!, $name: String!, $decimals: Int!, $initialModulePairs: [ATKEquityFactoryImplementationATKEquityFactoryImplementationCreateEquityInitialModulePairsInput!]!, $requiredClaimTopics: [String!]!, $verificationId: String, $challengeResponse: String!) {
    CreateEquity: ATKEquityFactoryImplementationCreateEquity(
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

export const equityCreateHandler = async function* (
  input: TokenCreateInput,
  context: TokenCreateContext
) {
  if (input.type !== AssetTypeEnum.equity) {
    throw new Error("Invalid token type");
  }

  yield* createToken(input, (creationFailedMessage, messages) => {
    return context.portalClient.mutate(
      CREATE_EQUITY_MUTATION,
      {
        ...input,
        ...context.mutationVariables,
      },
      creationFailedMessage,
      messages
    );
  });
};
