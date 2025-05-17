// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTTrustedIssuersRegistryImplementation } from
    "smart-protocol/contracts/system/trusted-issuers-registry/SMARTTrustedIssuersRegistryImplementation.sol";

contract ATKTrustedIssuersRegistryImplementation is SMARTTrustedIssuersRegistryImplementation {
    constructor(address trustedForwarder) SMARTTrustedIssuersRegistryImplementation(trustedForwarder) { }
}
