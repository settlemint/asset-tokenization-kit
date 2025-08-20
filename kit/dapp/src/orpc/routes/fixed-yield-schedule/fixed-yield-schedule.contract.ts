import { fixedYieldScheduleReadContract } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.read.contract";

/**
 * ORPC contract definition for fixed yield schedule API endpoints.
 *
 * This contract defines the type-safe interface for all fixed yield schedule
 * related operations, providing structured access to yield schedule data
 * and functionality within the asset tokenization platform.
 *
 * The contract serves as the foundation for:
 * - Client-side type-safe API calls
 * - OpenAPI documentation generation
 * - Runtime request/response validation
 * - Development-time type checking
 *
 * Each property corresponds to a specific API endpoint with defined
 * input/output schemas and HTTP method specifications.
 */
export const fixedYieldScheduleContract = {
  /**
   * Read fixed yield schedule details by ID.
   *
   * Retrieves comprehensive information about a specific fixed yield schedule
   * including configuration, yield tracking, period management, and denomination
   * asset details. This endpoint provides the primary interface for accessing
   * yield schedule data in client applications.
   *
   * @see {@link ./routes/fixed-yield-schedule.read.contract} - Contract implementation
   */
  read: fixedYieldScheduleReadContract,
};
