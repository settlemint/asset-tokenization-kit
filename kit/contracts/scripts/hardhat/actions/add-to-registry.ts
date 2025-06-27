import type { AbstractActor } from '../entities/actors/abstract-actor';

import { atkDeployer } from '../services/deployer';
import { waitForSuccess } from '../utils/wait-for-success';

export const addToRegistry = async (actor: AbstractActor) => {
  console.log('[Add to registry] → Starting registration...');

  const identity = await actor.getIdentity();

  const transactionHash = await atkDeployer
    .getIdentityRegistryContract()
    .write.registerIdentity([actor.address, identity, actor.countryCode]);

  await waitForSuccess(transactionHash);

  console.log(`[Add to registry] ✓ ${actor.name} added to registry`);
};

export async function batchAddToRegistry(actors: AbstractActor[]) {
  console.log('[Batch add to registry] → Starting batch registration...');

  const resolvedIdentities = await Promise.all(
    actors.map((actor) => actor.getIdentity())
  );
  const transactionHash = await atkDeployer
    .getIdentityRegistryContract()
    .write.batchRegisterIdentity([
      actors.map((actor) => actor.address),
      resolvedIdentities,
      actors.map((actor) => actor.countryCode),
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Batch add to registry] ✓ ${actors.map((actor) => actor.name).join(', ')} added to registry`
  );
}
