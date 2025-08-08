import { Actor } from "../entities/actor";
import { atkDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const removeFromBypassList = async (actors: Actor[]) => {
  console.log(`[Remove from bypass list] → Starting...`);

  const transactionHash = await atkDeployer
    .getComplianceContract()
    .write.removeMultipleFromBypassList([actors.map((actor) => actor.address)]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Remove from bypass list] ✓ ${actors.map((actor) => actor.name).join(", ")} removed from bypass list`
  );
};
