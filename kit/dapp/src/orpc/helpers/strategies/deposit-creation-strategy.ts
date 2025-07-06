/**
 * Deposit Token Creation Strategy
 *
 * This strategy implements the specific logic for creating deposit tokens,
 * including the GraphQL mutation, variable construction, and validation.
 * It encapsulates the deposit-specific differences while allowing the
 * template method to handle the common algorithm flow.
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import type {
  TokenCreationContext,
  TokenCreationStrategy,
} from "@/orpc/helpers/token-creation-strategy";
import type { TokenCreateInput } from "@/orpc/helpers/token.create.schema";

/**
 * GraphQL mutation for creating a deposit token.
 */
const CREATE_DEPOSIT_MUTATION = portalGraphql(`
  mutation CreateDepositMutation($address: String!, $from: String!, $symbol_: String!, $name_: String!, $decimals_: Int!, $initialModulePairs_: [ATKDepositFactoryImplementationATKDepositFactoryImplementationCreateDepositInitialModulePairsInput!]!, $requiredClaimTopics_: [String!]!, $verificationId: String, $challengeResponse: String!) {
    CreateDeposit: ATKDepositFactoryImplementationCreateDeposit(
      address: $address
      from: $from
      input: {
        symbol_: $symbol_
        name_: $name_
        decimals_: $decimals_
        initialModulePairs_: $initialModulePairs_
        requiredClaimTopics_: $requiredClaimTopics_
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Strategy implementation for deposit token creation
 */
export class DepositCreationStrategy
  implements TokenCreationStrategy<"deposit", typeof CREATE_DEPOSIT_MUTATION>
{
  getAssetType() {
    return AssetTypeEnum.deposit;
  }

  getFactoryType(): string {
    return "ATKDepositFactory";
  }

  getMutation() {
    return CREATE_DEPOSIT_MUTATION;
  }

  getVariables(
    input: Extract<TokenCreateInput, { type: "deposit" }>,
    context: TokenCreationContext
  ) {
    return {
      address: context.tokenFactory.address,
      from: context.user.wallet,
      symbol_: input.symbol,
      name_: input.name,
      decimals_: input.decimals,
      initialModulePairs_: [],
      requiredClaimTopics_: [],
      verificationId: context.challengeResponse.verificationId,
      challengeResponse: context.challengeResponse.challengeResponse,
    };
  }
}
