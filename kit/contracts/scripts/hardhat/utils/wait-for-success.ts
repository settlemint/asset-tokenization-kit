import type { Hex, TransactionReceipt } from "viem";
import { parseRevertReason, withDecodedRevertReason } from "./decode-revert-reason";
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
  const maxRetries = _isCI() ? 2 : 0; // Retry up to 2 times in CI environments
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const receipt = await _waitForTransactionReceipt(
        transactionHash,
        attempt
      );

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
    } catch (error) {
      lastError = error as Error;

      // Only retry timeout errors in CI environments
      if (attempt < maxRetries && _isTimeoutError(lastError)) {
        console.log(
          `[Transaction] ⚠️  Attempt ${attempt + 1} failed due to timeout. Retrying... (${maxRetries - attempt} attempts remaining)`
        );
        // Wait a bit before retrying to allow network conditions to improve
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      // If we've exhausted retries or it's not a timeout error, throw
      break;
    }
  }

  // Enhance error message for CI environments
  if (_isCI() && lastError && _isTimeoutError(lastError)) {
    throw new Error(
      `${lastError.message}\n\n` +
        `CI Environment Detection: This error occurred in a CI environment after ${maxRetries + 1} attempts.\n` +
        `Troubleshooting steps:\n` +
        `1. Set ATK_TRANSACTION_TIMEOUT_SECONDS environment variable to increase timeout (e.g., ATK_TRANSACTION_TIMEOUT_SECONDS=300 for 5 minutes)\n` +
        `2. Check if the CI environment has sufficient resources\n` +
        `3. Consider running transactions in smaller batches\n` +
        `4. Check the blockchain explorer for transaction status: https://anvil.settlemint.com/tx/${transactionHash}`
    );
  }

  throw lastError!;
}

function _isTimeoutError(error: Error): boolean {
  return (
    error.message.includes("is still pending after") ||
    error.message.includes("TransactionReceiptNotFoundError") ||
    error.message.includes("timeout")
  );
}

function _isCI(): boolean {
  return Boolean(
    process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.BUILD_NUMBER ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.JENKINS_URL ||
      process.env.DRONE ||
      process.env.BUILDKITE
  );
}

function _getTimeoutConfig(): NetworkTimeoutConfig {
  const chain = getViemChain();
  const isCI = _isCI();

  // Custom timeout override via environment variable
  const customTimeoutSeconds = process.env.ATK_TRANSACTION_TIMEOUT_SECONDS;
  if (customTimeoutSeconds) {
    const timeoutMs = parseInt(customTimeoutSeconds) * 1000;
    const pollingInterval = chain.id === 31337 ? 100 : 1000; // Faster polling for local
    const retryCount = Math.floor(timeoutMs / pollingInterval);

    return {
      pollingInterval,
      retryCount,
      timeoutDescription: `${customTimeoutSeconds} seconds (custom)`,
    };
  }

  // Anvil (local development)
  if (chain.id === 31337) {
    if (isCI) {
      // Longer timeout for CI environments due to potential resource constraints
      return {
        pollingInterval: 100, // 100ms - slightly slower than dev but faster than testnet
        retryCount: 1200, // 2 minute timeout (100ms * 1200 = 120s)
        timeoutDescription: "2 minutes (CI environment)",
      };
    }

    return {
      pollingInterval: 50, // 50ms - fast local feedback
      retryCount: 500, // 25 second timeout (50ms * 500 = 25s)
      timeoutDescription: "25 seconds",
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
  transactionHash: Hex,
  attempt: number = 0
): Promise<TransactionReceipt> {
  const publicClient = getPublicClient();
  const config = _getTimeoutConfig();

  const attemptPrefix = attempt > 0 ? ` (attempt ${attempt + 1})` : "";
  console.log(
    `[Transaction] Waiting for transaction ${transactionHash} to be mined (timeout: ${config.timeoutDescription})${attemptPrefix}...`
  );

  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      pollingInterval: config.pollingInterval,
      retryCount: config.retryCount,
    });

    console.log(
      `[Transaction] ✓ Transaction mined in block ${receipt.blockNumber}${attemptPrefix}`
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
        withDecodedRevertReason(() =>
          publicClient.call({
            to: transaction.to,
            data: transaction.input,
            value: transaction.value,
            blockNumber: receipt.blockNumber - 1n,
          })
        ),
    },
    {
      name: "Same Block",
      method: () =>
        withDecodedRevertReason(() =>
          publicClient.call({
            to: transaction.to,
            data: transaction.input,
            value: transaction.value,
            blockNumber: receipt.blockNumber,
          })
        ),
    },
    {
      name: "Latest State",
      method: () =>
        withDecodedRevertReason(() =>
          publicClient.call({
            to: transaction.to,
            data: transaction.input,
            value: transaction.value,
          })
        ),
    },
    {
      name: "With Original Gas",
      method: () =>
        withDecodedRevertReason(() =>
          publicClient.call({
            to: transaction.to,
            data: transaction.input,
            value: transaction.value,
            gas: transaction.gas,
          })
        ),
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

  // Check if the error was already decoded by withDecodedRevertReason
  if (simulationError?.message?.includes("The contract reverted with reason:")) {
    console.log(`  🎯 Revert reason already decoded: ${simulationError.message}`);
    throw simulationError;
  }

  // Try to decode the revert reason from different possible locations as fallback
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
