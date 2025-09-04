import { fixedYieldScheduleCreateContract } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.create.contract";
import { fixedYieldScheduleReadContract } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.read.contract";
import { fixedYieldScheduleTopUpContract } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.top-up.contract";

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
   * Create a new fixed yield schedule contract.
   *
   * Deploys a new fixed yield schedule contract with specified parameters
   * including yield rate, payment intervals, timing, and jurisdiction.
   * Returns the deployed contract address for subsequent operations.
   *
   * @see {@link ./routes/fixed-yield-schedule.create.contract} - Contract implementation
   */
  create: fixedYieldScheduleCreateContract,

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

  /**
   * Top up denomination asset in a fixed yield schedule.
   *
   * Adds denomination assets to an existing fixed yield schedule contract
   * to ensure sufficient funds are available for yield payments.
   * Returns the transaction hash of the top up operation.
   *
   * @see {@link ./routes/fixed-yield-schedule.top-up.contract} - Contract implementation
   */
  topUp: fixedYieldScheduleTopUpContract,
};
