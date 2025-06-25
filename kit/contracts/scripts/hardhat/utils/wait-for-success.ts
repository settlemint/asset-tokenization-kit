import type { Hex, TransactionReceipt } from "viem";
import { parseRevertReason } from "./decode-revert-reason";
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
    console.log(`Transaction ${transactionHash} reverted. Attempting to decode revert reason...`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    try {
      // Get the original transaction to simulate it
      const transaction = await publicClient.getTransaction({
        hash: transactionHash,
      });
      
      console.log(`Simulating transaction to: ${transaction.to}, data: ${transaction.input}`);
      
      // Try multiple simulation approaches
      const simulationMethods = [
        // Method 1: Simulate at the previous block
        () => publicClient.call({
          to: transaction.to,
          data: transaction.input,
          value: transaction.value,
          blockNumber: receipt.blockNumber - 1n,
        }),
        // Method 2: Simulate at the same block (if supported)
        () => publicClient.call({
          to: transaction.to,
          data: transaction.input,
          value: transaction.value,
          blockNumber: receipt.blockNumber,
        }),
        // Method 3: Simulate without block number (latest state)
        () => publicClient.call({
          to: transaction.to,
          data: transaction.input,
          value: transaction.value,
        }),
      ];
      
      for (const [index, simulationMethod] of simulationMethods.entries()) {
        try {
          console.log(`Trying simulation method ${index + 1}...`);
          await simulationMethod();
        } catch (simulationError: any) {
          console.log(`Simulation method ${index + 1} error:`, simulationError?.message || simulationError);
          
          // Try to decode the revert reason from different possible locations
          const revertData = simulationError?.cause?.data || 
            simulationError?.data || 
            simulationError?.details?.data ||
            simulationError?.shortMessage;
          
          if (revertData && typeof revertData === 'string' && revertData.startsWith('0x')) {
            console.log(`Found revert data: ${revertData}`);
            const decodedError = await parseRevertReason(revertData as Hex);
            if (decodedError) {
              console.log(`Successfully decoded revert reason: ${decodedError.message}`);
              throw decodedError;
            }
          }
          
          // If this is the last method, don't continue
          if (index === simulationMethods.length - 1) {
            console.log("All simulation methods failed to decode revert reason");
          }
        }
      }
    } catch (error: any) {
      // If we got here from a decoded error, re-throw it
      if (error.message?.includes('The contract reverted with reason:')) {
        throw error;
      }
      console.log("Failed to simulate transaction:", error?.message || error);
    }
    
    // Fallback to generic error if we couldn't decode the revert reason
    throw new Error(
      `Transaction with hash ${transactionHash} reverted. Status: ${receipt.status}. Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}. Gas used: ${receipt.gasUsed.toString()}. Check the contract logic and ensure all requirements are met.`
    );
  }

  // For any other non-success status, though 'reverted' is the primary failure mode.
  throw new Error(
    `Transaction with hash ${transactionHash} failed with status: ${receipt.status}. Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}`
  );
}
