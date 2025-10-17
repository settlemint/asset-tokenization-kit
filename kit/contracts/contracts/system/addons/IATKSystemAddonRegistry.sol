// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/**
 * @title IATKSystemAddonRegistry
 * @author SettleMint
 * @notice Interface for the ATK System Addon Registry, managing system-level addon modules
 * @dev This registry allows registration and management of system addons, which are supplementary
 *      modules that extend the core ATK system functionality. Addons are deployed as upgradeable
 *      proxies with implementation contracts that can be updated by authorized parties.
 */
interface IATKSystemAddonRegistry is IATKSystemAccessManaged {
    /// @notice Emitted when a new system addon is registered
    /// @param sender The address that registered the addon
    /// @param name The unique name identifier for the addon
    /// @param typeId The type identifier of the addon
    /// @param proxyAddress The address of the deployed addon proxy
    /// @param implementation The address of the addon implementation
    /// @param initializationData The initialization data passed to the addon
    /// @param timestamp The block timestamp when the addon was registered
    event SystemAddonRegistered(
        address indexed sender,
        string name,
        bytes32 typeId,
        address indexed proxyAddress,
        address indexed implementation,
        bytes initializationData,
        uint256 timestamp
    );

    /// @notice Emitted when an addon implementation is updated
    /// @param sender The address that updated the implementation
    /// @param addonTypeHash The type hash of the addon being updated
    /// @param newImplementation The new implementation address
    event AddonImplementationUpdated(
        address indexed sender, bytes32 indexed addonTypeHash, address indexed newImplementation
    );

    /// @notice Registers a new system addon with the registry
    /// @param name The unique name identifier for the addon
    /// @param implementation The implementation contract address for the addon
    /// @param initializationData The initialization data to pass to the addon proxy
    /// @return proxyAddress The address of the newly created addon proxy
    function registerSystemAddon(string calldata name, address implementation, bytes calldata initializationData)
        external
        returns (address proxyAddress);

    /// @notice Updates the implementation address for an existing addon type
    /// @param addonTypeHash The type hash of the addon to update
    /// @param implementation The new implementation contract address
    function setAddonImplementation(bytes32 addonTypeHash, address implementation) external;

    /// @notice Returns the proxy address for a given addon type
    /// @param addonTypeHash The type hash of the addon
    /// @return The address of the addon proxy contract
    function addon(bytes32 addonTypeHash) external view returns (address);

    /// @notice Initializes the addon registry with initial admin and system address
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the ATK system contract
    function initialize(address accessManager, address systemAddress) external;
}
