// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { Lock } from "../contracts/Lock.sol";

contract LockTest is Test {
    Lock public lock;
    uint256 public unlockTime;
    uint256 public lockedAmount = 1 ether;
    address public owner;

    function setUp() public {
        owner = address(this);
        unlockTime = block.timestamp + 1 days;
        lock = new Lock{ value: lockedAmount }(unlockTime);
    }

    function test_Constructor() public view {
        assertEq(lock.unlockTime(), unlockTime);
        assertEq(lock.owner(), owner);
        assertEq(address(lock).balance, lockedAmount);
    }

    function testFail_ConstructorPastTime() public {
        lock = new Lock(block.timestamp - 1);
    }

    function test_Withdraw() public {
        // Fast forward time
        vm.warp(unlockTime);

        uint256 preBalance = address(this).balance;
        lock.withdraw();

        assertEq(address(lock).balance, 0);
        assertEq(address(this).balance, preBalance + lockedAmount);
    }

    function testFail_WithdrawTooEarly() public {
        lock.withdraw();
    }

    function testFail_WithdrawNotOwner() public {
        vm.warp(unlockTime);
        vm.prank(address(0xdead));
        lock.withdraw();
    }

    // Required to receive ETH
    receive() external payable { }
}
