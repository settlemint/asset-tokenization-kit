import type { SessionUser } from "@/lib/auth";
import { portalGraphql } from "@/lib/settlemint/portal";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Address } from "viem";

/**
 * GraphQL mutation for revoking a claim from an identity contract.
 */
const REVOKE_CLAIM_MUTATION = portalGraphql(`
  mutation RevokeIdentityClaim(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $claimId: String!
    $identity: String!
  ) {
    revokeClaim: ATKIdentityImplementationRevokeClaim(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _claimId: $claimId
        _identity: $identity
      }
    ) {
      transactionHash
    }
  }
`);

export interface RevokeClaimInput {
  /** Authenticated user issuing the revocation */
  user: SessionUser;
  /** Issuer identity address (contract with management key) */
  issuer: Address;
  /** Wallet verification for the issuer */
  walletVerification: UserVerification;
  /** Target subject identity address */
  identity: Address;
  /** Smart contract compatible claimId (32 bytes, hex) */
  claimId: string;
  /** Validated portal client */
  portalClient: ValidatedPortalClient;
}

/**
 * Revoke a claim from an identity contract.
 * Returns the transaction hash string on success.
 */
export async function revokeClaim({
  user,
  walletVerification,
  identity,
  claimId,
  portalClient,
}: RevokeClaimInput): Promise<string> {
  const txHash = await portalClient.mutate(
    REVOKE_CLAIM_MUTATION,
    {
      address: identity,
      from: user.wallet,
      claimId,
      identity,
    },
    {
      sender: user,
      code: walletVerification.secretVerificationCode,
      type: walletVerification.verificationType,
    }
  );

  return txHash;
}
