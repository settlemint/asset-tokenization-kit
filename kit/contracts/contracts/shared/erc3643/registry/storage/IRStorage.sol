// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IClaimTopicsRegistry } from "../interface/IClaimTopicsRegistry.sol";
import { ITrustedIssuersRegistry } from "../interface/ITrustedIssuersRegistry.sol";
import { IIdentityRegistryStorage } from "../interface/IIdentityRegistryStorage.sol";

contract IRStorage {
    /// @dev Address of the ClaimTopicsRegistry Contract
    IClaimTopicsRegistry internal _tokenTopicsRegistry;

    /// @dev Address of the TrustedIssuersRegistry Contract
    ITrustedIssuersRegistry internal _tokenIssuersRegistry;

    /// @dev Address of the IdentityRegistryStorage Contract
    IIdentityRegistryStorage internal _tokenIdentityStorage;

    /// @dev disables the whole eligibility check system
    bool internal _checksDisabled;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[48] private __gap;
}
