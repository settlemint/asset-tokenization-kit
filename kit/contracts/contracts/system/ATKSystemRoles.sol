// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATKSystemRoles
/// @author SettleMint
/// @notice Library defining role constants for smart contracts and system modules
/// @dev These roles are typically assigned to contract addresses for automated operations
library ATKSystemRoles {
    /// @notice Role identifier for addresses that can manage the system modules
    /// @dev Will be allowed to register compliance modules as well; also has access to the register topic schemes;
    /// is also the roleAdmin of IDENTITY_REGISTRY_MODULE_ROLE, TOKEN_FACTORY_REGISTRY_MODULE_ROLE,
    /// ADDON_REGISTRY_MODULE_ROLE
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
    /// @dev Will be roleAdmin of ADDON_FACTORY_MODULE_ROLE
    bytes32 public constant ADDON_FACTORY_REGISTRY_MODULE_ROLE = keccak256("ADDON_FACTORY_REGISTRY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the addon module
    /// @dev Will be able to add add-on instance contracts etc. to the allow list of compliance
    bytes32 public constant ADDON_FACTORY_MODULE_ROLE = keccak256("ADDON_FACTORY_MODULE_ROLE");

    /// @notice Role identifier for addresses that can manage the trusted issuers meta registry module
    /// @dev Will be able to add trusted issuers to the registry
    bytes32 public constant TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE = keccak256("TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE");

}
