// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

/// @title IATKTrustedIssuersRegistry - ATK Base Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Base interface for ATK-specific trusted issuer registries with shared events for graph indexing
/// @dev This interface extends ISMARTTrustedIssuersRegistry and defines shared events that all ATK registries
///      emit for consistent graph indexing. Each implementation provides its own specific setter functions
///      with appropriate access control and validation logic.
interface IATKTrustedIssuersRegistry is ISMARTTrustedIssuersRegistry {
    // --- Events ---

    /// @notice Emitted when a trusted issuer is added in the registry
    /// @dev This event is emitted when a trusted issuer is added in the registry.
    /// @param _sender is the address of the sender of the transaction.
    /// @param _subject is the address of the subject of the trusted issuer.
    /// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract.
    /// @param _claimTopics is the set of claims that the trusted issuer is allowed to emit.
    event TrustedIssuerAdded(address indexed _sender, IClaimIssuer indexed _trustedIssuer,  address indexed _subject,  uint256[] _claimTopics);

    /// @notice Emitted when a trusted issuer is removed from the registry
    /// @dev This event is emitted when a trusted issuer is removed from the registry.
    /// @param _sender is the address of the sender of the transaction.
    /// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract.
    /// @param _subject is the address of the subject of the trusted issuer.
    event TrustedIssuerRemoved(address indexed _sender, IClaimIssuer indexed _trustedIssuer,  address indexed _subject);

    /// @notice Emitted when the set of claim topics is changed for a given trusted issuer
    /// @dev This event is emitted when the set of claim topics is changed for a given trusted issuer.
    /// @param _sender is the address of the sender of the transaction.
    /// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract.
    /// @param _subject is the address of the subject of the trusted issuer.
    /// @param _claimTopics is the set of claims that the trusted issuer is allowed to emit.
    event ClaimTopicsUpdated(address indexed _sender, IClaimIssuer indexed _trustedIssuer,  address indexed _subject, uint256[] _claimTopics);

    // --- Functions ---

    /// @notice Adds a new trusted issuer to the system registry with a specified list of claim topics
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The ClaimIssuer contract address of the trusted claim issuer
    /// @param claimTopics The set of claim topics that the trusted issuer is allowed to emit
    function addTrustedIssuer(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) external;

    /// @notice Removes an existing trusted issuer from the system registry
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The claim issuer to remove
    function removeTrustedIssuer(IClaimIssuer trustedIssuer) external;

    /// @notice Updates the list of claim topics for an existing trusted issuer in the system registry
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The claim issuer to update
    /// @param newClaimTopics The new set of claim topics that the trusted issuer is allowed to emit
    function updateIssuerClaimTopics(IClaimIssuer trustedIssuer, uint256[] calldata newClaimTopics) external;
}