import { ethereumAddress } from "@atk/zod/ethereum-address";
import { fixedYieldSchedule } from "@atk/zod/fixed-yield-schedule";
import { z } from "zod";

/**
 * Input schema for reading a fixed yield schedule by ID.
 *
 * This schema validates the request parameters for the fixed yield schedule
 * read endpoint, ensuring the provided ID is a valid Ethereum address
 * representing the yield schedule contract.
 *
 * @property {string} id - The fixed yield schedule contract address (Ethereum address)
 * @remarks
 * - The id field must be a valid Ethereum address format (0x followed by 40 hex characters)
 * - This address corresponds to the deployed fixed yield schedule contract
 * - Used as the primary key for querying yield schedule data from TheGraph
 */
export const FixedYieldScheduleReadInputSchema = z.object({
  id: ethereumAddress.describe("The fixed yield schedule contract address"),
});

/**
 * Output schema for fixed yield schedule read endpoint.
 *
 * This schema defines the structure of the response data returned when
 * reading a fixed yield schedule, ensuring type safety and proper validation
 * of all yield schedule fields including configuration, tracking, and periods.
 *
 * The schema matches the GraphQL query structure and includes:
 * - Schedule configuration (start/end dates, rate, interval)
 * - Yield tracking (total claimed, unclaimed, and total yield)
 * - Denomination asset reference
 * - Period management (current, next, and all periods)
 */
export const FixedYieldScheduleSchema = fixedYieldSchedule();
