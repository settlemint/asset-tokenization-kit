import { AbstractActor } from "../entities/actors/abstract-actor";
import { atkDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const recoverIdentity = async (
  lostActor: AbstractActor,
  newActor: AbstractActor
) => {
  const newIdentity = await newActor.getIdentity();

  const transactionHash = await atkDeployer
    .getIdentityRegistryContract()
    .write.recoverIdentity([lostActor.address, newActor.address, newIdentity]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Recover identity] ${lostActor.name} (${lostActor.address}) recovered identity to ${newActor.name} (${newActor.address})`
  );
};
