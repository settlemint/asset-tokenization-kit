import { baseContract } from "@/orpc/procedures/base.contract";
import { z } from "zod";
import { SettingsDeleteSchema } from "./routes/settings.delete.schema";
import {
  SettingsListOutputSchema,
  SettingsListSchema,
} from "./routes/settings.list.schema";
import { SettingsReadSchema } from "./routes/settings.read.schema";
import { SettingsUpsertSchema } from "./routes/settings.upsert.schema";
import { ThemeGetSchema } from "./routes/theme.get.schema";
import {
  ThemeUpdateOutputSchema,
  ThemeUpdateSchema,
} from "./routes/theme.update.schema";
import {
  ThemePreviewOutputSchema,
  ThemePreviewSchema,
} from "./routes/theme.preview.schema";
import { themeConfigSchema } from "@/components/theme/lib/schema";
import {
  ThemeLogoUploadOutputSchema,
  ThemeLogoUploadSchema,
} from "./routes/theme.upload-logo.schema";

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
 * Contract definition for the theme get endpoint.
 *
 * Retrieves the current theme configuration.
 */
const themeGet = baseContract
  .route({
    method: "GET",
    path: "/settings/theme",
    description: "Get current theme configuration",
    successDescription: "Theme retrieved successfully",
    tags: ["settings", "theme"],
  })
  .input(ThemeGetSchema)
  .output(themeConfigSchema);

/**
 * Contract definition for the theme update endpoint.
 *
 * Updates the theme configuration.
 */
const themeUpdate = baseContract
  .route({
    method: "POST",
    path: "/settings/theme",
    description: "Update theme configuration",
    successDescription: "Theme updated successfully",
    tags: ["settings", "theme"],
  })
  .input(ThemeUpdateSchema)
  .output(ThemeUpdateOutputSchema);

/**
 * Contract definition for the theme preview endpoint.
 *
 * Stores a temporary theme preview scoped to the current editor.
 */
const themePreview = baseContract
  .route({
    method: "POST",
    path: "/settings/theme/preview",
    description: "Cache a theme preview payload",
    successDescription: "Theme preview cached successfully",
    tags: ["settings", "theme"],
  })
  .input(ThemePreviewSchema)
  .output(ThemePreviewOutputSchema);

/**
 * Contract definition for the theme logo upload endpoint.
 *
 * Uploads a new logo asset to branding storage.
 */
const themeUploadLogo = baseContract
  .route({
    method: "POST",
    path: "/settings/theme/logo",
    description: "Upload theme logo asset",
    successDescription: "Theme logo uploaded successfully",
    tags: ["settings", "theme"],
  })
  .input(ThemeLogoUploadSchema)
  .output(ThemeLogoUploadOutputSchema);

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
 * - theme.get: Retrieve theme configuration
 * - theme.update: Update theme configuration
 * - theme.uploadLogo: Upload a new theme logo asset
 * - theme.preview: Cache a theme preview payload
 */
export const settingsContract = {
  read,
  list,
  upsert,
  delete: del,
  theme: {
    get: themeGet,
    update: themeUpdate,
    uploadLogo: themeUploadLogo,
    preview: themePreview,
  },
};
