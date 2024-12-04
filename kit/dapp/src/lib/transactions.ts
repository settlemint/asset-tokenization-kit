export interface TransactionReceiptWithDecodedError {
  blockNumber: string;
  status: "Success" | "Reverted";
  revertReasonDecoded?: string | null;
  contractAddress?: string | null;
}

function checkReceipt(receipt: TransactionReceiptWithDecodedError) {
  if (receipt.status === "Success") {
    return receipt;
  }
  if (receipt.revertReasonDecoded) {
    throw new Error(`Transaction failed: ${receipt.revertReasonDecoded}`);
  }
  throw new Error("Transaction failed");
}

export interface WaitForTransactionReceiptOptions {
  receiptFetcher: () => Promise<TransactionReceiptWithDecodedError | undefined | null>;
}

export async function waitForTransactionReceipt(options: WaitForTransactionReceiptOptions) {
  const startTime = Date.now();
  const timeout = 240000; // 4 minutes

  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await options.receiptFetcher();
      if (receipt) {
        return checkReceipt(receipt);
      }
    } catch {
      // retry
    }

    // Wait for 500 milliseconds before the next attempt
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Transaction not processed within ${timeout / 1000} seconds`);
}
