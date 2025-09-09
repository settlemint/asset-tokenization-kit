// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";

/// @title IATKTrustedIssuersMetaRegistry - Registry-of-Registries Interface
/// @author SettleMint
/// @notice Interface for managing a registry-of-registries system that tracks system and contract-specific
///         trusted issuers registries. This enables lightweight tokens while maintaining comprehensive
///         trusted issuer management.
/// @dev This interface defines a meta-registry that:
///      - Stores a system trusted issuers registry for system-wide issuers
///      - Maps contract addresses to their specific trusted issuers registries
///      - Provides aggregated query functions that check both system and contract-specific registries
///      - Enables efficient trusted issuer management without bloating token runtime size
interface IATKTrustedIssuersMetaRegistry is IATKTrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when the system registry is set or updated
    /// @param sender The address that initiated the change
    /// @param oldRegistry The address of the previous system registry (address(0) if none)
    /// @param newRegistry The address of the new system registry
    event SystemRegistrySet(address indexed sender, address indexed oldRegistry, address indexed newRegistry);

    /// @notice Emitted when a subject-specific registry is set or updated
    /// @param sender The address that initiated the change
    /// @param subject The subject address for which the registry is being set
    /// @param oldRegistry The address of the previous registry for this subject (address(0) if none)
    /// @param newRegistry The address of the new registry for this subject
    event SubjectRegistrySet(
        address indexed sender, address indexed subject, address indexed oldRegistry, address newRegistry
    );

    /// @notice Initializes the registry with an initial admin and registrars.
    /// @param accessManager The address of the access manager
    /// @param systemRegistry The address of the system trusted issuers registry
    function initialize(address accessManager, address systemRegistry) external;

    // --- Registry Management Functions ---

    /// @notice Sets the system trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages the system registry that applies to all contracts
    /// @param registry The address of the system trusted issuers registry (can be address(0) to remove)
    function setSystemRegistry(address registry) external;

    /// @notice Sets a subject-specific trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages subject-specific registries
    /// @param subject The subject address to set the registry for
    /// @param registry The address of the trusted issuers registry for this subject (can be address(0) to remove)
    function setRegistryForSubject(address subject, address registry) external;

    /// @notice Removes a subject-specific trusted issuers registry
    /// @dev Convenience function that delegates to setRegistryForSubject with address(0)
    /// @param subject The subject address to remove the registry for
    function removeRegistryForSubject(address subject) external;

    // --- Registry Getters ---

    /// @notice Gets the system trusted issuers registry
    /// @return The system trusted issuers registry address
    function getSystemRegistry() external view returns (IATKTrustedIssuersRegistry);

    /// @notice Gets the subject-specific trusted issuers registry
    /// @param subject The subject address to get the registry for
    /// @return The subject-specific trusted issuers registry address
    function getRegistryForSubject(address subject) external view returns (IATKTrustedIssuersRegistry);
}
