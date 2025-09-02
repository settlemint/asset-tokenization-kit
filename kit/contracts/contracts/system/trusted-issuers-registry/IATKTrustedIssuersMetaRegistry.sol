// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// ISMARTinterface
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";

/// @title IATKTrustedIssuersMetaRegistry - Registry-of-Registries Interface
/// @author SettleMint
/// @notice Interface for managing a registry-of-registries system that tracks global and contract-specific
///         trusted issuers registries. This enables lightweight tokens while maintaining comprehensive
///         trusted issuer management.
/// @dev This interface defines a meta-registry that:
///      - Stores a global trusted issuers registry for system-wide issuers
///      - Maps contract addresses to their specific trusted issuers registries
///      - Provides aggregated query functions that check both global and contract-specific registries
///      - Enables efficient trusted issuer management without bloating token runtime size
interface IATKTrustedIssuersMetaRegistry is IERC165, ISMARTTrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when the global registry is set or updated
    /// @param sender The address that initiated the change
    /// @param oldRegistry The address of the previous global registry (address(0) if none)
    /// @param newRegistry The address of the new global registry
    event GlobalRegistrySet(
        address indexed sender,
        address indexed oldRegistry,
        address indexed newRegistry
    );

    /// @notice Emitted when a contract-specific registry is set or updated
    /// @param sender The address that initiated the change
    /// @param contractAddress The contract address for which the registry is being set
    /// @param oldRegistry The address of the previous registry for this contract (address(0) if none)
    /// @param newRegistry The address of the new registry for this contract
    event ContractRegistrySet(
        address indexed sender,
        address indexed contractAddress,
        address indexed oldRegistry,
        address newRegistry
    );

    /// @notice Initializes the registry with an initial admin and registrars.
    /// @param accessManager The address of the access manager
    /// @param globalRegistry The address of the global trusted issuers registry
    function initialize(address accessManager, address globalRegistry) external;

    // --- Registry Management Functions ---

    /// @notice Sets the global trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages the global registry that applies to all contracts
    /// @param registry The address of the global trusted issuers registry (can be address(0) to remove)
    function setGlobalRegistry(address registry) external;

    /// @notice Sets a contract-specific trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages contract-specific registries
    /// @param contractAddress The contract address to set the registry for
    /// @param registry The address of the trusted issuers registry for this contract (can be address(0) to remove)
    function setRegistryForContract(address contractAddress, address registry) external;

    /// @notice Removes a contract-specific trusted issuers registry
    /// @dev Convenience function that delegates to setRegistryForContract with address(0)
    /// @param contractAddress The contract address to remove the registry for
    function removeRegistryForContract(address contractAddress) external;

    // --- Registry Getters ---

    /// @notice Gets the global trusted issuers registry
    /// @return The global trusted issuers registry address
    function getGlobalRegistry() external view returns (ISMARTTrustedIssuersRegistry);

    /// @notice Gets the contract-specific trusted issuers registry
    /// @param contractAddress The contract address to get the registry for
    /// @return The contract-specific trusted issuers registry address
    function getRegistryForContract(address contractAddress) external view returns (ISMARTTrustedIssuersRegistry);

}