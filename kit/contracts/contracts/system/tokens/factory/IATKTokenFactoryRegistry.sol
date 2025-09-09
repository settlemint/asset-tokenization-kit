// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManaged } from "../../access-manager/IATKSystemAccessManaged.sol";

/**
 * @title IATKTokenFactoryRegistry
 * @author SettleMint
 * @notice Interface for the ATK Token Factory Registry, managing token factory deployments
 * @dev This registry tracks and manages different types of token factories (Bond, Equity, Fund, etc.)
 *      within the ATK ecosystem. Each factory type is identified by a unique type hash and can be
 *      upgraded independently through its implementation address.
 */
interface IATKTokenFactoryRegistry is IERC165, IATKSystemAccessManaged {
    /// @notice Emitted when a new token factory is registered
    /// @param sender The address that registered the factory
    /// @param name The name of the token factory
    /// @param typeId The unique type identifier for the factory
    /// @param proxyAddress The address of the deployed factory proxy
    /// @param implementationAddress The address of the factory implementation
    /// @param tokenImplementationAddress The address of the token implementation
    /// @param tokenImplementationInterfaces The interfaces supported by the token implementation
    /// @param timestamp The timestamp when the factory was registered
    event TokenFactoryRegistered(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementationAddress,
        address tokenImplementationAddress,
        bytes4[] tokenImplementationInterfaces,
        uint256 timestamp
    );

    /// @notice Emitted when a token factory implementation is updated
    /// @param sender The address that updated the implementation
    /// @param factoryTypeHash The type hash of the factory being updated
    /// @param newImplementation The address of the new implementation
    event TokenFactoryImplementationUpdated(
        address indexed sender, bytes32 indexed factoryTypeHash, address indexed newImplementation
    );

    /// @notice Registers a new token factory in the registry
    /// @param name The name of the token factory
    /// @param factoryImplementation The address of the factory implementation contract
    /// @param tokenImplementation The address of the token implementation contract
    /// @return The address of the deployed factory proxy
    function registerTokenFactory(
        string calldata name,
        address factoryImplementation,
        address tokenImplementation
    )
        external
        returns (address);

    /// @notice Updates the implementation address for a specific token factory type
    /// @param factoryTypeHash The type hash of the factory to update
    /// @param implementation The new implementation address
    function setTokenFactoryImplementation(bytes32 factoryTypeHash, address implementation) external;

    /// @notice Retrieves the factory address for a given factory type
    /// @param factoryTypeHash The type hash of the factory to retrieve
    /// @return The address of the factory proxy for the given type
    function tokenFactory(bytes32 factoryTypeHash) external view returns (address);

    /// @notice Initializes the token factory registry
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the ATK system contract
    function initialize(address accessManager, address systemAddress) external;
}
