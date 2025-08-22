import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TrustedIssuerCreateInputSchema,
  TrustedIssuerCreateOutputSchema,
} from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create.schema";
import { TrustedIssuerListOutputSchema } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import {
  TrustedIssuerDeleteInputSchema,
  TrustedIssuerDeleteOutputSchema,
} from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.delete.schema";
import {
  TrustedIssuerUpdateInputSchema,
  TrustedIssuerUpdateOutputSchema,
} from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.update.schema";

const TAGS = ["system", "trusted-issuers"];

/**
 * Contract definition for listing trusted issuers.
 *
 * Retrieves all registered trusted issuers from the subgraph,
 * including their assigned claim topics.
 */
const trustedIssuerList = baseContract
  .route({
    method: "GET",
    path: "/system/trusted-issuers",
    description: "List all trusted issuers in the system",
    successDescription: "Trusted issuers retrieved successfully",
    tags: TAGS,
  })
  .output(TrustedIssuerListOutputSchema);

/**
 * Contract definition for creating a trusted issuer.
 *
 * Registers a new trusted issuer that can verify identity claims.
 * Requires CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE permissions.
 */
const trustedIssuerCreate = baseContract
  .route({
    method: "POST",
    path: "/system/trusted-issuers",
    description: "Create a new trusted issuer in the registry",
    successDescription: "Trusted issuer created successfully",
    tags: TAGS,
  })
  .input(TrustedIssuerCreateInputSchema)
  .output(TrustedIssuerCreateOutputSchema);

/**
 * Contract definition for updating a trusted issuer's topics.
 *
 * Updates the claim topics that a trusted issuer is allowed to verify.
 * The issuer address remains immutable.
 */
const trustedIssuerUpdate = baseContract
  .route({
    method: "PUT",
    path: "/system/trusted-issuers/:issuerAddress",
    description: "Update the claim topics for a trusted issuer",
    successDescription: "Trusted issuer topics updated successfully",
    tags: TAGS,
  })
  .input(TrustedIssuerUpdateInputSchema)
  .output(TrustedIssuerUpdateOutputSchema);

/**
 * Contract definition for deleting a trusted issuer.
 *
 * Permanently deletes a trusted issuer from the registry.
 * This prevents the issuer from verifying new claims.
 */
const trustedIssuerDelete = baseContract
  .route({
    method: "DELETE",
    path: "/system/trusted-issuers/:issuerAddress",
    description: "Delete a trusted issuer from the registry",
    successDescription: "Trusted issuer deleted successfully",
    tags: TAGS,
  })
  .input(TrustedIssuerDeleteInputSchema)
  .output(TrustedIssuerDeleteOutputSchema);

export const trustedIssuersContract = {
  trustedIssuerList,
  trustedIssuerCreate,
  trustedIssuerUpdate,
  trustedIssuerDelete,
};