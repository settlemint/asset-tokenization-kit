// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Compliance modules
import { CountryAllowListComplianceModule } from
    "smart-protocol/contracts/compliance/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from
    "smart-protocol/contracts/compliance/CountryBlockListComplianceModule.sol";

// This is a dummy contract that imports all the dependencies of the SMART protocol, so that they get build.
contract SMARTModuleDependencies { }
