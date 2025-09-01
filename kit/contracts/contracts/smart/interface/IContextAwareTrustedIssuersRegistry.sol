// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// SMART interface
import { ISMARTTrustedIssuersRegistry } from "./ISMARTTrustedIssuersRegistry.sol";

/// @title IContextAwareTrustedIssuersRegistry - Context-Aware Extension of Trusted Issuers Registry
/// @author SettleMint
/// @notice Context-aware extension of the trusted issuers registry that supports both global
///         and context-specific trusted issuer management while maintaining full compatibility
///         with existing SMART systems.
/// @dev This interface extends ISMARTTrustedIssuersRegistry to add context-aware functionality:
///      - Inherits all standard trusted issuers registry functions (global behavior)
///      - Adds context-specific lookup functions for granular issuer management
///      - Uses bytes32 for context to support flexible identification schemes
///      - Provides automatic fallback to global issuers when context-specific ones don't exist
///
///      Key design principles:
///      - Full backward compatibility with ISMARTTrustedIssuersRegistry
///      - Context-specific issuers supplement (don't replace) global issuers
///      - Efficient O(1) lookups for both global and context-specific queries
///      - ERC165 support for interface detection and fallback behavior
interface IContextAwareTrustedIssuersRegistry is ISMARTTrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when context-specific trusted issuers are updated
    /// @param context The context identifier for which issuers were updated
    /// @param claimTopic The claim topic that was updated
    /// @param issuers The new array of trusted issuers for this context and topic
    event ContextTrustedIssuersUpdated(
        bytes32 indexed context,
        uint256 indexed claimTopic,
        IClaimIssuer[] issuers
    );

    // --- Context-Specific Functions ---

    /// @notice Returns the list of trusted issuers for a given claim topic within a specific context
    /// @dev This function returns context-specific trusted issuers. If no context-specific issuers
    ///      exist for the given context and claim topic, it should return the global trusted issuers
    ///      as a fallback. This ensures that contexts always have access to at least the global
    ///      trusted issuers unless explicitly overridden.
    /// @param context The context identifier (e.g. token address, system id)
    /// @param claimTopic The claim topic to filter trusted issuers for
    /// @return Array of IClaimIssuer contracts trusted for this context + topic
    function getTrustedIssuersForClaimTopic(bytes32 context, uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Checks if a specific issuer is trusted for a specific context and claim topic
    /// @dev This function should check both context-specific and global trusted issuers.
    ///      Returns true if the issuer is trusted either globally or for the specific context.
    /// @param context The context identifier to check trusted issuers for
    /// @param issuer The address of the potential trusted issuer
    /// @param claimTopic The claim topic to check authorization for
    /// @return True if the issuer is trusted for the claim topic in the context, false otherwise
    function hasClaimTopicForContext(
        bytes32 context,
        address issuer,
        uint256 claimTopic
    ) external view returns (bool);

    /// @notice Checks if a specific issuer is trusted within a specific context
    /// @dev This function should check both context-specific and global trusted issuers.
    ///      Returns true if the issuer is trusted either globally or for the specific context.
    /// @param context The context identifier to check trusted issuers for
    /// @param issuer The address of the potential trusted issuer
    /// @return True if the issuer is trusted in the context, false otherwise
    function isTrustedIssuerForContext(bytes32 context, address issuer)
        external
        view
        returns (bool);

    // --- Context Management Functions ---

    /// @notice Sets the list of trusted issuers for a specific context and claim topic
    /// @dev This function allows setting context-specific trusted issuers that supplement
    ///      the global trusted issuers. Access control should be implemented by the contract.
    /// @param context The context identifier to set trusted issuers for
    /// @param claimTopic The claim topic to set trusted issuers for
    /// @param issuers Array of IClaimIssuer addresses to trust for this context and topic
    ///                Pass empty array to remove context-specific issuers (fallback to global)
    function setTrustedIssuersForContext(
        bytes32 context,
        uint256 claimTopic,
        IClaimIssuer[] calldata issuers
    ) external;

    /// @notice Removes all context-specific trusted issuers for a given context and claim topic
    /// @dev This is a convenience function that calls setTrustedIssuersForContext with empty array.
    ///      After removal, queries will fallback to global trusted issuers.
    /// @param context The context identifier to remove trusted issuers for
    /// @param claimTopic The claim topic to remove context-specific trusted issuers for
    function removeTrustedIssuersForContext(bytes32 context, uint256 claimTopic) external;
}