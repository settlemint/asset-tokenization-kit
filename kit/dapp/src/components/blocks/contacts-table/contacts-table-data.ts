import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';

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

export type ContactsListItem = Awaited<ReturnType<typeof getContactsList>>[number];

export async function getContactsList(from?: Address) {
  const data = await portalClient.request(TransactionList, { from });
  return (
    data.getPendingAndRecentlyProcessedTransactions?.records.map((record) => ({
      ...record,
      status: record.receipt?.status ?? 'Pending',
    })) ?? []
  );
}
