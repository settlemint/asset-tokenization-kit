// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// ERC-3643 imports
import { IERC3643TrustedIssuersRegistry } from "./ERC-3643/IERC3643TrustedIssuersRegistry.sol";

/// @title ISMARTTrustedIssuersRegistry - SMART-Compatible Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice SMART-compatible interface for managing trusted claim issuers in security token systems.
///         This interface generalizes the ERC-3643 trusted issuers functionality for the SMART ecosystem
///         while maintaining full compatibility with existing ERC-3643 implementations.
/// @dev This interface defines the core functionality for trusted issuer management without any
///      token-specific or context-specific logic. It serves as the base interface that can be
///      implemented by various trusted issuer registry contracts within the SMART ecosystem.
///
///      Key design principles:
///      - Pure ERC-3643 compatibility for existing integrations
///      - No token-specific logic at interface level
///      - Extensible for ATK-specific implementations
///      - Compatible with proxy upgrade patterns
interface ISMARTTrustedIssuersRegistry is IERC165, IERC3643TrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when a trusted issuer is added to the registry
    /// @param trustedIssuer The address of the trusted issuer that was added
    /// @param claimTopics Array of claim topics the issuer is trusted for
    event TrustedIssuerAdded(IClaimIssuer indexed trustedIssuer, uint256[] claimTopics);

    /// @notice Emitted when a trusted issuer is removed from the registry
    /// @param trustedIssuer The address of the trusted issuer that was removed
    event TrustedIssuerRemoved(IClaimIssuer indexed trustedIssuer);

    /// @notice Emitted when an issuer's claim topics are updated
    /// @param trustedIssuer The address of the issuer whose topics were updated
    /// @param claimTopics The new array of claim topics for the issuer
    event ClaimTopicsUpdated(IClaimIssuer indexed trustedIssuer, uint256[] claimTopics);

}