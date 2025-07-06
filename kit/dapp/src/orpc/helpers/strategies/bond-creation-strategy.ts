/**
 * Bond Token Creation Strategy
 *
 * This strategy implements the specific logic for creating bond tokens,
 * including the GraphQL mutation with bond-specific fields (cap, faceValue,
 * maturityDate, underlyingAsset), variable construction, and validation.
 * It encapsulates the bond-specific differences while allowing the
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
 * GraphQL mutation for creating a bond token.
 */
const CREATE_BOND_MUTATION = portalGraphql(`
  mutation CreateBondMutation($address: String!, $from: String!, $symbol: String!, $name: String!, $decimals: Int!, $initialModulePairs: [ATKBondFactoryImplementationATKBondFactoryImplementationCreateBondInitialModulePairsInput!]!, $requiredClaimTopics: [String!]!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!, $verificationId: String, $challengeResponse: String!) {
    CreateToken: ATKBondFactoryImplementationCreateBond(
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
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Strategy implementation for bond token creation
 */
export class BondCreationStrategy
  implements TokenCreationStrategy<"bond", typeof CREATE_BOND_MUTATION>
{
  getAssetType() {
    return AssetTypeEnum.bond;
  }

  getFactoryType(): string {
    return "ATKBondFactory";
  }

  getMutation() {
    return CREATE_BOND_MUTATION;
  }

  getVariables(
    input: Extract<TokenCreateInput, { type: "bond" }>,
    context: TokenCreationContext
  ) {
    return {
      ...input,
      address: context.tokenFactory.address,
      from: context.user.wallet,
      verificationId: context.challengeResponse.verificationId,
      challengeResponse: context.challengeResponse.challengeResponse,
      requiredClaimTopics: [],
      initialModulePairs: [],
    };
  }
}
