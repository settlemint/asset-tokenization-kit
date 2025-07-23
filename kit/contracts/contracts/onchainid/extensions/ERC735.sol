// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol"; // Required for addClaim's issuer
    // validation
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol"; // Required for IClaimIssuer interface
import { ERC735ClaimSchemes } from "../ERC735ClaimSchemes.sol";

/// @title ERC735 Claim Holder Standard Implementation
/// @dev Implementation of the IERC735 (Claim Holder) standard.
/// This contract manages claims issued by different entities.
contract ERC735 is IERC735 {
    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer; // The issuer of the claim
        bytes signature; // Signature of (identity_address, topic, data)
        bytes data; // The data of the claim
        string uri; // The URI of the claim (e.g., IPFS hash)
    }

    mapping(bytes32 => Claim) internal _claims; // claimId => Claim
    mapping(uint256 => bytes32[]) internal _claimsByTopic; // topic => claimId[]

    // --- Custom Errors ---
    error IssuerCannotBeZeroAddress();
    error ClaimNotValidAccordingToIssuer(address issuer, uint256 topic);
    error ClaimDoesNotExist(bytes32 claimId);
    error UnsupportedClaimScheme(uint256 scheme);
    error UnauthorizedContractClaim(address caller, address issuer);

    /// @dev See {IERC735-addClaim}.
    /// Adds or updates a claim. Emits {ClaimAdded} or {ClaimChanged}.
    /// The `_signature` is `keccak256(abi.encode(address(this), _topic, _data))` signed by the `issuer`.
    /// Claim ID is `keccak256(abi.encode(_issuer, _topic))`.
    /// Requirements:
    /// - If `issuer` is not this contract, the claim must be verifiable via `IClaimIssuer(issuer).isClaimValid(...)`.
    /// - This function should typically be restricted (e.g., by a claim key in the inheriting contract).
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        public
        virtual
        override
        returns (bytes32 claimRequestId)
    {
        if (_issuer == address(0)) {
            revert IssuerCannotBeZeroAddress();
        }

        if (_issuer != address(this)) {
            if (_scheme == ERC735ClaimSchemes.SCHEME_ECDSA) {
                require(
                    IClaimIssuer(_issuer).isClaimValid(IIdentity(address(this)), _topic, _signature, _data),
                    "Invalid ECDSA claim"
                );
            } else if (_scheme == ERC735ClaimSchemes.SCHEME_CONTRACT) {
                if (msg.sender != _issuer) {
                    revert UnauthorizedContractClaim(msg.sender, _issuer);
                }
            } else {
                revert UnsupportedClaimScheme(_scheme);
            }
        }

        bytes32 claimId = keccak256(abi.encode(_issuer, _topic));
        _claims[claimId].topic = _topic;
        _claims[claimId].scheme = _scheme;
        _claims[claimId].signature = _signature;
        _claims[claimId].data = _data;
        _claims[claimId].uri = _uri;

        if (_claims[claimId].issuer != _issuer) {
            _claimsByTopic[_topic].push(claimId);
            _claims[claimId].issuer = _issuer;

            emit ClaimAdded(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        } else {
            emit ClaimChanged(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        }
        return claimId;
    }

    /// @dev See {IERC735-removeClaim}.
    /// Removes a claim by its ID. Emits {ClaimRemoved}.
    /// Claim ID is `keccak256(abi.encode(issuer_address, topic))`.
    /// Requirements:
    /// - The `_claimId` must correspond to an existing claim.
    /// - This function should typically be restricted (e.g., by a claim key or management key in the inheriting
    /// contract,
    ///   or only allow issuer or self to remove).
    function removeClaim(bytes32 _claimId) public virtual override returns (bool success) {
        if (_claims[_claimId].issuer == address(0)) {
            revert ClaimDoesNotExist(_claimId);
        }

        uint256 _topic = _claims[_claimId].topic;
        uint256 claimIndex = 0;
        uint256 arrayLength = _claimsByTopic[_topic].length;
        while (_claimsByTopic[_topic][claimIndex] != _claimId) {
            claimIndex++;

            if (claimIndex >= arrayLength) {
                break;
            }
        }

        _claimsByTopic[_topic][claimIndex] = _claimsByTopic[_topic][arrayLength - 1];
        _claimsByTopic[_topic].pop();

        emit ClaimRemoved(
            _claimId,
            _topic,
            _claims[_claimId].scheme,
            _claims[_claimId].issuer,
            _claims[_claimId].signature,
            _claims[_claimId].data,
            _claims[_claimId].uri
        );

        delete _claims[_claimId];

        return true;
    }

    /// @dev See {IERC735-getClaim}.
    /// Retrieves a claim by its ID.
    /// Claim ID is `keccak256(abi.encode(issuer_address, topic))`.
    function getClaim(bytes32 _claimId)
        public
        view
        virtual
        override
        returns (
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes memory signature,
            bytes memory data,
            string memory uri
        )
    {
        if (_claims[_claimId].issuer == address(0)) {
            revert ClaimDoesNotExist(_claimId);
        }

        return (
            _claims[_claimId].topic,
            _claims[_claimId].scheme,
            _claims[_claimId].issuer,
            _claims[_claimId].signature,
            _claims[_claimId].data,
            _claims[_claimId].uri
        );
    }

    /// @dev See {IERC735-getClaimIdsByTopic}.
    /// Returns an array of claim IDs associated with a specific topic.
    function getClaimIdsByTopic(uint256 _topic) external view virtual override returns (bytes32[] memory claimIds) {
        return _claimsByTopic[_topic];
    }
}
