import { IdentityReadSchema, IdentitySchema } from "@/lib/orpc/routes/identity/routes/identity.read.schema";
import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { ac } from "../../procedures/auth.contract";
import { IdentityCreateSchema } from "./routes/identity.create.schema";

/**
 * Contract definition for the identity read endpoint.
 *
 * Defines the type-safe interface for retrieving identity information including:
 * - HTTP method and path configuration
 * - Input validation for identity address parameter
 * - Output validation ensuring a valid Identity object
 * - OpenAPI documentation metadata
 *
 * This contract is consumed by both the server router and client for
 * end-to-end type safety.
 */
const read = ac
  .route({
    method: "GET",
    path: "/identities/:identityAddress",
    description: "Read identity information including claims and metadata",
    successDescription: "Identity information retrieved successfully",
    tags: ["identity"],
  })
  .input(IdentityReadSchema) // Identity address parameter
  .output(IdentitySchema); // Return identity object with claims

/**
 * Contract definition for the identity create endpoint.
 *
 * Defines the type-safe interface for creating new identities including:
 * - HTTP method and path configuration
 * - Input validation for wallet address and optional metadata
 * - Output validation ensuring a valid Ethereum address is returned
 * - OpenAPI documentation metadata
 *
 * This contract is consumed by both the server router and client for
 * end-to-end type safety.
 */
const create = ac
  .route({
    method: "POST",
    path: "/identities",
    description: "Create a new identity for compliance and claim management",
    successDescription: "New identity created successfully",
    tags: ["identity"],
  })
  .input(IdentityCreateSchema)
  .output(ethereumAddress);

/**
 * Identity API contract collection.
 *
 * Exports all identity-related API contracts for use in the main contract registry.
 * Currently includes:
 * - read: Retrieve identity information by address
 * - create: Deploy a new identity contract
 *
 * Future endpoints may include:
 * - update: Update identity metadata
 * - addClaim: Add a new claim to an identity
 * - revokeClaim: Revoke an existing claim
 * - list: List identities with filtering
 */
export const identityContract = {
  read,
  create,
};