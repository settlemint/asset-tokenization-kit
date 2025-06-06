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
