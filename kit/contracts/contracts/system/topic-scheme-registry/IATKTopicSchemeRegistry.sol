// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";

/**
 * @title IATKTopicSchemeRegistry
 * @author SettleMint
 * @notice Interface for the ATK Topic Scheme Registry, managing claim topic schemes
 * @dev Extends ISMARTTopicSchemeRegistry to provide ATK-specific initialization functionality
 *      for managing claim topic schemes within the ATK token ecosystem
 */
interface IATKTopicSchemeRegistry is ISMARTTopicSchemeRegistry {
    /// @notice Initializes the topic scheme registry with system access manager
    /// @param systemAccessManager_ The address of the system access manager for role-based permissions
    function initialize(address systemAccessManager_) external;

    /// @notice Sets or updates the system access manager
    /// @dev Only callable by the current system access manager's DEFAULT_ADMIN_ROLE
    /// @param systemAccessManager_ The new system access manager address
    function setSystemAccessManager(address systemAccessManager_) external;

    /// @notice Returns the address of the system access manager
    /// @return The address of the system access manager contract
    function getSystemAccessManager() external view returns (address);

    /// @notice Event emitted when the system access manager is set
    /// @param sender The address that set the access manager
    /// @param systemAccessManager The address of the new system access manager
    event SystemAccessManagerSet(address indexed sender, address indexed systemAccessManager);
}
