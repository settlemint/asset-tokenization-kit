import { baseContract } from "@/orpc/procedures/base.contract";
import * as z from "zod";
import { SettingsDeleteSchema } from "./routes/settings.delete.schema";
import {
  SettingsListOutputSchema,
  SettingsListSchema,
} from "./routes/settings.list.schema";
import { SettingsReadSchema } from "./routes/settings.read.schema";
import { SettingsUpsertSchema } from "./routes/settings.upsert.schema";

/**
 * Contract definition for the settings read endpoint.
 *
 * Retrieves a single setting by its key.
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/settings/:key",
    description: "Read a single setting by key",
    successDescription: "Setting retrieved successfully",
    tags: ["settings"],
  })
  .input(SettingsReadSchema)
  .output(z.string().nullable());

/**
 * Contract definition for the settings list endpoint.
 *
 * Retrieves a paginated list of all settings.
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/settings",
    description: "List all settings with pagination",
    successDescription: "Settings list retrieved successfully",
    tags: ["settings"],
  })
  .input(SettingsListSchema)
  .output(SettingsListOutputSchema);

/**
 * Contract definition for the settings update endpoint.
 *
 * Updates an existing setting's value.
 */
const upsert = baseContract
  .route({
    method: "POST",
    path: "/settings",
    description: "Upsert a setting",
    successDescription: "Setting upserted successfully",
    tags: ["settings"],
  })
  .input(SettingsUpsertSchema)
  .output(z.string());

/**
 * Contract definition for the settings delete endpoint.
 *
 * Deletes a setting by its key.
 */
const del = baseContract
  .route({
    method: "DELETE",
    path: "/settings/:key",
    description: "Delete a setting",
    successDescription: "Setting deleted successfully",
    tags: ["settings"],
  })
  .input(SettingsDeleteSchema)
  .output(z.object({ success: z.boolean() }));

/**
 * Settings API contract collection.
 *
 * Exports all settings-related API contracts for use in the main contract registry.
 * Provides CRUD operations for application settings management.
 *
 * Available endpoints:
 * - read: Retrieve a specific setting by key
 * - list: Retrieve paginated list of all settings
 * - create: Create a new setting
 * - update: Update an existing setting's value
 * - delete: Delete a setting
 */
export const settingsContract = {
  read,
  list,
  upsert,
  delete: del,
};
