import { Hex, type Address } from "viem";
import type { Actor } from "../entities/actor";
import { atkDeployer } from "../services/deployer";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { waitForSuccess } from "../utils/wait-for-success";

export const grantSystemRole = async (
  admin: Actor,
  role: Hex,
  address: Address
) => {
  console.log(`[System role] → Starting role grant operation...`);

  const systemAccessManager = atkDeployer.getSystemAccessManagerContract();

  const transactionHash = await withDecodedRevertReason(() =>
    systemAccessManager.write.grantRole([role, address])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[System role] ✓ ${role} granted to ${address} by ${admin.name} (${admin.address})`
  );
};
