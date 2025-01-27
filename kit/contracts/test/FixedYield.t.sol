// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { FixedYield } from "../contracts/FixedYield.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";
import { ERC20YieldMock } from "./mocks/ERC20YieldMock.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FixedYieldTest is Test {
    // Constants for test configuration
    uint256 constant INITIAL_SUPPLY = 1_000_000; // 1M tokens
    uint256 constant YIELD_RATE = 500; // 5% yield rate in basis points
    uint256 constant INTERVAL = 30 days; // 30-day yield periods
    uint256 constant YIELD_BASIS = 1e18; // 1.0 yield basis
    uint8 public constant DECIMALS = 2;

    // Test contracts
    FixedYield public yieldSchedule;
    ERC20YieldMock public token;
    ERC20Mock public underlyingAsset;

    // Test accounts
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    // Timestamps
    uint256 public startDate;
    uint256 public endDate;

    /// @notice Helper function to convert a readable amount to the correct decimals
    /// @param amount The amount to convert (e.g., 100.50 should be passed as 10050)
    /// @return The amount with the correct number of decimals
    function toDecimals(uint256 amount) internal view returns (uint256) {
        return amount * 10 ** DECIMALS;
    }

    function setUp() public {
        // Setup initial state
        vm.warp(1 days); // Start at a non-zero timestamp
        startDate = block.timestamp + 1 days;
        endDate = startDate + 365 days;

        // Deploy mock underlying asset
        underlyingAsset = new ERC20Mock("Underlying Token", "ULT", DECIMALS);
        underlyingAsset.mint(owner, toDecimals(INITIAL_SUPPLY * 2)); // Double for yield payments

        // Deploy token with yield capability
        vm.startPrank(owner);
        token = new ERC20YieldMock("My Token", "MYT", toDecimals(INITIAL_SUPPLY), address(underlyingAsset), YIELD_BASIS);

        // Deploy yield schedule
        yieldSchedule = new FixedYield(address(token), owner, startDate, endDate, YIELD_RATE, INTERVAL);

        // Top up yield schedule with underlying assets
        underlyingAsset.approve(address(yieldSchedule), toDecimals(INITIAL_SUPPLY));
        yieldSchedule.topUpUnderlyingAsset(toDecimals(INITIAL_SUPPLY));
        vm.stopPrank();
    }

    // Core Functionality Tests //

    function test_InitialState() public {
        assertEq(address(yieldSchedule.token()), address(token));
        assertEq(address(yieldSchedule.underlyingAsset()), address(underlyingAsset));
        assertEq(yieldSchedule.startDate(), startDate);
        assertEq(yieldSchedule.endDate(), endDate);
        assertEq(yieldSchedule.rate(), YIELD_RATE);
        assertEq(yieldSchedule.interval(), INTERVAL);
    }

    function test_YieldCalculationFlow() public {
        // Transfer some tokens to user1
        uint256 userBalance = 10_000; // 100.00 tokens
        vm.prank(owner);
        token.transfer(user1, toDecimals(userBalance));

        // Move to start of schedule
        vm.warp(startDate);
        assertEq(yieldSchedule.currentPeriod(), 1, "Should be in first period");
        assertEq(yieldSchedule.lastCompletedPeriod(), 0, "Should be 0");

        // Complete first period and set historical balance
        vm.warp(startDate + INTERVAL);
        token.setHistoricalBalance(user1, startDate + INTERVAL, toDecimals(userBalance));
        assertEq(yieldSchedule.lastCompletedPeriod(), 1, "First period should be complete");

        // Calculate expected yield
        uint256 expectedYield = (toDecimals(userBalance) * YIELD_BASIS * YIELD_RATE) / yieldSchedule.RATE_BASIS_POINTS();
        uint256 calculatedYield = yieldSchedule.calculateAccruedYield(user1);
        assertEq(calculatedYield, expectedYield, "Yield calculation mismatch");

        // Claim yield
        vm.prank(user1);
        yieldSchedule.claimYield();

        // Verify claimed amount
        assertEq(underlyingAsset.balanceOf(user1), expectedYield, "Claimed yield amount mismatch");
        assertEq(yieldSchedule.lastClaimedPeriod(user1), 1, "Last claimed period should be updated");
    }

    function test_MultiPeriodYieldFlow() public {
        // Setup: Transfer tokens to both users
        vm.startPrank(owner);
        token.transfer(user1, toDecimals(10_000)); // 100.00 tokens
        token.transfer(user2, toDecimals(20_000)); // 200.00 tokens
        vm.stopPrank();

        // Move through multiple periods
        vm.warp(startDate);
        vm.warp(block.timestamp + INTERVAL * 3); // Move 3 periods forward

        // Set historical balances for all periods
        uint256[] memory periodEnds = yieldSchedule.allPeriods();
        for (uint256 i = 0; i < 3; i++) {
            token.setHistoricalBalance(user1, periodEnds[i], toDecimals(10_000));
            token.setHistoricalBalance(user2, periodEnds[i], toDecimals(20_000));
        }

        // User1 claims after 3 periods
        uint256 expectedYield1 = (toDecimals(10_000) * YIELD_BASIS * YIELD_RATE * 3) / yieldSchedule.RATE_BASIS_POINTS();
        vm.prank(user1);
        yieldSchedule.claimYield();
        assertEq(underlyingAsset.balanceOf(user1), expectedYield1, "User1 yield mismatch");

        // User2 claims after same period
        uint256 expectedYield2 = (toDecimals(20_000) * YIELD_BASIS * YIELD_RATE * 3) / yieldSchedule.RATE_BASIS_POINTS();
        vm.prank(user2);
        yieldSchedule.claimYield();
        assertEq(underlyingAsset.balanceOf(user2), expectedYield2, "User2 yield mismatch");
    }

    function test_YieldAcrossAllPeriods() public {
        // Setup initial balance
        vm.prank(owner);
        token.transfer(user1, toDecimals(10_000)); // 100.00 tokens

        // Get all period end timestamps
        uint256[] memory periodEnds = yieldSchedule.allPeriods();

        // Set historical balances for all periods
        for (uint256 i = 0; i < periodEnds.length; i++) {
            token.setHistoricalBalance(user1, periodEnds[i], toDecimals(10_000));
        }

        // Move to end of schedule
        vm.warp(endDate);

        // Calculate expected yield for all periods
        uint256 totalPeriods = periodEnds.length;
        uint256 expectedYield =
            (toDecimals(10_000) * YIELD_BASIS * YIELD_RATE * totalPeriods) / yieldSchedule.RATE_BASIS_POINTS();

        // Claim yield
        vm.prank(user1);
        yieldSchedule.claimYield();

        // Verify total claimed amount
        assertEq(underlyingAsset.balanceOf(user1), expectedYield, "Total yield mismatch");
        assertEq(yieldSchedule.lastClaimedPeriod(user1), totalPeriods, "Last claimed period should be final period");
    }

    // Edge Cases and Validation Tests //

    function test_RevertBeforeStart() public {
        vm.warp(startDate - 1);
        vm.expectRevert(FixedYield.NoYieldAvailable.selector);
        vm.prank(user1);
        yieldSchedule.claimYield();
    }

    function test_RevertAfterEnd() public {
        vm.warp(endDate + 1);
        vm.expectRevert(FixedYield.ScheduleExpired.selector);
        vm.prank(user1);
        yieldSchedule.calculateAccruedYield();
    }

    function test_ZeroBalanceNoYield() public {
        vm.warp(startDate + INTERVAL);
        vm.expectRevert(FixedYield.NoYieldAvailable.selector);
        vm.prank(user2);
        yieldSchedule.claimYield();
    }

    function test_PartialPeriodYield() public {
        // Transfer tokens to user
        vm.prank(owner);
        token.transfer(user1, toDecimals(10_000)); // 100.00 tokens

        // Move halfway through a period
        vm.warp(startDate + (INTERVAL / 2));

        // Calculate accrued yield
        uint256 expectedPartialYield = (toDecimals(10_000) * YIELD_BASIS * YIELD_RATE * (INTERVAL / 2))
            / (INTERVAL * yieldSchedule.RATE_BASIS_POINTS());
        uint256 calculatedYield = yieldSchedule.calculateAccruedYield(user1);
        assertEq(calculatedYield, expectedPartialYield, "Partial period yield calculation mismatch");
    }

    function test_TransferDuringPeriod() public {
        // Initial transfer to user1
        vm.prank(owner);
        token.transfer(user1, toDecimals(10_000)); // 100.00 tokens

        // Start period
        vm.warp(startDate);

        // Transfer halfway through period to user2
        uint256 halfwayPoint = startDate + (INTERVAL / 2);
        vm.warp(halfwayPoint);
        vm.prank(user1);
        token.transfer(user2, toDecimals(10_000));

        // Complete period and set historical balances
        vm.warp(startDate + INTERVAL);
        token.setHistoricalBalance(user1, halfwayPoint, toDecimals(10_000));
        token.setHistoricalBalance(user2, halfwayPoint, 0);
        token.setHistoricalBalance(user1, startDate + INTERVAL, 0);
        token.setHistoricalBalance(user2, startDate + INTERVAL, toDecimals(10_000));

        // Verify yields
        uint256 user1Yield = yieldSchedule.calculateAccruedYield(user1);
        uint256 user2Yield = yieldSchedule.calculateAccruedYield(user2);

        // User1 should have yield for first half, User2 for second half
        assertGt(user1Yield, 0, "User1 should have some yield");
        assertGt(user2Yield, 0, "User2 should have some yield");
        assertApproxEqRel(user1Yield, user2Yield, 0.01e18, "Yields should be approximately equal");
    }

    function test_WithdrawUnderlyingAsset() public {
        uint256 withdrawAmount = 10_000; // 100.00 tokens

        vm.prank(owner);
        yieldSchedule.withdrawUnderlyingAsset(owner, toDecimals(withdrawAmount));

        assertEq(
            underlyingAsset.balanceOf(address(yieldSchedule)),
            toDecimals(INITIAL_SUPPLY - withdrawAmount),
            "Incorrect remaining balance"
        );
    }

    function test_RevertInvalidWithdraw() public {
        vm.startPrank(owner);

        // Try to withdraw zero
        vm.expectRevert(FixedYield.InvalidAmount.selector);
        yieldSchedule.withdrawUnderlyingAsset(owner, 0);

        // Try to withdraw more than balance
        vm.expectRevert(FixedYield.InsufficientUnderlyingBalance.selector);
        yieldSchedule.withdrawUnderlyingAsset(owner, toDecimals(INITIAL_SUPPLY + 1));

        vm.stopPrank();
    }

    function test_AllPeriods() public {
        uint256[] memory timestamps = yieldSchedule.allPeriods();

        // Calculate expected number of periods
        uint256 expectedPeriods = ((endDate - startDate) / INTERVAL) + 1;
        assertEq(timestamps.length, expectedPeriods, "Incorrect number of periods");

        // Verify each period end timestamp
        for (uint256 i = 0; i < timestamps.length; i++) {
            uint256 expectedTimestamp = startDate + ((i + 1) * INTERVAL);
            // Last period should be capped at endDate
            if (expectedTimestamp > endDate) {
                expectedTimestamp = endDate;
            }
            assertEq(
                timestamps[i], expectedTimestamp, string.concat("Incorrect timestamp for period ", vm.toString(i + 1))
            );
        }

        // Verify last timestamp doesn't exceed end date
        assertLe(timestamps[timestamps.length - 1], endDate, "Last period exceeds end date");
    }
}
