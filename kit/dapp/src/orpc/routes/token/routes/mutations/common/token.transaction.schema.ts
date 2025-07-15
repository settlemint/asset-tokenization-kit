import { MutationOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

/**
 * Generic output schema for token transaction operations
 * This is used for all token operations that return a transaction hash
 */
export const TokenTransactionOutputSchema = MutationOutputSchema;
