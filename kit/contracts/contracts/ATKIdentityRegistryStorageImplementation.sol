// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTIdentityRegistryStorageImplementation } from
    "smart-protocol/contracts/system/identity-registry-storage/SMARTIdentityRegistryStorageImplementation.sol";

contract ATKIdentityRegistryStorageImplementation is SMARTIdentityRegistryStorageImplementation {
    constructor(address trustedForwarder) SMARTIdentityRegistryStorageImplementation(trustedForwarder) { }
}
