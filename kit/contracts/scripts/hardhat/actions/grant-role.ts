import type { Address, Hex } from "viem";
import { SMARTContracts } from "../constants/contracts";
import type { AbstractActor } from "../entities/actors/abstract-actor";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { waitForSuccess } from "../utils/wait-for-success";

export const grantRole = async (
  contractAddress: Address,
  admin: AbstractActor,
  role: Hex,
  address: Address
) => {
  const contract = admin.getContractInstance({
    address: contractAddress,
    abi: SMARTContracts.accessControl,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    contract.write.grantRole([role, address])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Role] ${role} granted to ${address} on ${contractAddress} by ${admin.name} (${admin.address})`
  );
};
