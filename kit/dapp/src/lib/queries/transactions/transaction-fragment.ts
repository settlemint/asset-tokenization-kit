import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { t, type StaticDecode } from "@/lib/utils/typebox";

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

export const IndexingFragment = theGraphGraphqlKit(`
  fragment IndexingFragment on _Block_ {
    number
  }
`);

export const IndexingFragmentSchema = t.Object({
  number: t.Number({
    description: "The block number",
  }),
});

export type IndexingFragmentType = StaticDecode<typeof IndexingFragmentSchema>;
