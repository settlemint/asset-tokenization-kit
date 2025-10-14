/**
 * Base Mutation Output Schema
 *
 * Common output structure for mutation operations that interact with the blockchain.
 * Provides a standardized response format including transaction hash and optional
 * post-mutation data fetching.
 */

import * as z from "zod";

export const BaseMutationOutputSchema = z.object({
  /**
   * The transaction hash of the blockchain transaction.
   * This can be used to track the transaction status on block explorers.
   */
  txHash: z.string().describe("The transaction hash"),
});
