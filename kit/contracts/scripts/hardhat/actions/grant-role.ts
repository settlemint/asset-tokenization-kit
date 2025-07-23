import type { Address, Hex } from "viem";
import { ATKContracts } from "../constants/contracts";
import type { Actor } from "../entities/actor";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { waitForSuccess } from "../utils/wait-for-success";

export const grantRole = async (
  contractAddress: Address,
  admin: Actor,
  role: Hex,
  address: Address
) => {
  console.log(`[Role] → Starting role grant operation...`);

  const contract = admin.getContractInstance({
    address: contractAddress,
    abi: ATKContracts.accessControl,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    contract.write.grantRole([role, address])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Role] ✓ ${role} granted to ${address} on ${contractAddress} by ${admin.name} (${admin.address})`
  );
};
