// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Identity } from "@onchainid/contracts/Identity.sol";

contract SMARTIdentity is Identity {
    constructor(address initialManagementKey, bool _isLibrary) Identity(initialManagementKey, _isLibrary) { }
}
