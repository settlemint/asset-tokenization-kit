import { create } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.create";
import { read } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.read";
import { topUp } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.top-up";

/**
 * Fixed yield schedule router configuration.
 *
 * This router organizes all fixed yield schedule related API endpoints
 * into a cohesive namespace, providing structured access to yield schedule
 * functionality within the broader ORPC router hierarchy.
 *
 * The router follows the established pattern of the monorepo, providing:
 * - Type-safe route definitions
 * - Consistent error handling
 * - Proper middleware composition
 * - OpenAPI documentation integration
 *
 * Available routes:
 * - create: Deploy a new fixed yield schedule contract
 * - read: Retrieve detailed information about a specific fixed yield schedule
 *
 * Future routes can be added here as needed, such as:
 * - list: Get multiple yield schedules with filtering
 * - stats: Get aggregated statistics about yield schedules
 * - periods: Get detailed period information
 */
const routes = {
  /**
   * Create a new fixed yield schedule contract.
   *
   * Deploys a new yield schedule contract with specified parameters
   * including yield rate, payment intervals, timing, and jurisdiction.
   * Returns the deployed contract address for subsequent operations.
   *
   * @see {@link ./routes/fixed-yield-schedule.create} - Implementation details
   */
  create,

  /**
   * Read fixed yield schedule details by contract address.
   *
   * Provides comprehensive access to yield schedule configuration,
   * yield tracking metrics, period management, and denomination
   * asset information for client applications.
   *
   * @see {@link ./routes/fixed-yield-schedule.read} - Implementation details
   */
  read,

  /**
   * Top up denomination asset in a fixed yield schedule.
   *
   * Adds denomination assets to an existing fixed yield schedule contract
   * to ensure sufficient funds are available for yield payments.
   * Returns the transaction hash of the top up operation.
   *
   * @see {@link ./routes/fixed-yield-schedule.top-up} - Implementation details
   */
  topUp,
};

export default routes;
