import { AccountReadSchema } from "@/lib/orpc/routes/account/routes/account.read.schema";
import { ac } from "../../procedures/auth.contract";
import { AccountCreateSchema } from "./routes/account.create.schema";
import { AccountSchema } from "./routes/account.read.schema";

/**
 * Contract definition for the system list endpoint.
 *
 * Defines the type-safe interface for retrieving SMART systems including:
 * - HTTP method and path configuration
 * - Input validation using the standard ListSchema for pagination
 * - Output validation ensuring an array of valid System objects
 * - OpenAPI documentation metadata
 *
 * This contract is consumed by both the server router and client for
 * end-to-end type safety.
 */
const read = ac
  .route({
    method: "GET",
    path: "/accounts/:walletAddress",
    description: "Read the account for a user",
    successDescription: "Account for a user",
    tags: ["account"],
  })
  .input(AccountReadSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(AccountSchema); // Return array of system objects

const create = ac
  .route({
    method: "POST",
    path: "/accounts",
    description: "Create a new SMART system",
    successDescription: "New SMART system created",
    tags: ["account"],
  })
  .input(AccountCreateSchema)
  .output(AccountSchema);

/**
 * System API contract collection.
 *
 * Exports all system-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve paginated list of SMART systems
 *
 * Future endpoints may include:
 * - get: Retrieve a specific system by ID
 * - deploy: Deploy a new SMART system
 * - update: Update system configuration
 */
export const accountContract = {
  read,
  create,
};
