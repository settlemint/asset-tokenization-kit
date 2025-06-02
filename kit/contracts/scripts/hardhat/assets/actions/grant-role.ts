import type { AbstractActor } from "../../actors/abstract-actor";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import { SMARTRoles } from "../../constants/roles";
import type { Asset } from "../../types/asset";
import { waitForSuccess } from "../../utils/wait-for-success";

// The issuer doesn't need to have a claim manager role, it can be anyone that adds the claim.
// The issuer will create the claim and the claim manager will add it to the token identity.
export const grantRole = async (
  asset: Asset,
  targetActor: AbstractActor,
  role: (typeof SMARTRoles)[keyof typeof SMARTRoles]
) => {
  const accessManagerContract = await owner.getContractInstance({
    address: asset.accessManager,
    abi: SMARTContracts.accessManager,
  });

  const transactionHash = await accessManagerContract.write.grantRole([
    role,
    targetActor.address,
  ]);

  await waitForSuccess(transactionHash);

  // Find the role name from the SMARTRoles object
  const roleName = Object.keys(SMARTRoles).find(
    (key) => SMARTRoles[key as keyof typeof SMARTRoles] === role
  );

  console.log(
    `[Role] ${roleName || role} granted to ${targetActor.name} (${targetActor.address}) on ${asset.name} (${asset.address}) by ${asset.accessManager}.`
  );
};
