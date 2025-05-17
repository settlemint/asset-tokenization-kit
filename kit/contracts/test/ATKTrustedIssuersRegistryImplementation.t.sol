// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKTrustedIssuersRegistryImplementation } from "../contracts/ATKTrustedIssuersRegistryImplementation.sol";

contract ATKTrustedIssuersRegistryImplementationTest is Test {
    ATKTrustedIssuersRegistryImplementation public atkTrustedIssuersRegistryImplementation;

    function setUp() public {
        address trustedForwarder = address(0x1);
        atkTrustedIssuersRegistryImplementation = new ATKTrustedIssuersRegistryImplementation(trustedForwarder);
    }

    function testExample() public {
        assertTrue(true);
    }
}
