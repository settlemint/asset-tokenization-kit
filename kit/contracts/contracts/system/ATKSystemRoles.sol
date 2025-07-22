// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKSystemRoles
/// @author SettleMint
/// @notice Library defining role constants for the ATK protocol's access control system
/// @dev These roles are used with OpenZeppelin's AccessControl contract
library ATKSystemRoles {
    /// @notice The default admin role that can grant and revoke other roles
    /// @dev Matches the default admin role in OpenZeppelin's AccessControl
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /// @notice Role for managing registration operations
    /// @dev Assigned to entities responsible for user and contract registration (e.g., token factories)
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /// @notice Role for managing registrar role assignments
    /// @dev Assigned to entities responsible for granting/revoking REGISTRAR_ROLE (e.g., token factory registry)
    /// This provides an intermediate level between DEFAULT_ADMIN_ROLE and REGISTRAR_ROLE
    bytes32 public constant REGISTRAR_ADMIN_ROLE = keccak256("REGISTRAR_ADMIN_ROLE");

    /// @notice Role for managing claims
    /// @dev Assigned to entities responsible for handling token claims
    bytes32 public constant CLAIM_MANAGER_ROLE = keccak256("CLAIM_MANAGER_ROLE");

    /// @notice Role for token deployers
    /// @dev Assigned to entities responsible for deploying new tokens
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

    /// @notice Role for managing implementation addresses
    /// @dev Assigned to entities responsible for managing implementation addresses
    bytes32 public constant IMPLEMENTATION_MANAGER_ROLE = keccak256("IMPLEMENTATION_MANAGER_ROLE");

    /// @notice A unique identifier (hash) for the role that grants permission to modify the data stored in this
    /// contract.
    /// @dev This role is typically granted to `ATKIdentityRegistry` contracts that are "bound" to this storage.
    /// Only addresses holding this role can call functions like `addIdentityToStorage`, `removeIdentityFromStorage`,
    /// `modifyStoredIdentity`, and `modifyStoredInvestorCountry`.
    /// The value is calculated as `keccak256("STORAGE_MODIFIER_ROLE")`.
    bytes32 public constant STORAGE_MODIFIER_ROLE = keccak256("STORAGE_MODIFIER_ROLE");

    /// @notice A unique identifier (hash) for the role that grants permission to manage the list of bound identity
    /// registry contracts.
    /// @dev Addresses holding this role can call `bindIdentityRegistry` to authorize a new registry contract and
    /// `unbindIdentityRegistry` to revoke authorization from an existing one.
    /// This role is crucial for controlling which external contracts can write to this storage.
    /// It is typically assigned to a high-level system management contract (e.g., `ATKSystem` or an identity factory
    /// contract).
    /// The value is calculated as `keccak256("REGISTRY_MANAGER_ROLE")`.
    bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");

    // --- Access Control Roles ---
    /// @notice Role identifier for addresses that can manage the compliance bypass list
    /// @dev This role allows adding/removing addresses from the bypass list that can bypass compliance checks
    bytes32 public constant BYPASS_LIST_MANAGER_ROLE = keccak256("BYPASS_LIST_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the compliance bypass list
    /// @dev This role allows adding/removing addresses from the bypass list that can bypass compliance checks
    bytes32 public constant BYPASS_LIST_MANAGER_ADMIN_ROLE = keccak256("BYPASS_LIST_MANAGER_ADMIN_ROLE");

    // @notice Role identifier for addresses that can manage the system
    // @dev This role bootstraps the system, manage upgrades, implementation references
    bytes32 public constant SYSTEM_MANAGER_ROLE = keccak256("SYSTEM_MANAGER_ROLE");

    // @notice Role identifier for addresses that can manage the identity registry
    // @dev This role register identities, recover identities, manage user onboarding
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");

    // @notice Role identifier for addresses that can manage the token
    // @dev This role manages token configuration and deployment
    bytes32 public constant TOKEN_MANAGER_ROLE = keccak256("TOKEN_MANAGER_ROLE");

    // @notice Role identifier for addresses that can manage the compliance
    // @dev this role registers compliance modules and has access on the compliance modules to configure global things
    // also has access to the bypass list
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");

    // @notice Role identifier for addresses that can manage the addons
    // @dev This role manages the addons, can add new addons, remove existing addons, and upgrade existing addons
    bytes32 public constant ADDON_MANAGER_ROLE = keccak256("ADDON_MANAGER_ROLE");

    // @notice Role identifier for addresses that can manage the claim policies
    // @dev This role manages trusted issuers and claim topics
    bytes32 public constant CLAIM_POLICY_MANAGER_ROLE = keccak256("CLAIM_POLICY_MANAGER_ROLE");

    // @notice Role identifier for addresses that can audit the system
    // @dev This role is view only. It's for permissions, identities, audit logs and system state
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // @notice Role identifier for addresses that can manage the system modules
    // @dev This role is used to manage the system modules. It is allowed to register compliance modules, has access to
    // the register topic schemes. is the roleAdmin of IDENTITY_REGISTRY_MODULE, TOKEN_FACTORY_REGISTRY_MODULE_ROLE,
    // ADDON_REGISTRY_MODULE_ROLE
    bytes32 public constant SYSTEM_MODULE_ROLE = keccak256("SYSTEM_MODULE_ROLE");

    // @notice Role identifier for addresses that can manage the identity registry module
    // @dev This role can modify storage on the identity storage contract
    bytes32 public constant IDENTITY_REGISTRY_MODULE_ROLE = keccak256("IDENTITY_REGISTRY_MODULE_ROLE");

    // @notice Role identifier for addresses that can manage the token factory registry module
    // @dev This role is the adminRole of TOKEN_FACTORY_MODULE_ROLE
    bytes32 public constant TOKEN_FACTORY_REGISTRY_MODULE_ROLE = keccak256("TOKEN_FACTORY_REGISTRY_MODULE_ROLE");

    // @notice Role identifier for addresses that can manage the token factory module
    // @dev This role will be able to add token contracts to the allowlist of compliance
    bytes32 public constant TOKEN_FACTORY_MODULE_ROLE = keccak256("TOKEN_FACTORY_MODULE_ROLE");

    // @notice Role identifier for addresses that can manage the addon registry module
    // @dev This role can modify storage on the addon registry contract
    bytes32 public constant ADDON_REGISTRY_MODULE_ROLE = keccak256("ADDON_REGISTRY_MODULE_ROLE");

    // @notice Role identifier for addresses that can manage the addon module
    // @dev This role will be able to add addons to the allowlist of compliance
    bytes32 public constant ADDON_MODULE_ROLE = keccak256("ADDON_MODULE_ROLE");
}
