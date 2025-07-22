/**
 * Deposit Token Creation Handler
 *
 * This handler creates deposit tokens through the ATKDepositFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating deposit tokens with configurable properties like name,
 * symbol, and decimal precision.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during deposit creation
 * 4. Returns the transaction hash of the successful deposit creation
 * @generator
 * @see {@link ./deposit.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import type { TokenCreateContext } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import { createToken } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

const CREATE_BOND_MUTATION = portalGraphql(`
  mutation CreateBondMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKBondFactoryImplementationATKBondFactoryImplementationCreateBondInitialModulePairsInput!]!
    $requiredClaimTopics: [String!]!
    $cap: String!
    $faceValue: String!
    $maturityDate: String!
    $underlyingAsset: String!
    $verificationId: String
    $challengeResponse: String!
    $countryCode: Int!
  ) {
    CreateBond: ATKBondFactoryImplementationCreateBond(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        requiredClaimTopics_: $requiredClaimTopics
        cap_: $cap
        faceValue_: $faceValue
        maturityDate_: $maturityDate
        underlyingAsset_: $underlyingAsset
        countryCode_: $countryCode
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const bondCreateHandler = async function* (
  input: TokenCreateInput,
  context: TokenCreateContext
) {
  if (input.type !== AssetTypeEnum.bond) {
    throw new Error("Invalid token type");
  }

  yield* createToken(input, context, (creationFailedMessage, messages) => {
    // Delete verification from input to avoid leaking it in the logs
    const { verification: _, ...otherInput } = input;
    return context.portalClient.mutate(
      CREATE_BOND_MUTATION,
      {
        ...otherInput,
        cap: input.cap.toString(),
        faceValue: input.faceValue.toString(),
        ...context.mutationVariables,
        countryCode: 1, // TODO: should come from ui
      },
      creationFailedMessage,
      messages
    );
  });
};
