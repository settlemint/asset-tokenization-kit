// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

error Unimplemented();

/**
 * @title MockedIdentity
 * @notice Lightweight test double for an ERC-734/735 identity that records added claims so tests can verify them.
 * @dev Implements the interfaces with permissive access-control suitable for tests only.
 */
contract MockedIdentity is IIdentity {
    // -----------------------------
    // Minimal claim tracking
    // -----------------------------

    // Tracks whether a claim (issuer, topic) has been added
    mapping(bytes32 => bool) private _receivedClaims; // claimId => exists
        // Tracks count of claims per topic
    mapping(uint256 => uint256) private _topicClaimCounts; // topic => count

    // -----------------------------
    // ERC-735: Claims
    // -----------------------------

    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes calldata _signature,
        bytes calldata _data,
        string calldata _uri
    )
        external
        override
        returns (bytes32 claimRequestId)
    {
        bytes32 claimId = keccak256(abi.encode(_issuer, _topic));
        bool existed = _receivedClaims[claimId];

        if (!existed) {
            _receivedClaims[claimId] = true;
            _topicClaimCounts[_topic] += 1;
            emit ClaimAdded(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        } else {
            // Duplicate add updates metadata-only in event semantics
            emit ClaimChanged(claimId, _topic, _scheme, _issuer, _signature, _data, _uri);
        }

        return claimId;
    }

    function removeClaim(bytes32 /* _claimId */ ) external pure override returns (bool /* success */ ) {
        revert Unimplemented();
    }

    function getClaim(bytes32 /* _claimId */ )
        external
        pure
        override
        returns (
            uint256, /* topic */
            uint256, /* scheme */
            address, /* issuer */
            bytes memory, /* signature */
            bytes memory, /* data */
            string memory /* uri */
        )
    {
        revert Unimplemented();
    }

    function getClaimIdsByTopic(uint256 /* _topic */ )
        external
        pure
        override
        returns (bytes32[] memory /* claimIds */ )
    {
        revert Unimplemented();
    }

    // -----------------------------
    // IIdentity specific: claim validation helper
    // -----------------------------

    function isClaimValid(
        IIdentity _identity,
        uint256 claimTopic,
        bytes calldata, /* sig */
        bytes calldata /* data */
    )
        external
        view
        override
        returns (bool)
    {
        if (address(_identity) != address(this)) {
            return false;
        }
        // Simplified: consider any claim under the topic as valid
        return _topicClaimCounts[claimTopic] > 0;
    }

    // -----------------------------
    // ERC-734: Keys (unimplemented for this mock)
    // -----------------------------

    function addKey(
        bytes32, /* _key */
        uint256, /* _purpose */
        uint256 /* _keyType */
    )
        external
        pure
        override
        returns (bool /* success */ )
    {
        revert Unimplemented();
    }

    function approve(
        uint256,
        /* _id */
        bool /* _approve */
    )
        external
        pure
        override
        returns (bool /* success */ )
    {
        revert Unimplemented();
    }

    function removeKey(
        bytes32, /* _key */
        uint256 /* _purpose */
    )
        external
        pure
        override
        returns (bool /* success */ )
    {
        revert Unimplemented();
    }

    function execute(
        address, /* _to */
        uint256, /* _value */
        bytes calldata /* _data */
    )
        external
        payable
        override
        returns (uint256 /* executionId */ )
    {
        revert Unimplemented();
    }

    function getKey(bytes32 /* _key */ )
        external
        pure
        override
        returns (uint256[] memory, /* purposes */ uint256, /* keyType */ bytes32 /* key */ )
    {
        revert Unimplemented();
    }

    function getKeyPurposes(bytes32 /* _key */ ) external pure override returns (uint256[] memory /* _purposes */ ) {
        revert Unimplemented();
    }

    function getKeysByPurpose(uint256 /* _purpose */ ) external pure override returns (bytes32[] memory /* keys */ ) {
        revert Unimplemented();
    }

    function keyHasPurpose(
        bytes32, /* _key */
        uint256 /* _purpose */
    )
        external
        pure
        override
        returns (bool /* exists */ )
    {
        revert Unimplemented();
    }

    // -----------------------------
    // Test helpers
    // -----------------------------

    function getClaimId(address issuer, uint256 topic) external pure returns (bytes32) {
        return keccak256(abi.encode(issuer, topic));
    }

    function hasClaim(address issuer, uint256 topic) external view returns (bool) {
        bytes32 claimId = keccak256(abi.encode(issuer, topic));
        return _receivedClaims[claimId];
    }

    function claimCountByTopic(uint256 topic) external view returns (uint256) {
        return _topicClaimCounts[topic];
    }
}
