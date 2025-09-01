// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

/// @title ISMARTTrustedIssuersRegistry - Subject-Aware Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Subject-aware interface for managing trusted claim issuers that supports both global
///         and subject-specific trusted issuer management in a clean, unified interface.
/// @dev This interface provides subject-aware trusted issuer functionality where:
///      - All queries include a subject parameter (e.g., token contract, user address)
///      - Global trusted issuers apply to all subjects
///      - Subject-specific trusted issuers can extend or override global settings
///      - Implementation automatically merges and deduplicates results
///
///      Key design principles:
///      - Single clean interface for all trusted issuer queries
///      - Subject-aware by default (no separate context functions needed)
///      - Backward compatible through subject parameter patterns
///      - Efficient merged query results with automatic deduplication
interface ISMARTTrustedIssuersRegistry is IERC165 {
    // --- Events ---

    /// @notice Emitted when a global trusted issuer is added to the registry
    /// @param trustedIssuer The address of the trusted issuer that was added
    /// @param claimTopics Array of claim topics the issuer is trusted for globally
    event GlobalTrustedIssuerAdded(IClaimIssuer indexed trustedIssuer, uint256[] claimTopics);

    /// @notice Emitted when a global trusted issuer is removed from the registry
    /// @param trustedIssuer The address of the trusted issuer that was removed
    event GlobalTrustedIssuerRemoved(IClaimIssuer indexed trustedIssuer);

    /// @notice Emitted when a global issuer's claim topics are updated
    /// @param trustedIssuer The address of the issuer whose topics were updated
    /// @param claimTopics The new array of claim topics for the issuer
    event GlobalClaimTopicsUpdated(IClaimIssuer indexed trustedIssuer, uint256[] claimTopics);

    /// @notice Emitted when subject-specific trusted issuers are updated
    /// @param subject The subject address for which issuers were updated
    /// @param claimTopic The claim topic that was updated
    /// @param trustedIssuers The new array of trusted issuers for this subject and topic
    event SubjectTrustedIssuersUpdated(
        address indexed subject,
        uint256 indexed claimTopic,
        IClaimIssuer[] trustedIssuers
    );

    // --- Global Trusted Issuer Management ---

    /// @notice Adds a global trusted issuer that applies to all subjects
    /// @dev This issuer will be trusted for the specified claim topics across all subjects.
    ///      Access control should be implemented by the contract.
    /// @param trustedIssuer The IClaimIssuer contract address to add as globally trusted
    /// @param claimTopics Array of claim topic IDs this issuer is trusted for
    function addGlobalTrustedIssuer(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) external;

    /// @notice Removes a global trusted issuer
    /// @dev Removes the issuer from all global claim topics. Does not affect subject-specific settings.
    /// @param trustedIssuer The IClaimIssuer contract address to remove
    function removeGlobalTrustedIssuer(IClaimIssuer trustedIssuer) external;

    /// @notice Updates claim topics for a global trusted issuer
    /// @dev Replaces all existing global claim topics for this issuer with the new list.
    /// @param trustedIssuer The IClaimIssuer contract address to update
    /// @param claimTopics The new array of claim topics this issuer is trusted for globally
    function updateGlobalIssuerClaimTopics(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) external;

    // --- Subject-Specific Trusted Issuer Management ---

    /// @notice Sets trusted issuers for a specific subject and claim topic
    /// @dev This allows subject-specific overrides or extensions to global trusted issuers.
    ///      Access control should be implemented by the contract (typically delegated to subject governance).
    /// @param subject The subject address to set trusted issuers for
    /// @param claimTopic The claim topic to set trusted issuers for
    /// @param trustedIssuers Array of IClaimIssuer addresses trusted for this subject and topic
    ///                      Pass empty array to remove subject-specific issuers (fallback to global)
    function setSubjectTrustedIssuers(
        address subject,
        uint256 claimTopic,
        IClaimIssuer[] calldata trustedIssuers
    ) external;

    /// @notice Removes subject-specific trusted issuers for a given subject and claim topic
    /// @dev This is a convenience function that calls setSubjectTrustedIssuers with empty array.
    ///      After removal, queries will use only global trusted issuers for this subject and topic.
    /// @param subject The subject address to remove trusted issuers for
    /// @param claimTopic The claim topic to remove subject-specific trusted issuers for
    function removeSubjectTrustedIssuers(address subject, uint256 claimTopic) external;

    // --- Subject-Aware Query Functions ---

    /// @notice Get all trusted issuers for a claim topic, considering a specific subject
    /// @dev This function merges global trusted issuers with subject-specific trusted issuers.
    ///      Returns a deduplicated array containing:
    ///      1. All global trusted issuers for the claim topic
    ///      2. All subject-specific trusted issuers for the claim topic
    ///      If no issuers are configured for either global or subject-specific, returns empty array.
    /// @param subject The address of the subject (e.g., token contract) for subject-specific issuers
    /// @param claimTopic The claim topic identifier to find trusted issuers for
    /// @return Array of IClaimIssuer contracts trusted for this subject and claim topic (deduplicated)
    function getTrustedIssuersForClaimTopic(address subject, uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Check if an issuer is trusted for a given subject and claim topic
    /// @dev This function checks both global and subject-specific trusted issuers.
    ///      Returns true if the issuer is trusted either globally or specifically for the subject.
    /// @param subject The subject address to check trusted issuers for
    /// @param issuer The IClaimIssuer contract address to check
    /// @param claimTopic The claim topic to check authorization for
    /// @return True if the issuer is trusted for the claim topic in the context of the subject
    function isTrustedIssuer(address subject, IClaimIssuer issuer, uint256 claimTopic)
        external
        view
        returns (bool);

    // --- Legacy Support Functions (for backward compatibility) ---

    /// @notice Get global trusted issuers for a claim topic (legacy compatibility)
    /// @dev This function is equivalent to getTrustedIssuersForClaimTopic(address(0), claimTopic).
    ///      Provided for backward compatibility with existing code that expects global-only queries.
    /// @param claimTopic The claim topic identifier
    /// @return Array of globally trusted IClaimIssuer contracts for the claim topic
    function getGlobalTrustedIssuersForClaimTopic(uint256 claimTopic) 
        external 
        view 
        returns (IClaimIssuer[] memory);

    /// @notice Check if an issuer is globally trusted for a claim topic (legacy compatibility)
    /// @dev This function is equivalent to isTrustedIssuer(address(0), issuer, claimTopic).
    ///      Provided for backward compatibility.
    /// @param issuer The IClaimIssuer contract address to check
    /// @param claimTopic The claim topic to check authorization for
    /// @return True if the issuer is globally trusted for the claim topic
    function isGloballyTrustedIssuer(IClaimIssuer issuer, uint256 claimTopic) external view returns (bool);
}