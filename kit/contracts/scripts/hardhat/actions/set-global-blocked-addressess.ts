import { Address } from "viem";
import { atkDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedAddresses = async (addresses: Address[]) => {
  console.log(`[Set global blocked addresses] → Starting address blocking...`);

  const addressBlockListModule =
    atkDeployer.getAddressBlockListModuleContract();

  const transactionHash =
    await addressBlockListModule.write.setGlobalBlockedAddresses([
      addresses,
      true,
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Set global blocked addresses] ✓ ${addresses.join(", ")} blocked globally`
  );
};
