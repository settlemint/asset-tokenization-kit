import { baseContract } from "@/orpc/procedures/base.contract";
import {
  SystemAddonCreateOutputSchema,
  SystemAddonCreateSchema,
} from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { eventIterator } from "@orpc/server";
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

export const addonContract = {
  addonCreate,
};
