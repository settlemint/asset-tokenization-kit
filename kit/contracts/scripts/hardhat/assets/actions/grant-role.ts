import type { Address } from "viem";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import { SMARTRoles } from "../../constants/roles";
import { waitForSuccess } from "../../utils/wait-for-success";

// The issuer doesn't need to have a claim manager role, it can be anyone that adds the claim.
// The issuer will create the claim and the claim manager will add it to the token identity.
export const grantRole = async (
  accessManagerAddress: Address,
  targetAddress: Address,
  role: (typeof SMARTRoles)[keyof typeof SMARTRoles],
) => {
  const accessManagerContract = await owner.getContractInstance({
    address: accessManagerAddress,
    abi: SMARTContracts.accessManager,
  });

  const transactionHash = await accessManagerContract.write.grantRole([
    role,
    targetAddress,
  ]);

  await waitForSuccess(transactionHash);

  // Find the role name from the SMARTRoles object
  const roleName = Object.keys(SMARTRoles).find(
    (key) => SMARTRoles[key as keyof typeof SMARTRoles] === role,
  );

  console.log(
    `[Role] ${roleName || role} granted to ${targetAddress} by ${accessManagerAddress}.`,
  );
};
