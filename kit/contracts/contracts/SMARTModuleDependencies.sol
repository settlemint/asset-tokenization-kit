// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.27;

// Compliance modules
import { CountryAllowListComplianceModule } from
    "@smartprotocol/contracts/compliance/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from
    "@smartprotocol/contracts/compliance/CountryBlockListComplianceModule.sol";

// This is a dummy contract that imports all the dependencies of the SMART protocol, so that they get build.
contract SMARTModuleDependencies { }
