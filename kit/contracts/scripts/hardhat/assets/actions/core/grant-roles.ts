import { SMARTContracts } from "../../../constants/contracts";
import { SMARTRoles } from "../../../constants/roles";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

// The issuer doesn't need to have a claim manager role, it can be anyone that adds the claim.
// The issuer will create the claim and the claim manager will add it to the token identity.
export const grantRoles = async (
  asset: Asset<any>,
  targetActor: AbstractActor,
  roles: (typeof SMARTRoles)[keyof typeof SMARTRoles][]
) => {
  const accessManagerContract = await owner.getContractInstance({
    address: asset.accessManager,
    abi: SMARTContracts.accessManager,
  });

  const transactionHash = await accessManagerContract.write.grantMultipleRoles([
    targetActor.address,
    roles,
  ]);

  await waitForSuccess(transactionHash);

  // Find the role name from the SMARTRoles object
  const roleNames = roles.map((role) =>
    Object.keys(SMARTRoles).find(
      (key) => SMARTRoles[key as keyof typeof SMARTRoles] === role
    )
  );

  console.log(
    `[Role] ${roleNames.join(", ")} granted to ${targetActor.name} (${targetActor.address}) on ${asset.name} (${asset.address}) by ${asset.accessManager}.`
  );
};
