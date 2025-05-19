// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTIdentityRegistryImplementation } from
    "smart-protocol/contracts/system/identity-registry/SMARTIdentityRegistryImplementation.sol";

contract ATKIdentityRegistryImplementation is SMARTIdentityRegistryImplementation {
    constructor(address trustedForwarder) SMARTIdentityRegistryImplementation(trustedForwarder) { }
}
