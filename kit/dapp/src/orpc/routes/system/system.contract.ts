import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import {
  SystemAddonCreateOutputSchema,
  SystemAddonCreateSchema,
} from "@/orpc/routes/system/routes/system.addonCreate.schema";
import {
  SystemCreateOutputSchema,
  SystemCreateSchema,
} from "@/orpc/routes/system/routes/system.create.schema";
import {
  SystemReadOutputSchema,
  SystemReadSchema,
} from "@/orpc/routes/system/routes/system.read.schema";
import { eventIterator } from "@orpc/server";
import { z } from "zod";
import { baseContract } from "../../procedures/base.contract";
import { SystemSchema } from "./routes/system.list.schema";

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
const list = baseContract
  .route({
    method: "GET",
    path: "/systems",
    description: "List the SMART systems",
    successDescription: "List of SMART systems",
    tags: ["system"],
  })
  .input(ListSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(z.array(SystemSchema)); // Return array of system objects

/**
 * Contract definition for the system creation endpoint.
 *
 * Defines the type-safe interface for deploying new SMART system contracts:
 * - HTTP POST method to /systems endpoint
 * - Input validation for contract address and verification credentials
 * - Server-sent events output for real-time transaction tracking
 * - OpenAPI documentation with proper tags and descriptions
 *
 * The endpoint streams events as the blockchain transaction progresses through
 * confirmation and indexing phases.
 */
const create = baseContract
  .route({
    method: "POST",
    path: "/systems",
    description: "Create a new SMART system",
    successDescription: "New SMART system created",
    tags: ["system"],
  })
  .input(SystemCreateSchema)
  .output(eventIterator(SystemCreateOutputSchema));

/**
 * Contract definition for the system read endpoint.
 *
 * Defines the type-safe interface for retrieving a specific system:
 * - HTTP GET method with system ID parameter
 * - Input validation for system address
 * - Output includes system details and associated token factories
 * - OpenAPI documentation with proper tags and descriptions
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/systems/:id",
    description: "Get details of a specific SMART system",
    successDescription: "SMART system details with token factories",
    tags: ["system"],
  })
  .input(SystemReadSchema)
  .output(SystemReadOutputSchema);

/**
 * Contract definition for the system addon creation endpoint.
 *
 * Defines the type-safe interface for registering system addons:
 * - HTTP POST method to /systems/addons endpoint
 * - Input validation for addon configuration and verification credentials
 * - Server-sent events output for real-time transaction tracking
 * - OpenAPI documentation with proper tags and descriptions
 *
 * The endpoint streams events as the blockchain transactions progress through
 * confirmation and indexing phases for each addon registration.
 */
const addonCreate = baseContract
  .route({
    method: "POST",
    path: "/systems/addons",
    description: "Register system add-ons",
    successDescription: "System add-ons registered successfully",
    tags: ["system"],
  })
  .input(SystemAddonCreateSchema)
  .output(eventIterator(SystemAddonCreateOutputSchema));

/**
 * System API contract collection.
 *
 * Exports all system-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve paginated list of SMART systems
 * - create: Deploy a new SMART system
 * - read: Retrieve a specific system with its token factories
 * - addonCreate: Register system add-ons
 *
 * Future endpoints may include:
 * - update: Update system configuration
 * - delete: Remove a system
 */
export const systemContract = {
  list,
  create,
  read,
  addonCreate,
};
