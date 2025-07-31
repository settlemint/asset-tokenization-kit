// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKSystemRoles
/// @author SettleMint
/// @notice Library defining role constants for the ATK protocol's access control system
/// @dev These roles are used with OpenZeppelin's AccessControl contract
library ATKSystemRoles {
    /// @notice The default admin role that can grant and revoke other roles
    /// @dev This is the role that is needed to set all other roles
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // --- People Roles (*_MANAGER_ROLE) ---
    /// @notice Role identifier for addresses that can manage the system
    /// @dev The one that bootstraps the system, manage upgrades, implementation references + also the
    /// update linking (used in identity registry) etc. also has access on identity registry storage to modify
    /// stuff directly there. Registering token factories, addons and compliance modules
    bytes32 public constant SYSTEM_MANAGER_ROLE = keccak256("SYSTEM_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the identity registry
    /// @dev Register identities, recover identities, manage user onboarding
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the token
    /// @dev Deploy and configure tokens
    bytes32 public constant TOKEN_MANAGER_ROLE = keccak256("TOKEN_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the compliance
    /// @dev Register compliance modules, but also has access on the compliance modules to configure the global things,
    /// also has access to the bypass list
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the addons
    /// @dev Can be used on the addon factories (Should this be more specific?) Maybe each add-on has it's own roles?
    bytes32 public constant ADDON_MANAGER_ROLE = keccak256("ADDON_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can manage the claim policies
    /// @dev Manage trusted issuers and claim topics
    bytes32 public constant CLAIM_POLICY_MANAGER_ROLE = keccak256("CLAIM_POLICY_MANAGER_ROLE");

    /// @notice Role identifier for addresses that can audit the system
    /// @dev View-only role for permissions, identities, audit logs, system state
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // --- System Roles (*_MODULE_ROLE) ---

    /// @notice Role identifier for addresses that can manage the system modules
    /// @dev Will be allowed to register compliance modules as well; also has access to the register topic schemes;
    /// is also the roleAdmin of IDENTITY_REGISTRY_MODULE_ROLE, TOKEN_FACTORY_REGISTRY_MODULE_ROLE, ADDON_REGISTRY_MODULE_ROLE
    bytes32 public constant SYSTEM_MODULE_ROLE = keccak256("SYSTEM_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the identity registry module
    /// @dev Will be allowed to modify storage on the identity storage modifier
    bytes32 public constant IDENTITY_REGISTRY_MODULE_ROLE = keccak256("IDENTITY_REGISTRY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the token factory registry module
    /// @dev Will be roleAdmin of TOKEN_FACTORY_MODULE_ROLE
    bytes32 public constant TOKEN_FACTORY_REGISTRY_MODULE_ROLE = keccak256("TOKEN_FACTORY_REGISTRY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the token factory module
    /// @dev Will be able to add token contracts etc. to the allow list of compliance
    bytes32 public constant TOKEN_FACTORY_MODULE_ROLE = keccak256("TOKEN_FACTORY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the addon registry module
    /// @dev Will be roleAdmin of ADDON_MODULE_ROLE
    bytes32 public constant ADDON_REGISTRY_MODULE_ROLE = keccak256("ADDON_REGISTRY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the addon module
    /// @dev Will be able to add add-on instance contracts etc. to the allow list of compliance
    bytes32 public constant ADDON_MODULE_ROLE = keccak256("ADDON_MODULE_ROLE");

}
