// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTIdentityFactoryImplementation } from
    "smart-protocol/contracts/system/identity-factory/SMARTIdentityFactoryImplementation.sol";

contract ATKIdentityFactoryImplementation is SMARTIdentityFactoryImplementation {
    constructor(address trustedForwarder) SMARTIdentityFactoryImplementation(trustedForwarder) { }
}
