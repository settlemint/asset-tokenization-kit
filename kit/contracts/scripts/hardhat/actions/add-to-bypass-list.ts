import { Actor } from "../entities/actor";
import { atkDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const addToBypassList = async (actors: Actor[]) => {
  console.log(`[Add to bypass list] → Starting...`);

  const transactionHash = await atkDeployer
    .getComplianceContract()
    .write.addMultipleToBypassList([actors.map((actor) => actor.address)]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Add to bypass list] ✓ ${actors.map((actor) => actor.name).join(", ")} added to bypass list`
  );
};
