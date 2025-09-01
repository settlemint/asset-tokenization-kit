// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// SMART interface
import { ISMARTTrustedIssuersRegistry } from "./ISMARTTrustedIssuersRegistry.sol";

/// @title ISMARTTrustedIssuersMetaRegistry - SMART-Compatible Meta Registry Interface
/// @author SettleMint
/// @notice SMART-compatible interface for managing a registry-of-registries system that provides
///         context-aware trusted issuer queries. This enables both global and context-specific
///         trusted issuer management while maintaining compatibility with existing SMART systems.
/// @dev This interface defines a meta-registry that:
///      - Maps context addresses (tokens/contracts) to their specific ISMARTTrustedIssuersRegistry
///      - Maintains a global registry for system-wide trusted issuers
///      - Provides aggregated query functions that combine global and context-specific results
///      - Enables efficient context-aware trusted issuer validation
///
///      Key design principles:
///      - Full SMART ecosystem compatibility
///      - Context-agnostic interface design
///      - Efficient aggregation of multiple registry sources
///      - Backward compatibility with single-registry systems
interface ISMARTTrustedIssuersMetaRegistry is IERC165 {
    // --- Events ---

    /// @notice Emitted when the global registry is set or updated
    /// @param oldRegistry The address of the previous global registry (address(0) if none)
    /// @param newRegistry The address of the new global registry
    event GlobalRegistrySet(
        address indexed oldRegistry,
        address indexed newRegistry
    );

    /// @notice Emitted when a context-specific registry is set or updated
    /// @param context The context address (token/contract) for which the registry is being set
    /// @param oldRegistry The address of the previous registry for this context (address(0) if none)
    /// @param newRegistry The address of the new registry for this context
    event ContextRegistrySet(
        address indexed context,
        address indexed oldRegistry,
        address indexed newRegistry
    );

    // --- Registry Management Functions ---

    /// @notice Sets or updates the global trusted issuers registry
    /// @dev This registry provides system-wide trusted issuers that apply to all contexts
    ///      unless overridden by context-specific registries. Should emit GlobalRegistrySet event.
    /// @param registry The address of the global ISMARTTrustedIssuersRegistry contract
    ///                 Pass address(0) to remove the global registry
    function setGlobalRegistry(address registry) external;

    /// @notice Sets or updates the trusted issuers registry for a specific context
    /// @dev This allows individual contexts (typically tokens/contracts) to have their own
    ///      trusted issuers registry that supplements the global registry.
    ///      Should emit ContextRegistrySet event.
    /// @param context The address of the context to set the registry for
    /// @param registry The address of the ISMARTTrustedIssuersRegistry contract
    ///                 Pass address(0) to remove the context-specific registry
    function setRegistryForContext(address context, address registry) external;

    // --- Registry Query Functions ---

    /// @notice Returns the global trusted issuers registry
    /// @return The ISMARTTrustedIssuersRegistry interface of the global registry,
    ///         or ISMARTTrustedIssuersRegistry(address(0)) if no global registry is set
    function getGlobalRegistry() external view returns (ISMARTTrustedIssuersRegistry);

    /// @notice Returns the trusted issuers registry for a specific context
    /// @param context The context address to query
    /// @return The ISMARTTrustedIssuersRegistry interface for the context,
    ///         or ISMARTTrustedIssuersRegistry(address(0)) if no registry is set
    function getRegistryForContext(address context)
        external
        view
        returns (ISMARTTrustedIssuersRegistry);

    // --- Aggregated Query Functions ---

    /// @notice Gets all trusted issuers for a specific claim topic and context by aggregating
    ///         results from both global and context-specific registries
    /// @dev Aggregates results from: 1) Global registry, 2) Context-specific registry
    ///      Removes duplicates if an issuer appears in both registries.
    ///      Returns empty array if no registries are configured or no issuers found.
    /// @param context The context address to query trusted issuers for
    /// @param claimTopic The claim topic to find trusted issuers for
    /// @return Array of IClaimIssuer addresses trusted for the claim topic and context
    function getTrustedIssuersForContext(address context, uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Checks if an issuer is trusted for a specific context and claim topic by querying
    ///         both global and context-specific registries
    /// @dev Query order: 1) Global registry, 2) Context-specific registry
    ///      Returns true if the issuer is found in either registry and authorized for the topic.
    /// @param context The context address to check trusted issuers for
    /// @param issuer The address of the potential trusted issuer
    /// @param claimTopic The claim topic to check authorization for
    /// @return True if the issuer is trusted for the claim topic in the context, false otherwise
    function hasClaimTopicForContext(
        address context,
        address issuer,
        uint256 claimTopic
    ) external view returns (bool);

    /// @notice Checks if an issuer is trusted for a specific context by querying
    ///         both global and context-specific registries
    /// @dev Query order: 1) Global registry, 2) Context-specific registry
    ///      Returns true if the issuer is found in either registry.
    /// @param context The context address to check trusted issuers for
    /// @param issuer The address of the potential trusted issuer
    /// @return True if the issuer is trusted in the context, false otherwise
    function isTrustedIssuerForContext(address context, address issuer)
        external
        view
        returns (bool);
}