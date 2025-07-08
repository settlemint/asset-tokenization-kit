import type { Hex, TransactionReceipt } from "viem";
import { parseRevertReason } from "./decode-revert-reason";
import { getPublicClient } from "./public-client";
import { getViemChain } from "./viem-chain";

type NetworkTimeoutConfig = {
  pollingInterval: number;
  retryCount: number;
  timeoutDescription: string;
};

export async function waitForSuccess(
  transactionHash: Hex
): Promise<TransactionReceipt> {
  const receipt = await _waitForTransactionReceipt(transactionHash);

  if (receipt.status === "success") {
    return receipt;
  }

  if (receipt.status === "reverted") {
    await _analyzeRevertedTransaction(transactionHash, receipt);
  }

  // For any other non-success status
  throw new Error(
    `Transaction with hash ${transactionHash} failed with status: ${receipt.status}. ` +
      `Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}`
  );
}

function _getTimeoutConfig(): NetworkTimeoutConfig {
  const chain = getViemChain();

  // Anvil (local development)
  if (chain.id === 31337) {
    return {
      pollingInterval: 50, // 50ms - fast local feedback
      retryCount: 100, // 5 second timeout (50ms * 100 = 5s)
      timeoutDescription: "5 seconds",
    };
  }

  // Testnets (Sepolia, Goerli, etc.)
  if (chain.testnet) {
    return {
      pollingInterval: 500, // 500ms - reasonable for testnets
      retryCount: 120, // 1 minute timeout (500ms * 120 = 60s)
      timeoutDescription: "1 minute",
    };
  }

  // Mainnet or other networks
  return {
    pollingInterval: 1000, // 1 second - conservative for mainnet
    retryCount: 300, // 5 minute timeout (1000ms * 300 = 300s)
    timeoutDescription: "5 minutes",
  };
}

async function _waitForTransactionReceipt(
  transactionHash: Hex
): Promise<TransactionReceipt> {
  const publicClient = getPublicClient();
  const config = _getTimeoutConfig();

  console.log(
    `[Transaction] Waiting for transaction ${transactionHash} to be mined (timeout: ${config.timeoutDescription})...`
  );

  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      pollingInterval: config.pollingInterval,
      retryCount: config.retryCount,
    });

    console.log(
      `[Transaction] ✓ Transaction mined in block ${receipt.blockNumber}`
    );

    return receipt;
  } catch (error: any) {
    if (error.name === "TransactionReceiptNotFoundError") {
      // Enhanced error analysis to distinguish between different failure causes
      const analysis = await _analyzeTransactionTimeout(
        transactionHash,
        config
      );
      throw new Error(analysis.message);
    }
    throw error;
  }
}

async function _analyzeTransactionTimeout(
  transactionHash: Hex,
  config: NetworkTimeoutConfig
): Promise<{ message: string }> {
  const publicClient = getPublicClient();

  try {
    // Check if the transaction still exists in the mempool
    const transaction = await publicClient.getTransaction({
      hash: transactionHash,
    });

    if (!transaction) {
      return {
        message: `Transaction ${transactionHash} was not found. It may have been dropped from the mempool or the transaction hash is invalid.`,
      };
    }

    // Get current gas price for comparison
    const currentGasPrice = await publicClient.getGasPrice();
    const txGasPrice = transaction.gasPrice || 0n;

    // Analyze gas price (the main cause of "never mined" scenarios)
    const gasPriceAnalysis = _analyzeGasPriceForMining(
      transaction,
      currentGasPrice
    );

    if (!gasPriceAnalysis.isAdequate) {
      return {
        message:
          `Transaction ${transactionHash} was not mined within ${config.timeoutDescription}. ` +
          `Likely cause: ${gasPriceAnalysis.issue}. ` +
          `${gasPriceAnalysis.recommendation}`,
      };
    }

    // Gas price is adequate, so this is likely network congestion
    return {
      message:
        `Transaction ${transactionHash} is still pending after ${config.timeoutDescription}. ` +
        `Gas price appears adequate (${gasPriceAnalysis.summary}). ` +
        `This indicates network congestion. Consider waiting longer or checking a block explorer.`,
    };
  } catch (error: any) {
    // If we can't get transaction details, fall back to generic message
    return {
      message:
        `Transaction ${transactionHash} was not mined within ${config.timeoutDescription}. ` +
        `Unable to analyze transaction details (${error.message}). ` +
        `This might indicate the transaction was dropped or there are network issues. ` +
        `Please check the transaction status on a block explorer.`,
    };
  }
}

function _analyzeGasPriceForMining(
  transaction: any,
  currentGasPrice: bigint
): {
  isAdequate: boolean;
  issue: string;
  recommendation: string;
  summary: string;
} {
  const txGasPrice = transaction.gasPrice || 0n;

  if (txGasPrice === 0n) {
    return {
      isAdequate: false,
      issue: "Zero gas price",
      recommendation: "Set a proper gas price for the transaction to be mined.",
      summary: "Transaction gas price: 0 wei",
    };
  }

  if (currentGasPrice === 0n) {
    // Can't compare against current gas price
    return {
      isAdequate: true,
      issue: "",
      recommendation: "",
      summary: `Transaction gas price: ${txGasPrice.toString()} wei (current network price unavailable)`,
    };
  }

  // Check if gas price is significantly lower than current network price
  const gasPriceRatio = (txGasPrice * 100n) / currentGasPrice;

  if (gasPriceRatio < 50n) {
    return {
      isAdequate: false,
      issue: "Gas price too low",
      recommendation: `Cancel and resubmit with higher gas price. Current network price: ${currentGasPrice.toString()} wei.`,
      summary: `Transaction gas price: ${txGasPrice.toString()} wei (${gasPriceRatio}% of current network price)`,
    };
  }

  if (gasPriceRatio < 80n) {
    return {
      isAdequate: false,
      issue: "Gas price below recommended threshold",
      recommendation: `Consider increasing gas price for faster mining. Current network price: ${currentGasPrice.toString()} wei.`,
      summary: `Transaction gas price: ${txGasPrice.toString()} wei (${gasPriceRatio}% of current network price)`,
    };
  }

  // Gas price appears adequate
  return {
    isAdequate: true,
    issue: "",
    recommendation: "",
    summary: `Transaction gas price: ${txGasPrice.toString()} wei (${gasPriceRatio}% of current network price - adequate)`,
  };
}

async function _analyzeRevertedTransaction(
  transactionHash: Hex,
  receipt: TransactionReceipt
): Promise<never> {
  console.log(`\n=== TRANSACTION REVERT ANALYSIS ===`);
  console.log(`Transaction Hash: ${transactionHash}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Transaction Index: ${receipt.transactionIndex}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(
    `Effective Gas Price: ${receipt.effectiveGasPrice?.toString() || "N/A"}`
  );

  try {
    const publicClient = getPublicClient();
    const transaction = await publicClient.getTransaction({
      hash: transactionHash,
    });

    await _logTransactionDetails(transaction, receipt);
    await _attemptTransactionSimulation(transaction, receipt);
    await _checkBlockState(receipt);
  } catch (error: any) {
    // If we got here from a decoded error, re-throw it
    if (error.message?.includes("The contract reverted with reason:")) {
      throw error;
    }
    console.log(`\nFailed to analyze transaction: ${error?.message || error}`);
  }

  // Fallback to generic error if we couldn't decode the revert reason
  throw new Error(
    `Transaction with hash ${transactionHash} reverted. Status: ${receipt.status}. Block Number: ${receipt.blockNumber}, Tx Index: ${receipt.transactionIndex}. Gas used: ${receipt.gasUsed.toString()}. Check the contract logic and ensure all requirements are met.`
  );
}

async function _logTransactionDetails(
  transaction: any,
  receipt: TransactionReceipt
): Promise<void> {
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
  console.log(`Cumulative Gas Used: ${receipt.cumulativeGasUsed.toString()}`);
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
}

async function _attemptTransactionSimulation(
  transaction: any,
  receipt: TransactionReceipt
): Promise<void> {
  console.log(`\n--- ATTEMPTING TRANSACTION SIMULATION ---`);

  const publicClient = getPublicClient();
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

      await _analyzeSimulationError(simulationError);
    }
  }
}

async function _analyzeSimulationError(simulationError: any): Promise<void> {
  // Extract and log detailed error information
  console.log(`  Error details:`);
  console.log(`    Name: ${simulationError?.name || "Unknown"}`);
  console.log(`    Message: ${simulationError?.message || "No message"}`);
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

async function _checkBlockState(receipt: TransactionReceipt): Promise<void> {
  console.log(`\n--- CHECKING BLOCK STATE ---`);
  try {
    const publicClient = getPublicClient();
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
}
