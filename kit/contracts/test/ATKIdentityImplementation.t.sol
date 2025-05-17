// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKIdentityImplementation } from "../contracts/ATKIdentityImplementation.sol";

contract ATKIdentityImplementationTest is Test {
    ATKIdentityImplementation public atkIdentityImplementation;

    function setUp() public {
        atkIdentityImplementation = new ATKIdentityImplementation();
    }

    function testExample() public {
        assertTrue(true);
    }
}
