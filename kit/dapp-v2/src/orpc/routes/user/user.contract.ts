import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { ac } from "../../procedures/auth.contract";

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
const me = ac
  .route({
    method: "GET",
    path: "/user/me",
    description: "Get the current user",
    successDescription: "Current user",
    tags: ["user"],
  })
  .output(UserMeSchema); // Return array of system objects

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
export const userContract = {
  me,
};
