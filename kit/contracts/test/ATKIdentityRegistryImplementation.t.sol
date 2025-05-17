// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKIdentityRegistryImplementation } from "../contracts/ATKIdentityRegistryImplementation.sol";

contract ATKIdentityRegistryImplementationTest is Test {
    ATKIdentityRegistryImplementation public atkIdentityRegistryImplementation;

    function setUp() public {
        address trustedForwarder = address(0x1);
        atkIdentityRegistryImplementation = new ATKIdentityRegistryImplementation(trustedForwarder);
    }

    function testExample() public {
        assertTrue(true);
    }
}
