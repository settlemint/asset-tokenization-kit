// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { EAS as BaseEAS, ISchemaRegistry } from "@ethereum-attestation-service/eas-contracts/EAS.sol";

contract EAS is BaseEAS {
    constructor(ISchemaRegistry registry) BaseEAS(registry) { }
}