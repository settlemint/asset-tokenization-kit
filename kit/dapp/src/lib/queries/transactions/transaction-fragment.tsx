import { portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for transaction data
 *
 * @remarks
 * Contains basic transaction information from the Portal API
 */
export const TransactionFragment = portalGraphql(`
  fragment TransactionFragment on TransactionOutput {
    from
    createdAt
  }
`);

/**
 * Zod schema for validating transaction data
 *
 */
export const TransactionFragmentSchema = z.object({
  from: z.address(),
});

/**
 * Type definition for transaction data
 */
export type Transaction = ZodInfer<typeof TransactionFragmentSchema>;
