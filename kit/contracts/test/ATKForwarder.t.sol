// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKForwarder } from "../contracts/ATKForwarder.sol";

contract ATKForwarderTest is Test {
    ATKForwarder public atkForwarder;

    function setUp() public {
        atkForwarder = new ATKForwarder();
    }

    function testExample() public {
        assertTrue(true);
    }
}
