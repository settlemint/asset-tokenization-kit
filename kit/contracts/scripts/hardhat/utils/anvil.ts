import { AbstractActor } from "../entities/actors/abstract-actor";

export async function mineAnvilBlock(actor: AbstractActor) {
  await actor.getWalletClient().request({
    method: "anvil_mine",
    params: [1],
  } as any);
}
