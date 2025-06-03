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
   */
  id: z.string(),

  /**
   * Display name of the planet.
   *
   * A human-readable name for the planet, such as "Earth", "Mars", or
   * "Kepler-452b". This field is required and used for display purposes
   * throughout the application.
   */
  name: z.string(),

  /**
   * Optional description of the planet.
   *
   * A detailed description providing additional information about the planet,
   * such as its characteristics, composition, or other relevant details.
   * This field is optional to allow for minimal planet creation while
   * supporting rich content when available.
   */
  description: z.string().optional(),
});
