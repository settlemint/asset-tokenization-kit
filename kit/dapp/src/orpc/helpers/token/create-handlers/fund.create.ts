import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/helpers/token/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/token.create.schema";

const CREATE_FUND_MUTATION = portalGraphql(`
  mutation CreateFundMutation($address: String!, $from: String!, $symbol: String!, $name: String!, $decimals: Int!, $initialModulePairs: [ATKFundFactoryImplementationATKFundFactoryImplementationCreateFundInitialModulePairsInput!]!, $requiredClaimTopics: [String!]!, $verificationId: String, $challengeResponse: String!, $managementFeeBps: Int!) {
    CreateFund: ATKFundFactoryImplementationCreateFund(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        requiredClaimTopics_: $requiredClaimTopics
        managementFeeBps_: $managementFeeBps
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const fundCreateHandler = async function* (
  input: TokenCreateInput,
  context: TokenCreateContext
) {
  if (input.type !== AssetTypeEnum.fund) {
    throw new Error("Invalid token type");
  }

  yield* createToken(input, (creationFailedMessage, messages) => {
    return context.portalClient.mutate(
      CREATE_FUND_MUTATION,
      {
        ...input,
        ...context.mutationVariables,
      },
      creationFailedMessage,
      messages
    );
  });
};

