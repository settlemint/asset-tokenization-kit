import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

export const ReceiptFragment = portalGraphql(`
  fragment ReceiptFragment on TransactionReceiptOutput {
      revertReasonDecoded
      gasUsed
      blobGasPrice
      blobGasUsed
      blockHash
      blockNumber
      contractAddress
      cumulativeGasUsed
      effectiveGasPrice
      from
      logs
      logsBloom
      revertReason
      root
      status
      to
      transactionHash
      transactionIndex
      type
  }
`);

export const ReceiptFragmentSchema = z.object({
  status: z.string(),
  revertReasonDecoded: z.string().nullish(),
  blockNumber: z.coerce.number(),
  gasUsed: z.coerce.bigint(),
  blobGasPrice: z.coerce.bigint().nullish(),
  blobGasUsed: z.coerce.bigint().nullish(),
  blockHash: z.hash(),
  contractAddress: z.string().nullish(),
  cumulativeGasUsed: z.coerce.bigint(),
  effectiveGasPrice: z.coerce.bigint(),
  from: z.address(),
  logs: z.array(z.any()),
  logsBloom: z.string(),
  revertReason: z.string().nullish(),
  root: z.string().nullish(),
  to: z.address().nullish(),
  transactionHash: z.hash(),
  transactionIndex: z.coerce.number(),
  type: z.string(),
});

export type Receipt = ZodInfer<typeof ReceiptFragmentSchema>;

/**
 * GraphQL fragment for transaction data
 *
 * @remarks
 * Contains basic transaction information from the Portal API
 */
export const TransactionFragment = portalGraphql(
  `
  fragment TransactionFragment on TransactionOutput {
    address
    createdAt
    from
    functionName
    metadata
    transactionHash
    updatedAt
    receipt {
      ...ReceiptFragment
    }
  }
`,
  [ReceiptFragment]
);

/**
 * Zod schema for validating transaction data
 *
 */
export const TransactionFragmentSchema = z.object({
  from: z.address(),
  functionName: z.string(),
  transactionHash: z.hash(),
  updatedAt: z.coerce.date(),
  receipt: ReceiptFragmentSchema.optional(),
  address: z.address(),
  createdAt: z.coerce.date(),
});

/**
 * Type definition for transaction data
 */
export type Transaction = ZodInfer<typeof TransactionFragmentSchema>;

export const IndexingFragment = theGraphGraphqlStarterkits(`
  fragment IndexingFragment on _Block_ {
    number
  }
`);

export const IndexingFragmentSchema = z.object({
  number: z.number(),
});
