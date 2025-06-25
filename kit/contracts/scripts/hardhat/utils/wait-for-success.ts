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
    console.log(`\n=== TRANSACTION REVERT ANALYSIS ===`);
    console.log(`Transaction Hash: ${transactionHash}`);
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Transaction Index: ${receipt.transactionIndex}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(
      `Effective Gas Price: ${receipt.effectiveGasPrice?.toString() || "N/A"}`
    );

    try {
      // Get the original transaction to analyze it
      const transaction = await publicClient.getTransaction({
        hash: transactionHash,
      });

      console.log(`\n--- ORIGINAL TRANSACTION DETAILS ---`);
      console.log(`From: ${transaction.from}`);
      console.log(`To: ${transaction.to}`);
      console.log(`Value: ${transaction.value?.toString() || "0"} wei`);
      console.log(`Gas Limit: ${transaction.gas?.toString() || "N/A"}`);
      console.log(`Gas Price: ${transaction.gasPrice?.toString() || "N/A"}`);
      console.log(`Nonce: ${transaction.nonce}`);
      console.log(`Input Data: ${transaction.input}`);
      console.log(`Input Data Length: ${transaction.input.length} characters`);

      // Try to decode the function call if possible
      if (transaction.input && transaction.input.length >= 10) {
        const selector = transaction.input.slice(0, 10);
        console.log(`Function Selector: ${selector}`);
      }

      console.log(`\n--- TRANSACTION RECEIPT DETAILS ---`);
      console.log(`Status: ${receipt.status}`);
      console.log(
        `Cumulative Gas Used: ${receipt.cumulativeGasUsed.toString()}`
      );
      console.log(`Logs Count: ${receipt.logs.length}`);
      console.log(`Logs Bloom: ${receipt.logsBloom}`);

      // Log any events that were emitted (even on revert, some events might be there)
      if (receipt.logs.length > 0) {
        console.log(`\n--- EMITTED LOGS ---`);
        receipt.logs.forEach((log, index) => {
          console.log(`Log ${index}:`);
          console.log(`  Address: ${log.address}`);
          console.log(`  Topics: ${log.topics.join(", ")}`);
          console.log(`  Data: ${log.data}`);
        });
      }

      console.log(`\n--- ATTEMPTING TRANSACTION SIMULATION ---`);

      // Try multiple simulation approaches with more detailed logging
      const simulationMethods = [
        {
          name: "Previous Block",
          method: () =>
            publicClient.call({
              to: transaction.to,
              data: transaction.input,
              value: transaction.value,
              blockNumber: receipt.blockNumber - 1n,
            }),
        },
        {
          name: "Same Block",
          method: () =>
            publicClient.call({
              to: transaction.to,
              data: transaction.input,
              value: transaction.value,
              blockNumber: receipt.blockNumber,
            }),
        },
        {
          name: "Latest State",
          method: () =>
            publicClient.call({
              to: transaction.to,
              data: transaction.input,
              value: transaction.value,
            }),
        },
        {
          name: "With Original Gas",
          method: () =>
            publicClient.call({
              to: transaction.to,
              data: transaction.input,
              value: transaction.value,
              gas: transaction.gas,
            }),
        },
      ];

      for (const { name, method } of simulationMethods) {
        try {
          console.log(`Trying simulation: ${name}...`);
          const result = await method();
          console.log(
            `  ✓ Simulation succeeded (unexpected): ${JSON.stringify(result)}`
          );
        } catch (simulationError: any) {
          console.log(
            `  ✗ Simulation failed: ${simulationError?.message || simulationError}`
          );

          // Extract and log detailed error information
          console.log(`  Error details:`);
          console.log(`    Name: ${simulationError?.name || "Unknown"}`);
          console.log(
            `    Message: ${simulationError?.message || "No message"}`
          );
          console.log(`    Code: ${simulationError?.code || "No code"}`);
          console.log(`    Cause: ${simulationError?.cause || "No cause"}`);

          // Try to decode the revert reason from different possible locations
          const possibleRevertData = [
            simulationError?.cause?.data,
            simulationError?.data,
            simulationError?.details?.data,
            simulationError?.shortMessage,
            simulationError?.details,
            simulationError?.cause?.details,
          ];

          for (const [dataIndex, revertData] of possibleRevertData.entries()) {
            if (
              revertData &&
              typeof revertData === "string" &&
              revertData.startsWith("0x") &&
              revertData.length > 2
            ) {
              console.log(
                `  Found potential revert data (source ${dataIndex}): ${revertData}`
              );
              try {
                const decodedError = await parseRevertReason(revertData as Hex);
                if (decodedError) {
                  console.log(
                    `  🎯 Successfully decoded revert reason: ${decodedError.message}`
                  );
                  throw decodedError;
                }
              } catch (decodeErr) {
                console.log(`  Failed to decode revert data: ${decodeErr}`);
              }
            }
          }

          // Log the full error object structure for debugging
          console.log(
            `  Full error object keys: ${Object.keys(simulationError || {}).join(", ")}`
          );
        }
      }

      console.log(`\n--- CHECKING BLOCK STATE ---`);
      try {
        const block = await publicClient.getBlock({
          blockNumber: receipt.blockNumber,
        });
        console.log(`Block timestamp: ${block.timestamp}`);
        console.log(`Block gas limit: ${block.gasLimit.toString()}`);
        console.log(`Block gas used: ${block.gasUsed.toString()}`);
        console.log(`Block transactions count: ${block.transactions.length}`);
      } catch (blockErr) {
        console.log(`Failed to get block info: ${blockErr}`);
      }
    } catch (error: any) {
      // If we got here from a decoded error, re-throw it
      if (error.message?.includes("The contract reverted with reason:")) {
        throw error;
      }
      console.log(
        `\nFailed to analyze transaction: ${error?.message || error}`
      );
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
