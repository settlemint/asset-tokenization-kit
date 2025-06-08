import { z } from "zod";

/**
 * Bootstrap data schema definition.
 *
 * This Zod schema defines the structure and validation rules for bootstrap entities
 * throughout the application. It serves as the single source of truth for bootstrap
 * data validation, ensuring consistency across API endpoints, database operations,
 * and client-side forms.
 *
 * The schema is used for:
 * - API request/response validation
 * - Database entity type generation
 * - Client-side form validation
 * - TypeScript type inference
 */
export const BootstrapSchema = z.object({
  /**
   * Unique identifier for the bootstrap entry.
   *
   * A string-based ID that uniquely identifies each bootstrap entry in the system.
   * This could be a UUID, nanoid, or other unique string format depending
   * on the application's ID generation strategy.
   *
   * Validation:
   * - Must be a non-empty string
   */
  id: z.string().min(1, "ID cannot be empty"),

  /**
   * Display name of the bootstrap entry.
   *
   * A human-readable name for the bootstrap entry, used for display purposes
   * throughout the application.
   *
   * Validation:
   * - Required field (cannot be empty)
   * - Maximum length of 100 characters to prevent UI overflow
   * - Trimmed to remove leading/trailing whitespace
   */
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),

  /**
   * Bootstrap configuration data.
   *
   * The main configuration object containing the bootstrap settings and
   * parameters required for the bootstrap process.
   *
   * Validation:
   * - Required field
   * - Must be a valid JSON object
   */
  config: z.record(z.any()).describe("Bootstrap configuration object"),

  /**
   * Bootstrap status.
   *
   * Indicates the current status of the bootstrap process.
   *
   * Validation:
   * - Must be one of the predefined status values
   */
  status: z.enum(["pending", "running", "completed", "failed"]).default("pending"),

  /**
   * Optional description of the bootstrap entry.
   *
   * A detailed description providing additional information about the bootstrap
   * configuration, its purpose, or other relevant details.
   *
   * Validation:
   * - Optional field
   * - Maximum length of 500 characters for reasonable content limits
   * - Trimmed to remove leading/trailing whitespace when provided
   */
  description: z
    .string()
    .max(500, "Description too long")
    .trim()
    .optional()
    .or(z.literal("")),

  /**
   * Timestamp when the bootstrap was created.
   *
   * ISO string representing when this bootstrap entry was created.
   *
   * Validation:
   * - Must be a valid date string
   */
  createdAt: z.string().datetime(),

  /**
   * Timestamp when the bootstrap was last updated.
   *
   * ISO string representing when this bootstrap entry was last modified.
   *
   * Validation:
   * - Must be a valid date string
   */
  updatedAt: z.string().datetime(),
});