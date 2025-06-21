import type { Hex, TransactionReceipt } from "viem";
import { getPublicClient } from "./public-client";

export async function waitForSuccess(transactionHash: Hex) {
  const publicClient = getPublicClient();
  const receipt: TransactionReceipt =
    await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      pollingInterval: 50,
    });

  if (receipt.status === "success") {
    return receipt;
  }

  if (receipt.status === "reverted") {
    // Note: To get the specific revert reason, you may need to simulate the transaction
    // using `publicClient.call` with the original transaction parameters and blockNumber,
    // and then decode the error if it's a custom error (requires ABI).
    // Tools like Tenderly or Hardhat's console.log in Solidity can also help.
    throw new Error(
      `Transaction with hash ${transactionHash} reverted. Status: ${receipt.status}. Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}`
    );
  }

  // For any other non-success status, though 'reverted' is the primary failure mode.
  throw new Error(
    `Transaction with hash ${transactionHash} failed with status: ${receipt.status}. Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}`
  );
}
