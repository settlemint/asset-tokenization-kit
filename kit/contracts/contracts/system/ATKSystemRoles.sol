// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

/// @title ATKSystemRoles
/// @notice Library defining role constants for the ATK protocol's centralized access control system
/// @dev These roles are used with OpenZeppelin's AccessControl contract for centralized system management
library ATKSystemRoles {
    // ================================
    // CORE ADMIN ROLES
    // ================================

    /// @notice The default admin role that can grant and revoke other roles
    /// @dev Matches the default admin role in OpenZeppelin's AccessControl
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // ================================
    // PEOPLE ROLES (*_MANAGER_ROLE)
    // ================================

    /// @notice Role for system managers who bootstrap the system, manage upgrades, implementation references
    /// @dev Can bootstrap system, manage upgrades, update linking, access identity registry storage, enable token
    /// factories
    bytes32 public constant SYSTEM_MANAGER_ROLE = keccak256("SYSTEM_MANAGER_ROLE");

    /// @notice Role for identity managers who handle identity registration and recovery
    /// @dev Can register identities, recover identities, manage user onboarding
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");

    /// @notice Role for token managers who deploy and configure tokens
    /// @dev Can deploy and configure tokens
    bytes32 public constant TOKEN_MANAGER_ROLE = keccak256("TOKEN_MANAGER_ROLE");

    /// @notice Role for compliance managers who handle compliance modules and bypass list
    /// @dev Can register compliance modules, configure global settings, manage bypass list
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");

    /// @notice Role for addon managers who manage addon factories and configurations
    /// @dev Can manage addon factories (should be more specific per addon type)
    bytes32 public constant ADDON_MANAGER_ROLE = keccak256("ADDON_MANAGER_ROLE");

    /// @notice Role for claim policy managers who handle trusted issuers and claim topics
    /// @dev Can manage trusted issuers and claim topics
    bytes32 public constant CLAIM_POLICY_MANAGER_ROLE = keccak256("CLAIM_POLICY_MANAGER_ROLE");

    /// @notice View-only role for auditors to inspect system state
    /// @dev Can view permissions, identities, audit logs, system state (read-only)
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // ================================
    // SYSTEM ROLES (*_MODULE_ROLE)
    // ================================

    /// @notice Role for system modules that can register compliance modules and topic schemes
    /// @dev Can register compliance modules, access to register topic schemes, roleAdmin of other module roles
    bytes32 public constant SYSTEM_MODULE_ROLE = keccak256("SYSTEM_MODULE_ROLE");

    /// @notice Role for identity registry modules that can modify identity storage
    /// @dev Can modify storage on the identity storage modifier
    bytes32 public constant IDENTITY_REGISTRY_MODULE_ROLE = keccak256("IDENTITY_REGISTRY_MODULE_ROLE");

    /// @notice Role for token factory registry modules
    /// @dev RoleAdmin of TOKEN_FACTORY_ROLE
    bytes32 public constant TOKEN_FACTORY_REGISTRY_MODULE_ROLE = keccak256("TOKEN_FACTORY_REGISTRY_MODULE_ROLE");

    /// @notice Role for token factory modules
    /// @dev Can add token contracts to compliance allow list
    bytes32 public constant TOKEN_FACTORY_MODULE_ROLE = keccak256("TOKEN_FACTORY_MODULE_ROLE");

    /// @notice Role for addon registry modules
    /// @dev RoleAdmin of ADDON_ROLE
    bytes32 public constant ADDON_REGISTRY_MODULE_ROLE = keccak256("ADDON_REGISTRY_MODULE_ROLE");

    /// @notice Role for addon modules
    /// @dev Can add add-on instance contracts to compliance allow list
    bytes32 public constant ADDON_MODULE_ROLE = keccak256("ADDON_MODULE_ROLE");

    // ================================
    // LEGACY ROLES (for compatibility)
    // ================================

    /// @notice Role for managing registration operations
    /// @dev Assigned to entities responsible for user registration
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /// @notice Role for managing claims
    /// @dev Assigned to entities responsible for handling token claims
    bytes32 public constant CLAIM_MANAGER_ROLE = keccak256("CLAIM_MANAGER_ROLE");

    /// @notice Role for token deployers
    /// @dev Assigned to entities responsible for deploying new tokens
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

    /// @notice Role for managing implementation addresses
    /// @dev Assigned to entities responsible for managing implementation addresses
    bytes32 public constant IMPLEMENTATION_MANAGER_ROLE = keccak256("IMPLEMENTATION_MANAGER_ROLE");

    /// @notice Role for modifying storage data
    /// @dev Typically granted to identity registry contracts
    bytes32 public constant STORAGE_MODIFIER_ROLE = keccak256("STORAGE_MODIFIER_ROLE");

    /// @notice Role for managing registry bindings
    /// @dev Can bind/unbind identity registry contracts
    bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");

    /// @notice Role for managing the compliance bypass list
    /// @dev Can add/remove addresses from the bypass list
    bytes32 public constant BYPASS_LIST_MANAGER_ROLE = keccak256("BYPASS_LIST_MANAGER_ROLE");

    /// @notice Admin role for bypass list managers
    /// @dev Can manage bypass list manager roles
    bytes32 public constant BYPASS_LIST_MANAGER_ADMIN_ROLE = keccak256("BYPASS_LIST_MANAGER_ADMIN_ROLE");

    // ================================
    // ROLE HIERARCHY HELPERS
    // ================================

    /// @notice Returns all manager roles that can be used with the access modifier
    /// @dev Used for onlyRoles modifier to check multiple manager roles
    /// @return Array of all manager role identifiers
    function getAllManagerRoles() internal pure returns (bytes32[] memory) {
        bytes32[] memory roles = new bytes32[](7);
        roles[0] = SYSTEM_MANAGER_ROLE;
        roles[1] = IDENTITY_MANAGER_ROLE;
        roles[2] = TOKEN_MANAGER_ROLE;
        roles[3] = COMPLIANCE_MANAGER_ROLE;
        roles[4] = ADDON_MANAGER_ROLE;
        roles[5] = CLAIM_POLICY_MANAGER_ROLE;
        roles[6] = AUDITOR_ROLE;
        return roles;
    }

    /// @notice Returns all module roles that can be used with the access modifier
    /// @dev Used for onlyRoles modifier to check multiple module roles
    /// @return Array of all module role identifiers
    function getAllModuleRoles() internal pure returns (bytes32[] memory) {
        bytes32[] memory roles = new bytes32[](6);
        roles[0] = SYSTEM_MODULE_ROLE;
        roles[1] = IDENTITY_REGISTRY_MODULE_ROLE;
        roles[2] = TOKEN_FACTORY_REGISTRY_MODULE_ROLE;
        roles[3] = TOKEN_FACTORY_MODULE_ROLE;
        roles[4] = ADDON_REGISTRY_MODULE_ROLE;
        roles[5] = ADDON_MODULE_ROLE;
        return roles;
    }
}
