// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";

/// @title IATKTrustedIssuersRegistry - ATK Base Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Base interface for ATK-specific trusted issuer registries with shared events for graph indexing
/// @dev This interface extends ISMARTTrustedIssuersRegistry and defines shared events that all ATK registries
///      emit for consistent graph indexing. Each implementation provides its own specific setter functions
///      with appropriate access control and validation logic.
interface IATKTrustedIssuersRegistry is ISMARTTrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when a trusted issuer is added to the registry for a specific subject
    /// @param sender The address that performed the addition
    /// @param subject The subject identifier (address(0) for global, or specific subject address)
    /// @param issuer The address of the added trusted issuer
    /// @param claimTopics The claim topics the issuer is trusted for
    event TrustedIssuerAddedForSubject(
        address indexed sender,
        address indexed subject,
        address indexed issuer,
        uint256[] claimTopics
    );

    /// @notice Emitted when a trusted issuer is removed from the registry for a specific subject
    /// @param sender The address that performed the removal
    /// @param subject The subject identifier (address(0) for global, or specific subject address)
    /// @param issuer The address of the removed trusted issuer
    event TrustedIssuerRemovedForSubject(
        address indexed sender,
        address indexed subject,
        address indexed issuer
    );

    /// @notice Emitted when an issuer's claim topics are updated for a specific subject
    /// @param sender The address that performed the update
    /// @param subject The subject identifier (address(0) for global, or specific subject address)
    /// @param issuer The address of the issuer whose topics were updated
    /// @param claimTopics The new claim topics for the issuer
    event ClaimTopicsUpdatedForSubject(
        address indexed sender,
        address indexed subject,
        address indexed issuer,
        uint256[] claimTopics
    );

    // --- Shared Events for Graph Indexing ---
    // All ATK trusted issuer registries emit these events for consistent indexing
}