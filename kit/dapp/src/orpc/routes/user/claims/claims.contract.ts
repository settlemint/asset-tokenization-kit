/**
 * Claims Management Contract
 *
 * This contract defines the type-safe interfaces for claims-related operations.
 * It provides endpoints for listing, issuing, and revoking claims on user
 * identities, with comprehensive blockchain integration and validation.
 *
 * All endpoints in this contract require authentication and appropriate role-based
 * permissions, ensuring that claims operations are properly secured and authorized.
 * @see {@link @/orpc/procedures/base.contract} - Base authenticated contract
 * @see {@link ./claims.router} - Implementation router
 */

import {
  ClaimsIssueInputSchema,
  ClaimsIssueOutputSchema,
} from "@/orpc/routes/user/claims/routes/claims.issue.schema";
import {
  ClaimsListInputSchema,
  ClaimsListOutputSchema,
} from "@/orpc/routes/user/claims/routes/claims.list.schema";
import {
  ClaimsRevokeInputSchema,
  ClaimsRevokeOutputSchema,
} from "@/orpc/routes/user/claims/routes/claims.revoke.schema";
import { baseContract } from "../../../procedures/base.contract";

/**
 * Retrieve claims information for a specific user.
 *
 * This endpoint returns claims data for a user identified by ID or wallet address.
 * It provides lightweight claims information without full user profile data,
 * making it ideal for claims-focused UI components.
 * @auth Required - User must be authenticated with appropriate permissions
 * @function GET
 * @endpoint /user/claims/list
 * @input ClaimsListInputSchema - User ID or wallet address
 * @returns ClaimsListOutputSchema - User claims data
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/user/claims/list",
    description:
      "Retrieve claims information for a specific user by ID or wallet address. Returns lightweight claims data without full user profile information.",
    successDescription: "User claims retrieved successfully",
    tags: ["user", "claims", "identity"],
  })
  .input(ClaimsListInputSchema)
  .output(ClaimsListOutputSchema);

/**
 * Issue a new claim to a user's on-chain identity.
 *
 * This endpoint creates and signs a new claim on the blockchain for a specified
 * user. Requires claimIssuer role and validates wallet verification status
 * before issuing the claim.
 * @auth Required - User must have claimIssuer role
 * @function POST
 * @endpoint /user/claims/issue
 * @input ClaimsIssueInputSchema - Claim data and user information
 * @returns ClaimsIssueOutputSchema - Issued claim details
 */
const issue = baseContract
  .route({
    method: "POST",
    path: "/user/claims/issue",
    description:
      "Issue a new claim to a user's on-chain identity. Requires claimIssuer role and valid wallet verification. Creates signed claim on blockchain.",
    successDescription: "Claim issued successfully",
    tags: ["user", "claims", "identity", "blockchain"],
  })
  .input(ClaimsIssueInputSchema)
  .output(ClaimsIssueOutputSchema);

/**
 * Revoke an existing claim from a user's on-chain identity.
 *
 * This endpoint permanently removes a claim from the blockchain for a specified
 * user. Requires claimIssuer role and validates the claim exists before
 * performing the revocation operation.
 * @auth Required - User must have claimIssuer role
 * @function POST
 * @endpoint /user/claims/revoke
 * @input ClaimsRevokeInputSchema - Claim identifier and user information
 * @returns ClaimsRevokeOutputSchema - Revocation confirmation
 */
const revoke = baseContract
  .route({
    method: "POST",
    path: "/user/claims/revoke",
    description:
      "Revoke an existing claim from a user's on-chain identity. Requires claimIssuer role and valid wallet verification. Permanently removes claim from blockchain.",
    successDescription: "Claim revoked successfully",
    tags: ["user", "claims", "identity", "blockchain"],
  })
  .input(ClaimsRevokeInputSchema)
  .output(ClaimsRevokeOutputSchema);

/**
 * Claims API contract collection.
 */
export const claimsContract = {
  list,
  issue,
  revoke,
};

export default claimsContract;
