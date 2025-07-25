// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

/// Events

/// @notice Emitted when a trusted issuer is added in the registry
/// @dev This event is emitted when a trusted issuer is added in the registry.
/// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract.
/// @param _claimTopics is the set of claims that the trusted issuer is allowed to emit.
event TrustedIssuerAdded(IClaimIssuer indexed _trustedIssuer, uint256[] _claimTopics);

/// @notice Emitted when a trusted issuer is removed from the registry
/// @dev This event is emitted when a trusted issuer is removed from the registry.
/// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract.
event TrustedIssuerRemoved(IClaimIssuer indexed _trustedIssuer);

/// @notice Emitted when the set of claim topics is changed for a given trusted issuer
/// @dev This event is emitted when the set of claim topics is changed for a given trusted issuer.
/// @param _trustedIssuer is the address of the trusted issuer's ClaimIssuer contract
/// @param _claimTopics is the set of claims that the trusted issuer is allowed to emit.
event ClaimTopicsUpdated(IClaimIssuer indexed _trustedIssuer, uint256[] _claimTopics);

/// @title IERC3643TrustedIssuersRegistry Interface
/// @author Tokeny
/// @notice Interface for ERC-3643 compliant Trusted Issuers Registry managing authorized claim issuers
/// @dev This interface extends IERC165 for interface detection support and defines the standard
///      for managing trusted claim issuers and their allowed claim topics in the identity ecosystem.
interface IERC3643TrustedIssuersRegistry is IERC165 {
    // Functions

    // Setters
    /**
     *  @notice Registers a ClaimIssuer contract as trusted claim issuer
     *  @dev registers a ClaimIssuer contract as trusted claim issuer.
     *  Requires that a ClaimIssuer contract doesn't already exist
     *  Requires that the claimTopics set is not empty
     *  Requires that there is no more than 15 claimTopics
     *  Requires that there is no more than 50 Trusted issuers
     *  @param _trustedIssuer The ClaimIssuer contract address of the trusted claim issuer.
     *  @param _claimTopics the set of claim topics that the trusted issuer is allowed to emit
     *  This function can only be called by the owner of the Trusted Issuers Registry contract
     *  emits a `TrustedIssuerAdded` event
     */
    function addTrustedIssuer(IClaimIssuer _trustedIssuer, uint256[] calldata _claimTopics) external;

    /**
     *  @notice Removes the ClaimIssuer contract of a trusted claim issuer
     *  @dev Removes the ClaimIssuer contract of a trusted claim issuer.
     *  Requires that the claim issuer contract to be registered first
     *  @param _trustedIssuer the claim issuer to remove.
     *  This function can only be called by the owner of the Trusted Issuers Registry contract
     *  emits a `TrustedIssuerRemoved` event
     */
    function removeTrustedIssuer(IClaimIssuer _trustedIssuer) external;

    /**
     *  @notice Updates the set of claim topics that a trusted issuer is allowed to emit
     *  @dev Updates the set of claim topics that a trusted issuer is allowed to emit.
     *  Requires that this ClaimIssuer contract already exists in the registry
     *  Requires that the provided claimTopics set is not empty
     *  Requires that there is no more than 15 claimTopics
     *  @param _trustedIssuer the claim issuer to update.
     *  @param _claimTopics the set of claim topics that the trusted issuer is allowed to emit
     *  This function can only be called by the owner of the Trusted Issuers Registry contract
     *  emits a `ClaimTopicsUpdated` event
     */
    function updateIssuerClaimTopics(IClaimIssuer _trustedIssuer, uint256[] calldata _claimTopics) external;

    /// Getters

    /**
     *  @notice Gets all the trusted claim issuers stored
     *  @dev Function for getting all the trusted claim issuers stored.
     *  @return array of all claim issuers registered.
     */
    function getTrustedIssuers() external view returns (IClaimIssuer[] memory);

    /**
     *  @notice Gets all the trusted issuer allowed for a given claim topic
     *  @dev Function for getting all the trusted issuer allowed for a given claim topic.
     *  @param claimTopic the claim topic to get the trusted issuers for.
     *  @return array of all claim issuer addresses that are allowed for the given claim topic.
     */
    function getTrustedIssuersForClaimTopic(uint256 claimTopic) external view returns (IClaimIssuer[] memory);

    /**
     *  @notice Checks if the ClaimIssuer contract is trusted
     *  @dev Checks if the ClaimIssuer contract is trusted
     *  @param _issuer the address of the ClaimIssuer contract
     *  @return true if the issuer is trusted, false otherwise.
     */
    function isTrustedIssuer(address _issuer) external view returns (bool);

    /**
     *  @notice Gets all the claim topic of trusted claim issuer
     *  @dev Function for getting all the claim topic of trusted claim issuer
     *  Requires the provided ClaimIssuer contract to be registered in the trusted issuers registry.
     *  @param _trustedIssuer the trusted issuer concerned.
     *  @return The set of claim topics that the trusted issuer is allowed to emit
     */
    function getTrustedIssuerClaimTopics(IClaimIssuer _trustedIssuer) external view returns (uint256[] memory);

    /**
     *  @notice Checks if the trusted claim issuer is allowed to emit a certain claim topic
     *  @dev Function for checking if the trusted claim issuer is allowed
     *  to emit a certain claim topic
     *  @param _issuer the address of the trusted issuer's ClaimIssuer contract
     *  @param _claimTopic the Claim Topic that has to be checked to know if the `issuer` is allowed to emit it
     *  @return true if the issuer is trusted for this claim topic.
     */
    function hasClaimTopic(address _issuer, uint256 _claimTopic) external view returns (bool);
}
