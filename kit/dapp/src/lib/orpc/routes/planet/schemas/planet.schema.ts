import { z } from "zod";

/**
 * Planet data schema definition.
 *
 * This Zod schema defines the structure and validation rules for planet entities
 * throughout the application. It serves as the single source of truth for planet
 * data validation, ensuring consistency across API endpoints, database operations,
 * and client-side forms.
 *
 * The schema is used for:
 * - API request/response validation
 * - Database entity type generation
 * - Client-side form validation
 * - TypeScript type inference
 */
export const PlanetSchema = z.object({
  /**
   * Unique identifier for the planet.
   *
   * A string-based ID that uniquely identifies each planet in the system.
   * This could be a UUID, nanoid, or other unique string format depending
   * on the application's ID generation strategy.
   *
   * Validation:
   * - Must be a non-empty string
   */
  id: z.string().min(1, "ID cannot be empty"),

  /**
   * Display name of the planet.
   *
   * A human-readable name for the planet, such as "Earth", "Mars", or
   * "Kepler-452b". This field is required and used for display purposes
   * throughout the application.
   *
   * Validation:
   * - Required field (cannot be empty)
   * - Maximum length of 100 characters to prevent UI overflow
   * - Trimmed to remove leading/trailing whitespace
   */
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),

  /**
   * Optional description of the planet.
   *
   * A detailed description providing additional information about the planet,
   * such as its characteristics, composition, or other relevant details.
   * This field is optional to allow for minimal planet creation while
   * supporting rich content when available.
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
});
