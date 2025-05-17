// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKIdentityFactoryImplementation } from "../contracts/ATKIdentityFactoryImplementation.sol";

contract ATKIdentityFactoryImplementationTest is Test {
    ATKIdentityFactoryImplementation public atkIdentityFactoryImplementation;

    function setUp() public {
        address trustedForwarder = address(0x1);
        atkIdentityFactoryImplementation = new ATKIdentityFactoryImplementation(trustedForwarder);
    }

    function testExample() public {
        assertTrue(true);
    }
}
