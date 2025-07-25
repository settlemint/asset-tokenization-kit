// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ERC734KeyPurposes } from "../ERC734KeyPurposes.sol";

/// @title OnChainIdentity
/// @author SettleMint
/// @notice Abstract contract providing core functionality for on-chain identity management
/// @dev This contract implements the IIdentity interface and provides methods for validating
///      claims and recovering signers from signatures. It serves as a base for identity
///      contracts that manage claims and keys on-chain.
abstract contract OnChainIdentity is IIdentity {
    /// @notice Checks if a key has a specific purpose
    /// @param _key The key identifier to check
    /// @param _purpose The purpose to check for
    /// @return exists True if the key has the specified purpose
    function keyHasPurpose(bytes32 _key, uint256 _purpose) public view virtual override returns (bool exists);

    /// @notice Validates a claim by verifying its signature
    /// @dev Checks if a claim is valid. Claims issued by the identity are self-attested claims. They do not have a
    /// built-in revocation mechanism and are considered valid as long as their signature is valid and they are still
    /// stored by the identity contract.
    /// @param _identity the identity contract related to the claim
    /// @param claimTopic the claim topic of the claim
    /// @param sig the signature of the claim
    /// @param data the data field of the claim
    /// @return claimValid true if the claim is valid, false otherwise
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
        bytes32 dataHash = keccak256(abi.encode(_identity, claimTopic, data));
        // Use abi.encodePacked to concatenate the message prefix and the message to sign.
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        // Recover address of data signer
        address recovered = getRecoveredAddress(sig, prefixedHash);

        // Take hash of recovered address
        bytes32 hashedAddr = keccak256(abi.encode(recovered));

        // Does the trusted identifier have they key which signed the user's claim?
        //  && (isClaimRevoked(_claimId) == false)
        if (keyHasPurpose(hashedAddr, ERC734KeyPurposes.CLAIM_SIGNER_KEY)) {
            return true;
        }

        return false;
    }

    /// @notice Recovers the address that signed the given data
    /// @dev returns the address that signed the given data
    /// @param sig the signature of the data
    /// @param dataHash the data that was signed
    /// @return addr the address that signed dataHash and created the signature sig
    function getRecoveredAddress(bytes memory sig, bytes32 dataHash) public pure returns (address addr) {
        return ECDSA.recover(dataHash, sig);
    }
}
