// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKComplianceImplementation } from "../contracts/ATKComplianceImplementation.sol";

contract ATKComplianceImplementationTest is Test {
    ATKComplianceImplementation public atkComplianceImplementation;

    function setUp() public {
        address trustedForwarder = address(0x1);
        atkComplianceImplementation = new ATKComplianceImplementation(trustedForwarder);
    }

    function testExample() public {
        assertTrue(true);
    }
}
