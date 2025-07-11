import type { AbstractActor } from "../entities/actors/abstract-actor";
import { getPublicClient } from "./public-client";

/**
 * Forces Anvil to mine new blocks with verification
 * @param actor The actor to use for mining
 * @param blocks Number of blocks to mine (default: 1)
 * @param shouldWait Whether to wait for verification (default: true)
 * @returns The new block number
 */
export async function mineAnvilBlock(
  actor: AbstractActor,
  options: {
    blocks?: number;
    shouldWait?: boolean;
  } = {}
): Promise<bigint> {
  const blocks = options.blocks ?? 1;
  const shouldWait = options.shouldWait ?? true;

  const publicClient = getPublicClient();

  // Get the current block number before mining
  const initialBlockNumber = await publicClient.getBlockNumber();
  const expectedBlockNumber = initialBlockNumber + BigInt(blocks);

  console.log(`[Anvil] Mining ${blocks} blocks...`);

  // Call the anvil_mine RPC method to mine specified number of blocks
  await actor.getWalletClient().request({
    method: "anvil_mine",
    params: [blocks],
  } as any);

  if (!shouldWait) {
    console.log(`[Anvil] Mined ${blocks} blocks (no verification)`);
    return expectedBlockNumber;
  }

  // Wait until block number has increased by the expected amount
  let currentBlockNumber: bigint;
  let attempts = 0;
  const maxAttempts = 20; // Set a reasonable limit to avoid infinite loops
  const delay = 100; // ms

  do {
    currentBlockNumber = await publicClient.getBlockNumber({
      cacheTime: 0,
    });

    if (currentBlockNumber < expectedBlockNumber) {
      console.log(
        `[Anvil] Waiting for blocks to be mined... Current: ${currentBlockNumber}, Expected: ${expectedBlockNumber}, Attempts: ${attempts + 1}`
      );
      // Small delay before checking again
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }
  } while (currentBlockNumber < expectedBlockNumber && attempts < maxAttempts);

  if (currentBlockNumber < expectedBlockNumber) {
    console.warn(
      `[Anvil] Failed to mine expected blocks after ${maxAttempts} attempts. Current: ${currentBlockNumber}, Expected: ${expectedBlockNumber}`
    );
  } else {
    console.log(
      `[Anvil] Successfully mined ${options.blocks} blocks. New block number: ${currentBlockNumber}`
    );
  }

  return currentBlockNumber;
}

export const setAnvilNextBlockTimestamp = async (
  actor: AbstractActor,
  timestamp: number
) => {
  await actor.getWalletClient().request({
    method: "evm_setNextBlockTimestamp",
    params: [timestamp],
  } as any);
};

/**
 * Increases Anvil time with verification
 * @param actor The actor to use for time manipulation
 * @param seconds Number of seconds to increase
 * @param shouldWait Whether to wait for verification (default: true)
 * @returns The new timestamp in seconds
 */
export const increaseAnvilTime = async (
  actor: AbstractActor,
  seconds: number,
  options: {
    shouldWait?: boolean;
  } = {
    shouldWait: true,
  }
): Promise<number> => {
  // Get the current timestamp before increasing time
  const initialTimestamp = await getAnvilTimeSeconds(actor);
  const expectedTimestamp = initialTimestamp + seconds;

  console.log(`[Anvil] Increasing time by ${seconds} seconds...`);

  // Call the evm_increaseTime RPC method
  await actor.getWalletClient().request({
    method: "evm_increaseTime",
    params: [seconds],
  } as any);

  if (!options.shouldWait) {
    console.log(
      `[Anvil] Increased time by ${seconds} seconds (no verification)`
    );
    return expectedTimestamp;
  }

  // Mine a block to ensure the time increase takes effect
  await mineAnvilBlock(actor, {
    blocks: 1,
    shouldWait: false,
  }); // Don't wait for verification here since we'll verify time separately

  // Wait and verify the time has actually increased
  let currentTimestamp: number;
  let attempts = 0;
  const maxAttempts = 10; // Fewer attempts needed for time changes
  const delay = 100; // ms

  do {
    currentTimestamp = await getAnvilTimeSeconds(actor);

    if (currentTimestamp < expectedTimestamp) {
      console.log(
        `[Anvil] Waiting for time to increase... Current: ${currentTimestamp}, Expected: ${expectedTimestamp}, Attempts: ${attempts + 1}`
      );
      // Small delay before checking again
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }
  } while (currentTimestamp < expectedTimestamp && attempts < maxAttempts);

  if (currentTimestamp < expectedTimestamp) {
    console.warn(
      `[Anvil] Failed to increase time as expected after ${maxAttempts} attempts. Current: ${currentTimestamp}, Expected: ${expectedTimestamp}`
    );
  } else {
    console.log(
      `[Anvil] Successfully increased time by ${seconds} seconds. New timestamp: ${currentTimestamp} (${new Date(currentTimestamp * 1000).toISOString()})`
    );
  }

  return currentTimestamp;
};

export const getAnvilTimeSeconds = async (
  actor: AbstractActor
): Promise<number> => {
  const block = (await actor.getWalletClient().request({
    method: "eth_getBlockByNumber",
    params: ["latest", false],
  } as any)) as { timestamp: string } | null;

  if (!block || !block.timestamp) {
    throw new Error("[Anvil] Failed to get current block or timestamp");
  }

  const timestamp = Number(block.timestamp);
  console.log(
    `[Anvil] Current block timestamp: ${timestamp} seconds (${new Date(timestamp * 1000).toISOString()})`
  );

  return timestamp;
};

export const getAnvilTimeMilliseconds = async (
  actor: AbstractActor
): Promise<number> => {
  const timestampSeconds = await getAnvilTimeSeconds(actor);
  const timestampMs = timestampSeconds * 1000;

  console.log(`[Anvil] Current block timestamp: ${timestampMs} milliseconds`);

  return timestampMs;
};

export const getAnvilDate = async (actor: AbstractActor): Promise<Date> => {
  const timestamp = await getAnvilTimeSeconds(actor);
  const date = new Date(timestamp * 1000);

  console.log(`[Anvil] Current block date: ${date.toISOString()}`);

  return date;
};

/**
 * Helper function to check if we're running on an Anvil node
 * @param actor The actor to use for the check
 * @returns True if running on Anvil
 */
export const isAnvilNode = async (actor: AbstractActor): Promise<boolean> => {
  try {
    // Try to call an Anvil-specific method
    await actor.getWalletClient().request({
      method: "anvil_version",
      params: [],
    } as any);
    return true;
  } catch {
    return false;
  }
};
