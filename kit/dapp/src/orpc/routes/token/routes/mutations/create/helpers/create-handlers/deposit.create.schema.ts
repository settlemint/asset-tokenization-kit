/**
 * Deposit Token Creation Handler
 *
 * This handler creates deposit tokens through the ATKDepositFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating deposit tokens with configurable properties like name,
 * symbol, and decimal precision.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during deposit creation
 * 4. Returns the transaction hash of the successful deposit creation
 * @generator
 * @see {@link ./deposit.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod";

/**
 * Deposit token specific schema
 */
export const DepositTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.deposit),
});
