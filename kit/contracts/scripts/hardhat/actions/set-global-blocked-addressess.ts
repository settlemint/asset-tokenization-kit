import type { Address } from "viem";
import { atkDeployer } from "../services/deployer";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { encodeAddressParams } from "../utils/encode-address-params";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedAddresses = async (addresses: Address[]) => {
  console.log(`[Set global blocked addresses] → Starting address blocking...`);

  const addressBlockListModule =
    atkDeployer.getAddressBlockListModuleContract();

  const compliance = atkDeployer.getComplianceContract();

  const transactionHash = await withDecodedRevertReason(() =>
    compliance.write.addGlobalComplianceModule([
      addressBlockListModule.address,
      encodeAddressParams(addresses),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set global blocked addresses] ✓ ${addresses.join(", ")} blocked globally`
  );
};
