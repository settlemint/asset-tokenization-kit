// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { OnChainIdentity } from "./OnChainIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title OnChainIdentityWithRevocation
/// @author SettleMint
/// @notice Abstract contract extending OnChainIdentity with claim revocation capabilities
/// @dev This contract adds the ability to revoke claims to the base OnChainIdentity functionality.
///      It implements both OnChainIdentity and IClaimIssuer interfaces, providing a complete
///      claim management system with revocation support.
abstract contract OnChainIdentityWithRevocation is OnChainIdentity, IClaimIssuer {
    /// @notice Mapping to track revoked claims by their signature hash
    /// @dev Maps from the keccak256 hash of a claim signature to a boolean indicating if it's revoked
    mapping(bytes32 => bool) public revokedClaims;

    // --- Errors ---
    error ClaimAlreadyRevoked(bytes32 signatureHash);

    // -- Abstract Functions ---
    /// @notice Retrieves a claim by its ID
    /// @param _claimId The ID of the claim to retrieve
    /// @return topic The topic of the claim
    /// @return scheme The signature scheme used
    /// @return issuer The address of the claim issuer
    /// @return signature The signature of the claim
    /// @return data The data of the claim
    /// @return uri The URI of the claim
    function getClaim(bytes32 _claimId)
        public
        view
        virtual
        returns (
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes memory signature,
            bytes memory data,
            string memory uri
        );

    /// @notice Validates a claim and checks if it has been revoked
    /// @dev Checks if a claim is valid by first checking the parent implementation and then verifying it's not revoked
    /// @param _identity the identity contract related to the claim
    /// @param claimTopic the claim topic of the claim
    /// @param sig the signature of the claim
    /// @param data the data field of the claim
    /// @return claimValid true if the claim is valid and not revoked, false otherwise
    function isClaimValid(IIdentity _identity, uint256 claimTopic, bytes memory sig, bytes memory data)
        public
        view
        virtual
        override(OnChainIdentity, IClaimIssuer)
        returns (bool claimValid)
    {
        // First check if the claim is valid according to the parent implementation
        if (!super.isClaimValid(_identity, claimTopic, sig, data)) {
            return false;
        }

        // Then check if the claim is not revoked
        return !isClaimRevoked(sig);
    }

    /// @notice Checks if a claim is revoked
    /// @dev Checks if a claim is revoked
    /// @param _sig The signature of the claim to check
    /// @return True if the claim is revoked, false otherwise
    function isClaimRevoked(bytes memory _sig) public view virtual override(IClaimIssuer) returns (bool) {
        return revokedClaims[keccak256(_sig)];
    }

    /// @notice Revokes a claim by its signature
    /// @dev Revokes a claim by its signature
    /// @param signature The signature of the claim to revoke
    function _revokeClaimBySignature(bytes memory signature) internal virtual {
        bytes32 signatureHash = keccak256(signature);
        if (revokedClaims[signatureHash]) revert ClaimAlreadyRevoked(signatureHash);

        revokedClaims[signatureHash] = true;

        emit ClaimRevoked(signature);
    }

    /// @notice Revokes a claim by its ID
    /// @dev Revokes a claim by its ID
    /// @param _claimId The ID of the claim to revoke
    /// @param _identity The identity contract related to the claim
    /// @return True if the claim was successfully revoked
    function _revokeClaim(bytes32 _claimId, address _identity) internal virtual returns (bool) {
        uint256 foundClaimTopic;
        uint256 scheme;
        address issuer;
        bytes memory sig;
        bytes memory data;

        (foundClaimTopic, scheme, issuer, sig, data,) = IIdentity(_identity).getClaim(_claimId);

        _revokeClaimBySignature(sig);

        return true;
    }
}
