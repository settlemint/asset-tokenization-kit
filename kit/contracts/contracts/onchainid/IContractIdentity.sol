// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title IContractIdentity
/// @author SettleMint
/// @notice Interface for contract identities that can issue claims to other identities
/// @dev This interface extends the IClaimIssuer interface to add the ability to issue claims to other identities
/// @dev This interface is used to identify contract identities that can issue claims to other identities
interface IContractIdentity is IClaimIssuer {
    /// @notice Issues a claim to a subject identity on behalf of the associated contract
    /// @dev Only the associated contract can call this function to issue claims
    /// @param subject The identity contract to add the claim to
    /// @param topic The claim topic
    /// @param data The claim data
    /// @param uri The claim URI
    /// @return claimId The ID of the created claim
    function issueClaimTo(IIdentity subject, uint256 topic, bytes memory data, string memory uri)
        external
        returns (bytes32 claimId);
}
