import { z } from "zod";
import { baseContract } from "../../procedures/base.contract";
import {
  SystemAddonListSchema,
  SystemAddonSchema,
} from "./routes/addons.list.schema";

/**
 * Contract definition for the addons list endpoint.
 *
 * Defines the type-safe interface for retrieving system addons including:
 * - HTTP method and path configuration
 * - Input validation using the extended ListSchema with addon-specific filters
 * - Output validation ensuring an array of valid SystemAddon objects
 * - OpenAPI documentation metadata
 *
 * This contract is consumed by both the server router and client for
 * end-to-end type safety.
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/addons",
    description:
      "List system addons (extensions that add functionality to tokens)",
    successDescription:
      "List of system addons with their types and deployment info",
    tags: ["addons"],
  })
  .input(SystemAddonListSchema) // Extended list schema with addon-specific filters
  .output(z.array(SystemAddonSchema)); // Return array of system addon objects

/**
 * Addons API contract collection.
 *
 * Exports all addons-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve paginated list of system addons with filtering options
 *
 * System addons are modular smart contracts that extend token functionality
 * with features like airdrops, yield distribution, and XVP settlements.
 *
 * Future endpoints may include:
 * - read: Retrieve detailed information about a specific addon
 * - create: Deploy a new addon instance
 * - update: Update addon configuration
 * - delete: Remove an addon
 */
export const addonsContract = {
  list,
};
