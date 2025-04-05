// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IClaimIssuer } from "../../../onchainid/interface/IClaimIssuer.sol";

contract TIRStorage {
    /// @dev Array containing all TrustedIssuers identity contract address.
    IClaimIssuer[] internal _trustedIssuers;

    /// @dev Mapping between a trusted issuer address and its corresponding claimTopics.
    mapping(address => uint256[]) internal _trustedIssuerClaimTopics;

    /// @dev Mapping between a claim topic and the allowed trusted issuers for it.
    mapping(uint256 => IClaimIssuer[]) internal _claimTopicsToTrustedIssuers;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[49] private __gap;
}
