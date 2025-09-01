// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// ERC-3643 import
import { IERC3643TrustedIssuersRegistry } from "./ERC-3643/IERC3643TrustedIssuersRegistry.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

/// @title ISMARTTrustedIssuersRegistry - Context-Aware Extension of ERC-3643 Trusted Issuers Registry
/// @author SettleMint
/// @notice Context-aware extension of the ERC-3643 trusted issuers registry that supports both global
///         and subject-specific trusted issuer management while maintaining full ERC-3643 compatibility.
/// @dev This interface extends IERC3643TrustedIssuersRegistry to add context-aware functionality:
///      - Inherits all standard ERC-3643 trusted issuers registry functions (global behavior)
///      - Adds subject-aware lookup function for granular issuer management
///      - Provides automatic union of global issuers + subject-specific overrides
///      - Uses address(0) subject to mean global issuers only for backward compatibility
///
///      Key design principles:
///      - Full backward compatibility with IERC3643TrustedIssuersRegistry
///      - Subject-specific issuers supplement (don't replace) global issuers
///      - Efficient O(1) lookups for both global and subject-specific queries
///      - ERC165 support for interface detection and fallback behavior
contract ISMARTTrustedIssuersRegistry is IERC3643TrustedIssuersRegistry {
    // --- Subject-Aware Functions ---

    /// @notice Returns the list of trusted issuers for a given claim topic and subject
    /// @dev This function returns the union of global trusted issuers + subject-specific trusted issuers.
    ///      For subject = address(0), returns only global trusted issuers (same as ERC-3643 function).
    ///      For other subjects, returns global issuers merged with subject-specific issuers.
    ///      This ensures that subjects always have access to at least the global trusted issuers
    ///      plus any additional subject-specific ones.
    /// @param subject The subject identifier (address(0) for global only, or specific address for subject-aware)
    /// @param claimTopic The claim topic to filter trusted issuers for
    /// @return Array of IClaimIssuer contracts trusted for this subject + topic (deduplicated union)
    function getTrustedIssuersForClaimTopic(address subject, uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    function isTrustedIssuer(address subject, address _issuer) external view returns (bool);

    function getTrustedIssuersForClaimTopic(uint256 claimTopic) external view override returns (IClaimIssuer[] memory) {
        return getTrustedIssuersForClaimTopic(address(0), claimTopic);
    }

    function isTrustedIssuer(address _issuer) external view override returns (bool) {
        return isTrustedIssuer(address(0), _issuer);
    }

}