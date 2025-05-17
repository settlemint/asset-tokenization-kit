// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTComplianceImplementation } from
    "smart-protocol/contracts/system/compliance/SMARTComplianceImplementation.sol";

contract ATKComplianceImplementation is SMARTComplianceImplementation {
    constructor(address trustedForwarder) SMARTComplianceImplementation(trustedForwarder) { }
}
