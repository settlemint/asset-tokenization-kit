import { type Address } from "viem";
import { ATKRoles } from "../constants/roles";
import type { Actor } from "../entities/actor";
import { atkDeployer } from "../services/deployer";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { waitForSuccess } from "../utils/wait-for-success";

export const grantSystemRoles = async (
  admin: Actor,
  roles: (typeof ATKRoles.people)[keyof typeof ATKRoles.people][],
  address: Address
) => {
  console.log(`[System roles] → Starting roles grant operation...`);

  const systemAccessManager = atkDeployer.getSystemAccessManagerContract();

  const transactionHash = await withDecodedRevertReason(() =>
    systemAccessManager.write.grantMultipleRoles([address, roles])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[System roles] ✓ ${roles.join(", ")} granted to ${address} by ${admin.name} (${admin.address})`
  );
};
