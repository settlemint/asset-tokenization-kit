// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKTokenIdentityImplementation } from "../contracts/ATKTokenIdentityImplementation.sol";

contract ATKTokenIdentityImplementationTest is Test {
    ATKTokenIdentityImplementation public atkTokenIdentityImplementation;

    function setUp() public {
        atkTokenIdentityImplementation = new ATKTokenIdentityImplementation();
    }

    function testExample() public {
        assertTrue(true);
    }
}
