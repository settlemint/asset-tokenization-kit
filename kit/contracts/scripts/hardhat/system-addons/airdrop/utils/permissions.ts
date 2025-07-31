import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { ATKRoles } from "../../../constants/roles";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

/**
 * Grants necessary permissions to an airdrop factory
 *
 * This function ensures that the necessary roles are granted to both the owner
 * and the factory for proper functioning of the airdrop contracts.
 *
 * @param factoryName The name of the factory in the atkDeployer (e.g., "vestingAirdropFactory")
 * @returns Promise<void>
 */
export const grantAirdropFactoryPermissions = async (
  factoryName: string
): Promise<void> => {
  console.log(
    `[Airdrop Permissions] Granting permissions for ${factoryName}...`
  );

  // Get the system address for accessing the system access manager
  const systemAddress = atkDeployer.getContractAddress("system");
  const systemContract = owner.getContractInstance({
    address: systemAddress,
    abi: ATKContracts.system,
  });

  // Get the system access manager address from the system contract
  const systemAccessManagerAddress =
    await systemContract.read.systemAccessManager();

  // Get the system access manager contract
  const systemAccessManagerContract = owner.getContractInstance({
    address: systemAccessManagerAddress,
    abi: ATKContracts.accessManager,
  });

  // Get the factory address
  const factoryAddress = atkDeployer.getContractAddress(factoryName as any);

  // Create an AccessControl contract instance for the factory
  const accessControlContract = owner.getContractInstance({
    address: factoryAddress,
    abi: ATKContracts.accessControl,
  });

  // Grant DEPLOYER_ROLE to owner on the system access manager
  const grantDeployerRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      ATKRoles.deployerRole,
      owner.address,
    ])
  );
  await waitForSuccess(grantDeployerRoleHash);
  console.log(
    `[Airdrop Permissions] ✓ Granted DEPLOYER_ROLE to ${owner.address} on system access manager`
  );

  // Grant DEPLOYER_ROLE to owner directly on the factory
  const grantFactoryDeployerRoleHash = await withDecodedRevertReason(() =>
    accessControlContract.write.grantRole([
      ATKRoles.deployerRole,
      owner.address,
    ])
  );
  await waitForSuccess(grantFactoryDeployerRoleHash);
  console.log(
    `[Airdrop Permissions] ✓ Granted DEPLOYER_ROLE to ${owner.address} directly on factory`
  );

  // Grant SYSTEM_MODULE_ROLE to the factory
  const grantSystemModuleRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      ATKRoles.systemModuleRole,
      factoryAddress,
    ])
  );
  await waitForSuccess(grantSystemModuleRoleHash);
  console.log(
    `[Airdrop Permissions] ✓ Granted SYSTEM_MODULE_ROLE to factory on system access manager`
  );

  // Grant DEFAULT_ADMIN_ROLE to the factory
  const grantDefaultAdminRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      ATKRoles.defaultAdminRole,
      factoryAddress,
    ])
  );
  await waitForSuccess(grantDefaultAdminRoleHash);
  console.log(
    `[Airdrop Permissions] ✓ Granted DEFAULT_ADMIN_ROLE to factory on system access manager`
  );

  console.log(
    `[Airdrop Permissions] ✓ All permissions granted for ${factoryName}`
  );
};
