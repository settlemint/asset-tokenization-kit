import { AbstractActor } from "../entities/actors/abstract-actor";

export async function mineAnvilBlock(actor: AbstractActor) {
  await actor.getWalletClient().request({
    method: "anvil_mine",
    params: [1],
  } as any);

  console.log(`[Anvil] Mined a block`);
}

export const increaseAnvilTime = async (
  actor: AbstractActor,
  seconds: number
) => {
  await actor.getWalletClient().request({
    method: "evm_increaseTime",
    params: [seconds],
  } as any);

  console.log(`[Anvil] Increased time by ${seconds} seconds`);
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
