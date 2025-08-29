// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// ERC-3643 interface
import { IERC3643TrustedIssuersRegistry } from "../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";

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
interface IATKTrustedIssuersMetaRegistry is IERC165 {
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

    // --- Registry Management Functions ---

    /// @notice Sets or updates the global trusted issuers registry
    /// @dev This registry provides system-wide trusted issuers that apply to all contracts
    ///      unless overridden by contract-specific registries.
    ///      Can only be called by accounts with appropriate system management roles.
    /// @param registry The address of the global IERC3643TrustedIssuersRegistry contract
    ///                 Pass address(0) to remove the global registry
    function setGlobalRegistry(address registry) external;

    /// @notice Sets or updates the trusted issuers registry for a specific contract
    /// @dev This allows individual contracts (typically tokens) to have their own
    ///      trusted issuers registry that supplements or overrides the global registry.
    ///      Can only be called by accounts with appropriate management roles.
    /// @param contractAddress The address of the contract to set the registry for
    /// @param registry The address of the IERC3643TrustedIssuersRegistry contract
    ///                 Pass address(0) to remove the contract-specific registry
    function setRegistryForContract(address contractAddress, address registry) external;

    // --- Registry Getters ---

    /// @notice Returns the global trusted issuers registry
    /// @return The IERC3643TrustedIssuersRegistry interface of the global registry,
    ///         or IERC3643TrustedIssuersRegistry(address(0)) if no global registry is set
    function getGlobalRegistry() external view returns (IERC3643TrustedIssuersRegistry);

    /// @notice Returns the trusted issuers registry for a specific contract
    /// @param contractAddress The contract address to query
    /// @return The IERC3643TrustedIssuersRegistry interface for the contract,
    ///         or IERC3643TrustedIssuersRegistry(address(0)) if no registry is set
    function getRegistryForContract(address contractAddress)
        external
        view
        returns (IERC3643TrustedIssuersRegistry);

    // --- Aggregated Query Functions ---

    /// @notice Checks if an issuer is trusted for a specific contract by querying both
    ///         the contract-specific registry and the global registry
    /// @dev Query order: 1) Contract-specific registry, 2) Global registry
    ///      Returns true if the issuer is found in either registry
    /// @param contractAddress The contract address to check trusted issuers for
    /// @param issuer The address of the potential trusted issuer
    /// @return True if the issuer is trusted for the contract, false otherwise
    function isTrustedIssuerForContract(address contractAddress, address issuer)
        external
        view
        returns (bool);

    /// @notice Gets all trusted issuers for a specific claim topic and contract by aggregating
    ///         results from both contract-specific and global registries
    /// @dev Aggregates results from: 1) Contract-specific registry, 2) Global registry
    ///      Removes duplicates if an issuer appears in both registries
    /// @param contractAddress The contract address to query trusted issuers for
    /// @param claimTopic The claim topic to find trusted issuers for
    /// @return Array of IClaimIssuer addresses trusted for the claim topic and contract
    function getTrustedIssuersForClaimTopicAndContract(
        address contractAddress,
        uint256 claimTopic
    ) external view returns (IClaimIssuer[] memory);

    /// @notice Checks if an issuer has the authorization to issue claims for a specific topic and contract
    /// @dev This is a convenience function that combines trusted issuer validation with claim topic authorization
    ///      Query order: 1) Contract-specific registry, 2) Global registry
    /// @param contractAddress The contract address to check against
    /// @param issuer The address of the potential trusted issuer
    /// @param claimTopic The claim topic to check authorization for
    /// @return True if the issuer is trusted and authorized for the claim topic, false otherwise
    function hasClaimTopicForContract(
        address contractAddress,
        address issuer,
        uint256 claimTopic
    ) external view returns (bool);
}