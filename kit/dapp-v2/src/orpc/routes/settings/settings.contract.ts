import { baseContract } from "@/orpc/procedures/base.contract";
import { z } from "zod/v4";
import { SettingsCreateSchema } from "./routes/settings.create.schema";
import { SettingsDeleteSchema } from "./routes/settings.delete.schema";
import {
  SettingsListOutputSchema,
  SettingsListSchema,
} from "./routes/settings.list.schema";
import {
  SettingSchema,
  SettingsReadSchema,
} from "./routes/settings.read.schema";
import { SettingsUpdateSchema } from "./routes/settings.update.schema";

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
  .output(SettingSchema.nullable());

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
 * Contract definition for the settings create endpoint.
 *
 * Creates a new setting with the specified key and value.
 */
const create = baseContract
  .route({
    method: "POST",
    path: "/settings",
    description: "Create a new setting",
    successDescription: "Setting created successfully",
    tags: ["settings"],
  })
  .input(SettingsCreateSchema)
  .output(SettingSchema);

/**
 * Contract definition for the settings update endpoint.
 *
 * Updates an existing setting's value.
 */
const update = baseContract
  .route({
    method: "PUT",
    path: "/settings/:key",
    description: "Update an existing setting",
    successDescription: "Setting updated successfully",
    tags: ["settings"],
  })
  .input(SettingsUpdateSchema)
  .output(SettingSchema);

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
  create,
  update,
  delete: del,
};
