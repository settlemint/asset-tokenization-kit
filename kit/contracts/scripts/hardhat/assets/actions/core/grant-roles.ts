import { ATKContracts } from '../../../constants/contracts';
import { ATKRoles } from '../../../constants/roles';
import type { AbstractActor } from '../../../entities/actors/abstract-actor';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { waitForSuccess } from '../../../utils/wait-for-success';

// The issuer doesn't need to have a claim manager role, it can be anyone that adds the claim.
// The issuer will create the claim and the claim manager will add it to the token identity.
export const grantRoles = async (
  asset: Asset<any>,
  targetActor: AbstractActor,
  roles: (typeof ATKRoles)[keyof typeof ATKRoles][]
) => {
  console.log('[Role] → Starting role grant operation...');

  const accessManagerContract = owner.getContractInstance({
    address: asset.accessManager,
    abi: ATKContracts.accessManager,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    accessManagerContract.write.grantMultipleRoles([targetActor.address, roles])
  );

  await waitForSuccess(transactionHash);

  // Find the role name from the ATKRoles object
  const roleNames = roles.map((role) =>
    Object.keys(ATKRoles).find(
      (key) => ATKRoles[key as keyof typeof ATKRoles] === role
    )
  );

  console.log(
    `[Role] ✓ ${roleNames.join(', ')} granted to ${targetActor.name} (${targetActor.address}) on ${asset.name} (${asset.address}) by ${asset.accessManager}`
  );
};
