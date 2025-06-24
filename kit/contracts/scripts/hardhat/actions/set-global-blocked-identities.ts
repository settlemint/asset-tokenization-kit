import { Address } from "viem";
import { atkDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedIdentities = async (identities: Address[]) => {
  const identityBlockListModule =
    atkDeployer.getIdentityBlockListModuleContract();

  const transactionHash =
    await identityBlockListModule.write.setGlobalBlockedIdentities([
      identities,
      true,
    ]);

  await waitForSuccess(transactionHash);

  console.log(`[Set global blocked identities] ${identities.join(", ")}`);
};
