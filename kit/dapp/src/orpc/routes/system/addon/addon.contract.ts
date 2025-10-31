import { baseContract } from "@/orpc/procedures/base.contract";
import { SystemAddonCreateSchema } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import {
  SystemAddonListSchema,
  SystemAddonSchema,
} from "@/orpc/routes/system/addon/routes/addon.list.schema";
import { SystemSchema } from "@/orpc/routes/system/routes/system.read.schema";
import { z } from "zod";

const TAGS = ["addon"];

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
    description:
      "Register system add-ons to extend SMART system functionality with additional modules and features",
    successDescription:
      "System add-ons registered successfully with updated system configuration",
    tags: TAGS,
  })
  .input(SystemAddonCreateSchema)
  .output(SystemSchema);

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
const addonList = baseContract
  .route({
    method: "GET",
    path: "/systems/addons",
    description:
      "List system addons (extensions that add functionality to tokens)",
    successDescription:
      "List of system addons with their types and deployment info",
    tags: TAGS,
  })
  .input(SystemAddonListSchema) // Extended list schema with addon-specific filters
  .output(z.array(SystemAddonSchema)); // Return array of system addon objects

export const addonContract = {
  create: addonCreate,
  list: addonList,
};
