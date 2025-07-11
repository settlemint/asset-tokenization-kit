import type { Address } from "viem";
import { ATKContracts } from "../constants/contracts";
import type { AbstractActor } from "../entities/actors/abstract-actor";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { computeATKSystemRoles } from "../utils/get-role-constants";
import { waitForSuccess } from "../utils/wait-for-success";

// ATK System Roles computed from ATKSystemRoles.sol
export const ATKSystemRoles = computeATKSystemRoles();

export interface SystemRoleAssignment {
  role: string;
  account: Address;
  description: string;
}

/**
 * Sets up initial system roles after bootstrap
 * @param systemAccessManagerAddress - Address of the deployed system access manager
 * @param admin - Actor with DEFAULT_ADMIN_ROLE to grant roles
 * @param roleAssignments - Array of role assignments to apply
 */
export const setupInitialSystemRoles = async (
  systemAccessManagerAddress: Address,
  admin: AbstractActor,
  roleAssignments: SystemRoleAssignment[]
) => {
  console.log(`[System Roles] → Setting up initial system roles...`);

  const accessManagerContract = admin.getContractInstance({
    address: systemAccessManagerAddress,
    abi: ATKContracts.accessControl, // Using standard access control ABI
  });

  // Grant roles one by one
  for (const assignment of roleAssignments) {
    console.log(
      `[System Roles] → Granting ${assignment.description} to ${assignment.account}...`
    );

    const transactionHash = await withDecodedRevertReason(() =>
      accessManagerContract.write.grantRole([
        assignment.role,
        assignment.account,
      ])
    );

    await waitForSuccess(transactionHash);

    console.log(
      `[System Roles] ✓ ${assignment.description} granted to ${assignment.account}`
    );
  }

  console.log(`[System Roles] ✓ All system roles set up successfully`);
};

/**
 * Sets up a basic system role configuration for a typical deployment
 * @param systemAccessManagerAddress - Address of the deployed system access manager
 * @param admin - Actor with DEFAULT_ADMIN_ROLE
 * @param platformOperator - Address that will receive operational roles
 * @param systemManager - Address that will manage system operations (optional, defaults to platformOperator)
 */
export const setupBasicSystemRoles = async (
  systemAccessManagerAddress: Address,
  admin: AbstractActor,
  platformOperator: Address,
  systemManager?: Address
) => {
  const managerAddress = systemManager || platformOperator;

  const roleAssignments: SystemRoleAssignment[] = [
    {
      role: ATKSystemRoles.SYSTEM_MANAGER_ROLE,
      account: managerAddress,
      description: "System Manager Role",
    },
    {
      role: ATKSystemRoles.IDENTITY_MANAGER_ROLE,
      account: platformOperator,
      description: "Identity Manager Role",
    },
    {
      role: ATKSystemRoles.TOKEN_MANAGER_ROLE,
      account: platformOperator,
      description: "Token Manager Role",
    },
    {
      role: ATKSystemRoles.COMPLIANCE_MANAGER_ROLE,
      account: platformOperator,
      description: "Compliance Manager Role",
    },
    {
      role: ATKSystemRoles.ADDON_MANAGER_ROLE,
      account: platformOperator,
      description: "Addon Manager Role",
    },
    {
      role: ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE,
      account: platformOperator,
      description: "Claim Policy Manager Role",
    },
    {
      role: ATKSystemRoles.AUDITOR_ROLE,
      account: platformOperator,
      description: "Auditor Role",
    },
  ];

  await setupInitialSystemRoles(
    systemAccessManagerAddress,
    admin,
    roleAssignments
  );
};

/**
 * Grants system module roles to system contracts
 * @param systemAccessManagerAddress - Address of the deployed system access manager
 * @param admin - Actor with appropriate admin role
 * @param systemContracts - Object containing system contract addresses
 */
export const setupSystemModuleRoles = async (
  systemAccessManagerAddress: Address,
  admin: AbstractActor,
  systemContracts: {
    systemAddress: Address;
    identityRegistryAddress: Address;
    tokenFactoryRegistryAddress: Address;
    addonRegistryAddress: Address;
  }
) => {
  const roleAssignments: SystemRoleAssignment[] = [
    {
      role: ATKSystemRoles.SYSTEM_MODULE_ROLE,
      account: systemContracts.systemAddress,
      description: "System Module Role for System Contract",
    },
    {
      role: ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE,
      account: systemContracts.identityRegistryAddress,
      description: "Identity Registry Module Role",
    },
    {
      role: ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE,
      account: systemContracts.tokenFactoryRegistryAddress,
      description: "Token Factory Registry Module Role",
    },
    {
      role: ATKSystemRoles.ADDON_REGISTRY_MODULE_ROLE,
      account: systemContracts.addonRegistryAddress,
      description: "Addon Registry Module Role",
    },
  ];

  await setupInitialSystemRoles(
    systemAccessManagerAddress,
    admin,
    roleAssignments
  );
};
