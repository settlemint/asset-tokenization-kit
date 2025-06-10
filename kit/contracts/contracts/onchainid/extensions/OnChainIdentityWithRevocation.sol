// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { OnChainIdentity } from "./OnChainIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

abstract contract OnChainIdentityWithRevocation is OnChainIdentity {
    // Mapping to track revoked claims by their signature hash
    mapping(bytes32 => bool) public revokedClaims;

    // Event emitted when a claim is revoked
    event ClaimRevoked(bytes signature);

    // --- Errors ---
    error ClaimAlreadyRevoked(bytes32 signatureHash);

    // -- Abstract Functions ---
    function getClaim(bytes32 _claimId)
        public
        view
        virtual
        returns (uint256, uint256, address, bytes memory, bytes memory, string memory);
    function revokeClaimBySignature(bytes calldata signature) external virtual;
    function revokeClaim(bytes32 _claimId) external virtual returns (bool);

    /// @dev Checks if a claim is valid by first checking the parent implementation and then verifying it's not revoked
    /// @param _identity the identity contract related to the claim
    /// @param claimTopic the claim topic of the claim
    /// @param sig the signature of the claim
    /// @param data the data field of the claim
    /// @return claimValid true if the claim is valid and not revoked, false otherwise
    function isClaimValid(
        IIdentity _identity,
        uint256 claimTopic,
        bytes memory sig,
        bytes memory data
    )
        public
        view
        virtual
        override
        returns (bool claimValid)
    {
        // First check if the claim is valid according to the parent implementation
        if (!super.isClaimValid(_identity, claimTopic, sig, data)) {
            return false;
        }

        // Then check if the claim is not revoked
        return !isClaimRevoked(sig);
    }

    /// @dev Checks if a claim is revoked
    /// @param _sig The signature of the claim to check
    /// @return true if the claim is revoked, false otherwise
    function isClaimRevoked(bytes memory _sig) public view virtual returns (bool) {
        return revokedClaims[keccak256(_sig)];
    }

    /// @dev Revokes a claim by its signature
    /// @param signature The signature of the claim to revoke
    function _revokeClaimBySignature(bytes memory signature) internal virtual {
        bytes32 signatureHash = keccak256(signature);
        if (revokedClaims[signatureHash]) revert ClaimAlreadyRevoked(signatureHash);

        revokedClaims[signatureHash] = true;

        emit ClaimRevoked(signature);
    }

    /// @dev Revokes a claim by its ID
    /// @param _claimId The ID of the claim to revoke
    function _revokeClaim(bytes32 _claimId) internal virtual returns (bool) {
        uint256 foundClaimTopic;
        uint256 scheme;
        address issuer;
        bytes memory sig;
        bytes memory data;

        (foundClaimTopic, scheme, issuer, sig, data,) = getClaim(_claimId);

        _revokeClaimBySignature(sig);

        return true;
    }
}
