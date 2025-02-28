import { portalGraphql } from '@/lib/settlemint/portal';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
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

export const ReceiptFragment = portalGraphql(`
  fragment ReceiptFragment on TransactionReceiptOutput {
    status
    revertReasonDecoded
    blockNumber
  }
`);

export const ReceiptFragmentSchema = z.object({
  status: z.string(),
  revertReasonDecoded: z.string().nullish(),
  blockNumber: z.coerce.number(),
});

export const IndexingFragment = theGraphGraphqlStarterkits(`
  fragment IndexingFragment on _Block_ {
    number
  }
`);

export const IndexingFragmentSchema = z.object({
  number: z.number(),
});
