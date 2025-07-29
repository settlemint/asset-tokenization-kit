import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { ATKRoles } from "../../../constants/roles";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

/**
 * Grants necessary permissions to the XVP settlement factory
 *
 * This function ensures that the necessary roles are granted to both the owner
 * and the factory for proper functioning of the XVP settlement contracts.
 *
 * @returns Promise<void>
 */
export const grantXvpSettlementPermissions = async (): Promise<void> => {
  console.log(
    `[XVP Permissions] Granting permissions for xvpSettlementFactory...`
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
  const factoryAddress = atkDeployer.getContractAddress("xvpSettlementFactory");

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
    `[XVP Permissions] ✓ Granted DEPLOYER_ROLE to ${owner.address} on system access manager`
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
    `[XVP Permissions] ✓ Granted DEPLOYER_ROLE to ${owner.address} directly on factory`
  );

  // Grant SYSTEM_MODULE_ROLE to the factory
  const grantSystemModuleRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      "0xa6d0d666130ddda8d0a25bfc08c75c789806b23845f9cce674dfc4a9e8d0e45c", // SYSTEM_MODULE_ROLE
      factoryAddress,
    ])
  );
  await waitForSuccess(grantSystemModuleRoleHash);
  console.log(
    `[XVP Permissions] ✓ Granted SYSTEM_MODULE_ROLE to factory on system access manager`
  );

  // Grant DEFAULT_ADMIN_ROLE to the factory
  const grantDefaultAdminRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      "0x0000000000000000000000000000000000000000000000000000000000000000", // DEFAULT_ADMIN_ROLE
      factoryAddress,
    ])
  );
  await waitForSuccess(grantDefaultAdminRoleHash);
  console.log(
    `[XVP Permissions] ✓ Granted DEFAULT_ADMIN_ROLE to factory on system access manager`
  );

  console.log(
    `[XVP Permissions] ✓ All permissions granted for xvpSettlementFactory`
  );
};
