import { portalClient, portalGraphql } from '@/lib/settlemint/portal';

const TransactionListFragment = portalGraphql(
  `
  fragment TransactionListFragment on TransactionOutput {
    address
    createdAt
    from
    functionName
    metadata
    transactionHash
    updatedAt
    receipt {
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
  }
`
);

const TransactionList = portalGraphql(
  `
  query TransactionList($from: String) {
    getPendingAndRecentlyProcessedTransactions(from: $from) {
      records {
        ...TransactionListFragment
      }
    }
  }
`,
  [TransactionListFragment]
);

export type TransactionListItem = Awaited<ReturnType<typeof getTransactionsList>>[number];

export async function getTransactionsList(from?: string) {
  const data = await portalClient.request(TransactionList, { from });
  return (
    data.getPendingAndRecentlyProcessedTransactions?.records.map((record) => ({
      ...record,
      status: record.receipt?.status ?? 'Pending',
    })) ?? []
  );
}
