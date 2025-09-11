import type { SessionUser } from "@/lib/auth";
import { portalGraphql } from "@/lib/settlemint/portal";
import {
  createClaim,
  type ClaimInfo,
} from "@/orpc/helpers/claims/create-claim";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { Address } from "viem";

/**
 * GraphQL mutation to add a claim to an identity contract.
 */
const ADD_CLAIM_MUTATION = portalGraphql(`
  mutation AddClaim(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $topic: String!
    $scheme: String!
    $issuer: String!
    $signature: String!
    $data: String!
    $uri: String!
  ) {
    addClaim: ATKIdentityImplementationAddClaim(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _topic: $topic
        _scheme: $scheme
        _issuer: $issuer
        _signature: $signature
        _data: $data
        _uri: $uri
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Input parameters for issuing a claim.
 */
export interface IssueClaimInput {
  /**
   * Wallet address of the issuer of the claim
   */
  user: SessionUser;
  /**
   * Identity address of the issuer
   */
  issuer: Address;
  /**
   * Wallet verification of the user
   */
  walletVerification: UserVerification;
  /**
   * Identity to issue the claim to
   */
  identity: Address;
  /**
   * Claim info
   */
  claim: ClaimInfo;
  /**
   * Validated portal client
   */
  portalClient: ValidatedPortalClient;
}

/**
 * Issues a claim to an identity contract.
 * @param params - The input parameters for issuing a claim.
 */
export async function issueClaim({
  user,
  issuer,
  walletVerification,
  identity,
  claim,
  portalClient,
}: IssueClaimInput) {
  // USER-ISSUED CLAIM SIGNATURE: Create signature for user-issued claim
  // The user issues the claim to the identity contract
  const { signature, topicId, claimData } = await createClaim({
    user,
    walletVerification,
    identity,
    claim,
  });
  // ISSUE CLAIM: Add claim to the identity contract
  await portalClient.mutate(
    ADD_CLAIM_MUTATION,
    {
      address: identity,
      from: user.wallet,
      topic: topicId.toString(),
      scheme: "1", // ECDSA
      issuer,
      signature,
      data: claimData,
      uri: "", // Empty URI as not required for isin claims
    },
    {
      sender: user,
      code: walletVerification.secretVerificationCode,
      type: walletVerification.verificationType,
    }
  );
}
