import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { FragmentOf } from '@settlemint/sdk-portal';

const ReceiptFragment = portalGraphql(`
  fragment ReceiptFragment on TransactionReceiptOutput {
    status
    revertReasonDecoded
    contractAddress
    blockNumber
    logs
  }
`);

const GetTransaction = portalGraphql(
  `
  query GetTransaction($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      metadata
      receipt {
        ...ReceiptFragment
      }
    }
  }
`,
  [ReceiptFragment]
);

export async function waitForTransactionMining(transactionHash: string) {
  let receipt: FragmentOf<typeof ReceiptFragment> | null = null;
  let metadata: Record<string, unknown> | null = null;
  const startTime = Date.now();
  const TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

  while (!receipt || !metadata) {
    if (Date.now() - startTime > TIMEOUT) {
      throw new Error(
        'Transaction mining timed out after 3 minutes. Please check the transaction status in your wallet or block explorer.'
      );
    }

    const transaction = await portalClient.request(GetTransaction, { transactionHash });
    receipt = transaction.getTransaction?.receipt ?? null;
    metadata = transaction.getTransaction?.metadata ?? null;

    if (receipt?.status === 'Reverted') {
      throw new Error(
        `Transaction failed: ${
          receipt.revertReasonDecoded ?? 'Unknown error'
        }. Block number: ${receipt.blockNumber}. Contract address: ${receipt.contractAddress ?? 'N/A'}`
      );
    }

    if (!receipt) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { receipt, metadata };
}
