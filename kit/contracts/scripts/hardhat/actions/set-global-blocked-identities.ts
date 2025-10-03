import type { Address } from "viem";
import { atkDeployer } from "../services/deployer";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { encodeAddressParams } from "../utils/encode-address-params";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedIdentities = async (identities: Address[]) => {
  console.log(
    `[Set global blocked identities] → Starting identity blocking...`
  );

  const identityBlockListModule =
    atkDeployer.getIdentityBlockListModuleContract();

  const compliance = atkDeployer.getComplianceContract();

  const transactionHash = await withDecodedRevertReason(() =>
    compliance.write.addGlobalComplianceModule([
      identityBlockListModule.address,
      encodeAddressParams(identities),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set global blocked identities] ✓ ${identities.join(", ")} blocked globally`
  );
};
