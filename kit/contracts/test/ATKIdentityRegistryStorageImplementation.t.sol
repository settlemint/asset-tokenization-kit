// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKIdentityRegistryStorageImplementation } from "../contracts/ATKIdentityRegistryStorageImplementation.sol";

contract ATKIdentityRegistryStorageImplementationTest is Test {
    ATKIdentityRegistryStorageImplementation public atkIdentityRegistryStorageImplementation;

    function setUp() public {
        address trustedForwarder = address(0x1);
        atkIdentityRegistryStorageImplementation = new ATKIdentityRegistryStorageImplementation(trustedForwarder);
    }

    function testExample() public {
        assertTrue(true);
    }
}
