// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTCompliance } from "../../smart/interface/ISMARTCompliance.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title ATK Compliance Bypass List Interface
/// @author SettleMint
/// @notice Interface for managing the compliance bypass list functionality.
/// @dev This interface defines the standard functions for managing addresses that bypass compliance checks.
interface IATKCompliance is ISMARTCompliance {
    // --- Events ---
    /// @notice Emitted when an address is added to the compliance bypass list.
    /// @param account The address that was added to the bypass list.
    /// @param manager The address that performed the addition.
    event AddressAddedToBypassList(address indexed account, address indexed manager);

    /// @notice Emitted when an address is removed from the compliance bypass list.
    /// @param account The address that was removed from the bypass list.
    /// @param manager The address that performed the removal.
    event AddressRemovedFromBypassList(address indexed account, address indexed manager);

    /// @notice Emitted when a global compliance module is added
    /// @param sender The address that performed the addition
    /// @param module The module address that was added
    /// @param params The parameters configured for the module
    event GlobalComplianceModuleAdded(address indexed sender, address indexed module, bytes params);

    /// @notice Emitted when a global compliance module is removed
    /// @param sender The address that performed the removal
    /// @param module The module address that was removed
    event GlobalComplianceModuleRemoved(address indexed sender, address indexed module);

    /// @notice Emitted when global compliance module parameters are updated
    /// @param sender The address that performed the update
    /// @param module The module address whose parameters were updated
    /// @param params The new parameters
    event GlobalComplianceModuleParametersUpdated(address indexed sender, address indexed module, bytes params);

    // --- Custom Errors ---
    /// @notice Error thrown when trying to remove an address that is not on the bypass list.
    error AddressNotOnBypassList(address account);

    /// @notice Error thrown when trying to add an address that is already on the bypass list.
    error AddressAlreadyOnBypassList(address account);

    /// @notice Error thrown when trying to add a global compliance module that is already registered.
    error GlobalModuleAlreadyAdded(address module);

    /// @notice Error thrown when trying to access a global compliance module that is not registered.
    error GlobalModuleNotFound(address module);

    /// @notice Error thrown when the system access manager is not set.
    error SystemAccessManagerNotSet();

    /// @notice Error thrown when the caller is not authorized to perform the action.
    error UnauthorizedAccess();

    // --- Functions ---
    /// @notice Initializes the compliance contract
    /// @dev Sets up the initial admin and bypass list managers
    /// @param initialAdmin The address that will have initial admin privileges
    /// @param initialBypassListManagers Array of addresses that will have bypass list manager privileges
    function initialize(address initialAdmin, address[] calldata initialBypassListManagers) external;

    // --- Functions ---
    /// @notice Adds an address to the compliance bypass list.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// Addresses on the bypass list can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the bypass list.
    function addToBypassList(address account) external;

    /// @notice Removes an address from the compliance bypass list.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// @param account The address to remove from the bypass list.
    function removeFromBypassList(address account) external;

    /// @notice Adds multiple addresses to the compliance bypass list in a single transaction.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// This is a gas-efficient way to add multiple addresses to the bypass list at once.
    /// @param accounts Array of addresses to add to the bypass list.
    function addMultipleToBypassList(address[] calldata accounts) external;

    /// @notice Removes multiple addresses from the compliance bypass list in a single transaction.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// @param accounts Array of addresses to remove from the bypass list.
    function removeMultipleFromBypassList(address[] calldata accounts) external;

    /// @notice Checks if an address is on the bypass list.
    /// @param account The address to check.
    /// @return True if the address is on the bypass list, false otherwise.
    function isBypassed(address account) external view returns (bool);

    // --- Global Compliance Module Management Functions ---

    /// @notice Adds a global compliance module that applies to all tokens
    /// @dev Only addresses with GLOBAL_COMPLIANCE_MANAGER_ROLE can call this function.
    /// This module will be executed in addition to token-specific modules for all compliance checks.
    /// @param module The address of the compliance module to add
    /// @param params The ABI-encoded parameters for the module
    function addGlobalComplianceModule(address module, bytes calldata params) external;

    /// @notice Removes a specific global compliance module
    /// @dev Only addresses with GLOBAL_COMPLIANCE_MANAGER_ROLE can call this function.
    /// @param module The address of the compliance module to remove
    function removeGlobalComplianceModule(address module) external;

    /// @notice Updates parameters for an existing global compliance module
    /// @dev Only addresses with GLOBAL_COMPLIANCE_MANAGER_ROLE can call this function.
    /// @param module The address of the compliance module to update
    /// @param params The new ABI-encoded parameters for the module
    function setParametersForGlobalComplianceModule(address module, bytes calldata params) external;

    /// @notice Returns all global compliance modules
    /// @return Array of global compliance module-parameter pairs
    function getGlobalComplianceModules() external view returns (SMARTComplianceModuleParamPair[] memory);
}
