// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

interface IContractIdentity is IClaimIssuer {
    /// @notice Issues a claim to a subject identity on behalf of the associated contract
    /// @dev Only the associated contract can call this function to issue claims
    /// @param subject The identity contract to add the claim to
    /// @param topic The claim topic
    /// @param data The claim data
    function issueClaimTo(
        IIdentity subject,
        uint256 topic,
        bytes memory data,
        string memory uri
    ) external returns (bytes32 claimId);
}