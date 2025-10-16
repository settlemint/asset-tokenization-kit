import { createLogger } from "@settlemint/sdk-utils/logging";
import { addMonths, differenceInMilliseconds, isAfter } from "date-fns";
import {
  createTestClient,
  http,
  isAddress,
  publicActions,
  walletActions,
} from "viem";
import { anvil } from "viem/chains";

const logger = createLogger({ level: "info" });

// Create a test client for time manipulation
export const testClient = createTestClient({
  chain: anvil,
  transport: http("http://localhost:8545"),
  mode: "anvil",
})
  .extend(publicActions)
  .extend(walletActions);

// Helper function to get the current blockchain timestamp in milliseconds (like anvil)
export async function getAnvilTimeMilliseconds(): Promise<number> {
  const block = await testClient.getBlock({ blockTag: "latest" });
  return Number(block.timestamp) * 1000; // Convert to milliseconds
}

// Increase anvil time by specified seconds using viem test utilities
export async function increaseAnvilTime(seconds: number): Promise<void> {
  const beforeTime = await getAnvilTimeMilliseconds();
  logger.info(`[ANVIL] Current time: ${new Date(beforeTime).toISOString()}`);

  await testClient.setNextBlockTimestamp({
    timestamp: BigInt(beforeTime / 1000 + seconds),
  });
  await testClient.mine({ blocks: 1 }); // Mine a block to apply the time change

  const afterTime = await getAnvilTimeMilliseconds();
  logger.info(`[ANVIL] New time: ${new Date(afterTime).toISOString()}`);
  logger.info(
    `[ANVIL] Time increase: ${(afterTime - beforeTime) / 1000} seconds`
  );
}

/**
 * Increase anvil time to a specific date
 * @param date - The date to increase to
 */
export async function increaseAnvilTimeForDate(
  date: Date | undefined
): Promise<void> {
  if (!date) {
    throw new Error("Date is undefined");
  }
  const currentTime = await getAnvilTimeMilliseconds();
  const differenceMs = isAfter(date, currentTime)
    ? differenceInMilliseconds(date, currentTime)
    : 0;
  if (differenceMs <= 0) {
    return;
  }
  const differenceSeconds = Math.ceil(differenceMs / 1000) + 5; // Add 5 seconds to be safe
  await increaseAnvilTime(differenceSeconds);
  // Wait for the block to be indexed by the graph
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

// Helper function to get a future date based on current anvil blockchain time
// This ensures maturity dates are always valid relative to blockchain time, not system time
export async function getAnvilBasedFutureDate(
  monthsAhead: number
): Promise<Date> {
  const currentBlockchainTime = await getAnvilTimeMilliseconds();
  const currentBlockchainDate = new Date(currentBlockchainTime);
  const futureDate = addMonths(currentBlockchainDate, monthsAhead);

  return futureDate;
}

export async function isContractAddress(address: string) {
  if (!isAddress(address)) {
    return false;
  }
  const code = await testClient.getCode({ address });
  if (code === "0x") {
    return false;
  }

  return true;
}
