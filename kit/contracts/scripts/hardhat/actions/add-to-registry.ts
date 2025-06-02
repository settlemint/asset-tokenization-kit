import type { AbstractActor } from "../actors/abstract-actor";

import { smartProtocolDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export async function addToRegistry(actor: AbstractActor) {
  const identity = await actor.getIdentity();

  const transactionHash = await smartProtocolDeployer
    .getIdentityRegistryContract()
    .write.registerIdentity([actor.address, identity, actor.countryCode]);

  await waitForSuccess(transactionHash);

  console.log(`[Add to registry] ${actor.name} added to registry`);
}

export async function batchAddToRegistry(actors: AbstractActor[]) {
  const resolvedIdentities = await Promise.all(
    actors.map((actor) => actor.getIdentity())
  );
  const transactionHash = await smartProtocolDeployer
    .getIdentityRegistryContract()
    .write.batchRegisterIdentity([
      actors.map((actor) => actor.address),
      resolvedIdentities,
      actors.map((actor) => actor.countryCode),
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Batch add to registry] ${actors.map((actor) => actor.name).join(", ")} added to registry`
  );
}
