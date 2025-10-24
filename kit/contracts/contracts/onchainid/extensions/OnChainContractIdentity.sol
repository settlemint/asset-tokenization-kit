// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IContractIdentity } from "../IContractIdentity.sol";
import { ERC735ClaimSchemes } from "../ERC735ClaimSchemes.sol";

/// @title OnChainContractIdentity
/// @author SettleMint
/// @notice Abstract contract extension providing CONTRACT scheme functionality for contract identities
/// @dev This contract extends identity contracts with the ability to issue and validate
///      CONTRACT scheme claims. Unlike ECDSA-based claims, CONTRACT scheme claims are
///      validated by existence rather than cryptographic signatures, enabling smart
///      contracts to act as claim issuers without managing private keys.
abstract contract OnChainContractIdentity is IContractIdentity {
    // --- Errors ---

    /// @dev Error thrown when the associated contract is not set
    error AssociatedContractNotSet();

    /// @dev Error thrown when the caller is not authorized for the operation
    error UnauthorizedContractOperation(address caller);

    // --- Abstract Functions (to be implemented by inheriting contracts) ---

    /// @notice Returns the address of the contract associated with this identity
    /// @dev Must be implemented by inheriting contracts
    /// @return The contract address
    function getAssociatedContract() public view virtual returns (address);

    // --- CONTRACT Scheme Claim Validation ---

    /// @notice Validates a CONTRACT scheme claim by checking its existence on the subject identity
    /// @dev For CONTRACT scheme claims, validation is done by existence rather than signature verification
    /// @param subject The identity contract to check for the claim
    /// @param topic The claim topic to validate
    /// @param data The claim data to validate
    /// @return True if the claim exists with matching parameters, false otherwise
    // solhint-disable-next-line use-natspec
    function isClaimValid(
        IIdentity subject,
        uint256 topic,
        bytes calldata, /* sig - not used for contract scheme */
        bytes calldata data
    )
        external
        view
        virtual
        override
        returns (bool)
    {
        bytes32 claimId = keccak256(abi.encode(address(this), topic));

        try subject.getClaim(
            claimId
        ) returns (
            uint256 storedTopic,
            uint256 scheme,
            address storedIssuer,
            bytes memory, /* signature - not used */
            bytes memory storedData,
            string memory /* uri - not used */
        ) {
            return (storedTopic == topic && storedIssuer == address(this)
                    && scheme == ERC735ClaimSchemes.SCHEME_CONTRACT && keccak256(storedData) == keccak256(data));
        } catch {
            return false;
        }
    }

    // --- CONTRACT Scheme Claim Issuance ---

    /// @notice Issues a CONTRACT scheme claim to a subject identity on behalf of the associated contract
    /// @dev Only the associated contract can call this function to issue claims
    /// @param subject The identity contract to add the claim to
    /// @param topic The claim topic
    /// @param data The claim data
    /// @param uri The claim URI (e.g., IPFS hash)
    /// @return claimId The ID of the created claim
    function issueClaimTo(IIdentity subject, uint256 topic, bytes calldata data, string calldata uri)
        external
        virtual
        returns (bytes32 claimId)
    {
        address associatedContract = getAssociatedContract();
        if (associatedContract == address(0)) {
            revert AssociatedContractNotSet();
        }

        if (msg.sender != associatedContract) {
            revert UnauthorizedContractOperation(msg.sender);
        }

        return subject.addClaim(
            topic,
            ERC735ClaimSchemes.SCHEME_CONTRACT,
            address(this),
            "", // Empty signature for contract scheme
            data,
            uri
        );
    }

    // --- IClaimIssuer Stub Implementations ---

    /// @notice Revokes a claim (not implemented for contract identities)
    /// @dev Contract identities manage claims through existence, not revocation lists.
    ///      The parameters are unnamed as they are not used in this implementation.
    /// @return Always returns false as revocation is not supported
    // solhint-disable-next-line use-natspec
    function revokeClaim(bytes32, address) external pure virtual override returns (bool) {
        return false;
    }

    /// @notice Revokes a claim by signature (not implemented for contract identities)
    /// @dev Contract identities don't use signature-based revocation.
    ///      The parameter is unnamed as it is not used in this implementation.
    // solhint-disable-next-line use-natspec
    function revokeClaimBySignature(bytes calldata) external pure virtual override {
        // No-op: contract identities don't support signature-based revocation
    }

    /// @notice Checks if a claim is revoked (always returns false for contract identities)
    /// @dev Contract identities manage claims through existence, not revocation.
    ///      The parameter is unnamed as it is not used in this implementation.
    /// @return Always returns false as claims are not revoked, only removed
    // solhint-disable-next-line use-natspec
    function isClaimRevoked(bytes calldata) external pure virtual override returns (bool) {
        return false;
    }
}
