// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.29;

import { EAS, ISchemaRegistry } from "@ethereum-attestation-service/eas-contracts/EAS.sol";

contract CustomEAS is EAS {
    constructor(ISchemaRegistry registry) EAS(registry) { }
} 