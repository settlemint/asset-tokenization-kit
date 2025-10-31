// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SMARTYieldBaseTest } from "./SMARTYieldBaseTest.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMARTYield } from "../../../contracts/smart/extensions/yield/ISMARTYield.sol";
import {
    ISMARTFixedYieldSchedule
} from "../../../contracts/smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";

/// @title Integration tests for SMART Yield with other extensions
/// @notice Tests yield functionality with historical balances, compliance, and financial calculations
abstract contract SMARTYieldIntegrationTest is SMARTYieldBaseTest {
    // --- Fixed Yield Schedule Integration Tests ---

    function test_Yield_FixedScheduleIntegration() public {
        _setUpYieldTest();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        // Set yield schedule
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Verify schedule properties
        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        assertEq(schedule.startDate(), futureStartDate, "Schedule start date should match");
        assertEq(address(schedule.token()), address(token), "Schedule token should reference our token");
        assertEq(
            address(schedule.denominationAsset()),
            yieldPaymentToken,
            "Schedule denomination asset should match yield token"
        );
        assertEq(schedule.rate(), YIELD_RATE, "Schedule rate should match configured rate");
        assertEq(schedule.interval(), PERIOD_INTERVAL, "Schedule interval should match configured interval");
    }

    function test_Yield_SchedulePeriodCalculations() public {
        _setUpYieldTest();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Before schedule starts
        assertEq(schedule.currentPeriod(), 0, "Current period should be 0 before start");
        assertEq(schedule.lastCompletedPeriod(), 0, "Last completed period should be 0 before start");

        // Move to start date
        vm.warp(futureStartDate);

        assertEq(schedule.currentPeriod(), 1, "Current period should be 1 at start");
        assertEq(schedule.lastCompletedPeriod(), 0, "Last completed period should still be 0 at start");

        // Move to end of first period
        vm.warp(futureStartDate + PERIOD_INTERVAL);

        assertEq(schedule.currentPeriod(), 2, "Current period should be 2 after first period");
        assertEq(schedule.lastCompletedPeriod(), 1, "Last completed period should be 1 after first period");
    }

    function test_Yield_ScheduleTimeCalculations() public {
        _setUpYieldTest();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Check time until next period before start
        uint256 timeUntilNext = schedule.timeUntilNextPeriod();
        assertApproxEqAbs(timeUntilNext, 1 days, 5, "Time until next period should be approximately 1 day");

        // Move to middle of first period
        vm.warp(futureStartDate + PERIOD_INTERVAL / 2);

        timeUntilNext = schedule.timeUntilNextPeriod();
        assertApproxEqAbs(
            timeUntilNext, PERIOD_INTERVAL / 2, 5, "Time until next period should be approximately half the interval"
        );
    }

    // --- Financial Calculation Tests ---

    function test_Yield_BasicYieldCalculation() public {
        _setUpYieldTest();

        // Ensure block number is aligned before minting
        _ensureBlockAlignment();
        _mintInitialBalances();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Fund the schedule
        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, 1_000_000 ether);

        // Move to exactly when first period completes
        _advanceTimeAndBlock(futureStartDate + PERIOD_INTERVAL);

        // Advance one more second to ensure the period end timestamp is in the past for balanceOfAt
        vm.warp(block.timestamp + 1);
        vm.roll(block.number + 1);

        // Calculate expected yield for clientBE (for one complete period)
        uint256 balance = token.balanceOf(clientBE);
        uint256 tokenDecimals = token.decimals();
        uint256 expectedYield = ((balance * DEFAULT_YIELD_BASIS * YIELD_RATE) / 10_000) / (10 ** tokenDecimals); // YIELD_RATE
            // is in basis points
        uint256 calculatedYield = schedule.calculateAccruedYield(clientBE);

        // Allow for small rounding differences due to pro-rata calculation (1 second of extra yield)
        assertApproxEqAbs(calculatedYield, expectedYield, 1e6, "Calculated yield should match expected yield");
    }

    function test_Yield_ZeroBalanceYieldCalculation() public {
        _setUpYieldTest();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Move to after first period completes (clientUnverified has zero balance)
        _advanceTimeAndBlock(futureStartDate + PERIOD_INTERVAL + 1);

        uint256 calculatedYield = schedule.calculateAccruedYield(clientUnverified);
        assertEq(calculatedYield, 0, "Yield for zero balance should be zero");
    }

    // --- Yield Claiming Tests ---

    function test_Yield_ClaimYield_Success() public {
        _setUpYieldTest();

        // Ensure block number is aligned before minting
        _ensureBlockAlignment();
        _mintInitialBalances();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Fund the schedule
        uint256 fundAmount = 1_000_000 ether;
        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, fundAmount);

        // Move to after first period completes
        _advanceTimeAndBlock(futureStartDate + PERIOD_INTERVAL + 1);

        uint256 initialYieldBalance = IERC20(yieldPaymentToken).balanceOf(clientBE);

        // Calculate expected yield for one complete period (not including pro-rata)
        uint256 balance = token.balanceOf(clientBE);
        uint256 expectedYield = ((balance * DEFAULT_YIELD_BASIS * YIELD_RATE) / 10_000) / (10 ** token.decimals());

        // Claim yield
        vm.prank(clientBE);
        schedule.claimYield();

        uint256 finalYieldBalance = IERC20(yieldPaymentToken).balanceOf(clientBE);

        assertEq(finalYieldBalance - initialYieldBalance, expectedYield, "Claimed yield should match calculated yield");
        assertEq(schedule.lastClaimedPeriod(clientBE), 1, "Last claimed period should be updated");
    }

    function test_Yield_ClaimYield_MultiplePeriods() public {
        _setUpYieldTest();

        // Ensure block number is aligned before minting
        _ensureBlockAlignment();
        _mintInitialBalances();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Fund the schedule
        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, 1_000_000 ether);

        // Move to after two periods complete
        _advanceTimeAndBlock(futureStartDate + (PERIOD_INTERVAL * 2) + 1);

        uint256 initialYieldBalance = IERC20(yieldPaymentToken).balanceOf(clientBE);

        // Calculate expected yield for two complete periods (not including pro-rata)
        uint256 balance = token.balanceOf(clientBE);
        uint256 expectedYield = ((balance * DEFAULT_YIELD_BASIS * YIELD_RATE * 2) / 10_000) / (10 ** token.decimals());

        // Claim yield
        vm.prank(clientBE);
        schedule.claimYield();

        uint256 finalYieldBalance = IERC20(yieldPaymentToken).balanceOf(clientBE);

        assertEq(
            finalYieldBalance - initialYieldBalance,
            expectedYield,
            "Claimed yield should match calculated yield for multiple periods"
        );
        assertEq(schedule.lastClaimedPeriod(clientBE), 2, "Last claimed period should be updated to 2");
    }

    // --- Administrative Function Tests ---

    function test_Yield_FundSchedule_Success() public {
        _setUpYieldTest();

        address scheduleAddress = _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer);
        uint256 fundAmount = 100_000 ether;

        uint256 initialScheduleBalance = IERC20(yieldPaymentToken).balanceOf(scheduleAddress);

        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, fundAmount);

        uint256 finalScheduleBalance = IERC20(yieldPaymentToken).balanceOf(scheduleAddress);

        assertEq(finalScheduleBalance - initialScheduleBalance, fundAmount, "Schedule should receive funding");
    }

    function test_Yield_WithdrawFromSchedule_Success() public {
        _setUpYieldTest();

        address scheduleAddress = _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer);
        uint256 fundAmount = 100_000 ether;
        uint256 withdrawAmount = 50_000 ether;

        // Fund first
        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, fundAmount);

        uint256 initialTokenIssuerBalance = IERC20(yieldPaymentToken).balanceOf(tokenIssuer);

        // Withdraw
        vm.prank(tokenIssuer);
        ISMARTFixedYieldSchedule(scheduleAddress).withdrawDenominationAsset(tokenIssuer, withdrawAmount);

        uint256 finalTokenIssuerBalance = IERC20(yieldPaymentToken).balanceOf(tokenIssuer);

        assertEq(
            finalTokenIssuerBalance - initialTokenIssuerBalance,
            withdrawAmount,
            "Withdrawal should transfer correct amount"
        );
    }

    // --- Additional Integration Tests ---

    function test_Yield_ScheduleEndDate_Calculation() public {
        _setUpYieldTest();

        uint256 startDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, startDate);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        uint256 expectedEndDate = startDate + SCHEDULE_DURATION;
        assertEq(schedule.endDate(), expectedEndDate, "End date should be calculated correctly");
    }

    function test_Yield_PeriodBoundaries() public {
        _setUpYieldTest();

        uint256 startDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, startDate);

        ISMARTFixedYieldSchedule schedule = ISMARTFixedYieldSchedule(scheduleAddress);

        // Check period boundaries
        uint256 firstPeriodEnd = schedule.periodEnd(1);
        uint256 secondPeriodEnd = schedule.periodEnd(2);

        assertEq(firstPeriodEnd, startDate + PERIOD_INTERVAL, "First period end should be start + interval");
        assertEq(secondPeriodEnd, startDate + (PERIOD_INTERVAL * 2), "Second period end should be start + 2*interval");
    }

    // --- Integration Tests with Other Extensions ---

    function test_Yield_WithHistoricalBalances() public {
        _setUpYieldTest();

        // Ensure block number is aligned before minting
        _ensureBlockAlignment();
        _mintInitialBalances();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Move to start and verify historical balance integration
        vm.warp(futureStartDate);

        // Roll forward a block to ensure historical balance is available
        vm.roll(block.number + 1);

        uint256 currentBalance = token.balanceOf(clientBE);
        uint256 historicalBalance = ISMARTYield(address(token)).balanceOfAt(clientBE, block.number - 1);

        assertEq(
            currentBalance, historicalBalance, "Historical balance should match current balance for yield calculations"
        );
    }

    function test_Yield_WithCompliance() public {
        _setUpYieldTest();

        // Ensure block number is aligned before minting
        _ensureBlockAlignment();
        _mintInitialBalances();

        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Fund the schedule
        _fundYieldSchedule(scheduleAddress, yieldPaymentToken, platformAdmin, 1_000_000 ether);

        // Move to after first period
        _advanceTimeAndBlock(futureStartDate + PERIOD_INTERVAL + 1);

        // Verify compliance is still enforced for yield claims
        // (This test verifies that yield functionality doesn't bypass existing compliance)
        assertTrue(
            systemUtils.identityRegistry().isVerified(clientBE, _topicsToExpressionNodes(requiredClaimTopics)),
            "Client should be verified for yield claims"
        );

        vm.prank(clientBE);
        ISMARTFixedYieldSchedule(scheduleAddress).claimYield();

        // Yield claim should succeed for verified client
        assertTrue(
            ISMARTFixedYieldSchedule(scheduleAddress).lastClaimedPeriod(clientBE) > 0,
            "Verified client should be able to claim yield"
        );
    }
}
