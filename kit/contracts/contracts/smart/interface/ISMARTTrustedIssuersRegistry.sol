// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

/// @title ISMARTTrustedIssuersRegistry - Subject-Aware Trusted Issuers Registry
/// @author SettleMint
/// @notice Interface for a context-aware Trusted Issuers Registry.
/// @dev This interface extends the concept of the ERC-3643 Trusted Issuers Registry by making it
///      **subject-aware**, allowing the registry to manage both global and subject-specific trusted issuers.
///      "Subjects" can be any identity — e.g., tokens, organizations, or people — depending on the implementation.
///
///      Key differences versus ERC-3643:
///      1. All queries are **subject-aware**, merging global issuers with subject-specific ones if applicable.
///      2. No setters/CRUD operations are included in this interface; they remain in ATK implementations.
///      3. The registry supports flexible claim topics per subject, allowing metadata fields, token attributes,
///         or other claims to have different trusted issuers on a per-subject basis.
///      4. `_subject = address(0)` is treated as global-only, preserving compatibility with ERC-3643 concepts.
interface ISMARTTrustedIssuersRegistry is IERC165 {

    /// @notice Returns all trusted claim issuers for a specific subject
    /// @dev For `_subject = address(0)` returns global trusted issuers only.
    ///      For other subjects, it returns the union of global + subject-specific trusted issuers.
    /// @param _subject The subject identifier (address(0) for global only, or specific subject address)
    /// @return Array of all IClaimIssuer contracts trusted for this subject (deduplicated)
    function getTrustedIssuers(address _subject) external view returns (IClaimIssuer[] memory);

    /// @notice Returns the trusted claim issuers for a given claim topic and subject
    /// @dev Returns the union of global trusted issuers + subject-specific trusted issuers for this topic.
    ///      Ensures subjects always have access to at least the global trusted issuers.
    /// @param _subject The subject identifier (address(0) for global only, or specific subject address)
    /// @param claimTopic The claim topic to filter trusted issuers
    /// @return Array of IClaimIssuer contracts trusted for this subject + claim topic (deduplicated)
    function getTrustedIssuersForClaimTopic(address _subject, uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Checks if a given issuer is trusted for a specific subject
    /// @dev For `_subject = address(0)` checks global only.
    ///      For other subjects, checks global + subject-specific union.
    /// @param _subject The subject identifier (address(0) for global only, or specific subject address)
    /// @param _issuer The issuer address to check
    /// @return True if issuer is trusted for this subject
    function isTrustedIssuer(address _subject, address _issuer) external view returns (bool);

    /// @notice Checks if the trusted claim issuer is allowed to emit a certain claim topic
    /// @dev For `_subject = address(0)` checks global only.
    ///      For other subjects, checks global + subject-specific union.
    /// @param _subject The subject identifier (address(0) for global only, or specific subject address)
    /// @param _issuer The address of the trusted issuer
    /// @param _claimTopic The claim topic to check
    /// @return True if issuer is trusted for this subject and claim topic
    function hasClaimTopic(address _subject, address _issuer, uint256 _claimTopic) external view returns (bool);
}
