import { ListSchema } from "@/lib/orpc/routes/common/list.schema";
import { SystemCreateSchema } from "@/lib/orpc/routes/system/schemas/system.create.schema";
import { z } from "zod";
import { ac } from "../../procedures/auth.contract";
import { SystemSchema } from "./schemas/system.schema";

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
const list = ac
  .route({
    method: "GET",
    path: "/systems",
    description: "List the SMART systems",
    successDescription: "List of SMART systems",
    tags: ["system"],
  })
  .input(ListSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(z.array(SystemSchema)); // Return array of system objects

const create = ac
  .route({
    method: "POST",
    path: "/systems",
    description: "Create a new SMART system",
    successDescription: "New SMART system created",
    tags: ["system"],
  })
  .input(SystemCreateSchema)
  .output(SystemSchema);

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
export const systemContract = {
  list,
  create,
};
