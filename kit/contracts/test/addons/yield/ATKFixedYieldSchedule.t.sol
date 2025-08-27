// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ISMARTFixedYieldSchedule } from
    "../../../contracts/smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { ATKFixedYieldScheduleUpgradeable } from "../../../contracts/addons/yield/ATKFixedYieldScheduleUpgradeable.sol";

contract MockATKToken is MockedERC20Token {
    mapping(address => uint256) private _yieldBasisPerUnit;
    mapping(uint256 => uint256) private _totalSupplyAtTimestamp;
    mapping(address => mapping(uint256 => uint256)) private _balanceOfAt;
    IERC20 private _yieldTokenAddress;

    uint256 private constant DEFAULT_YIELD_BASIS = 1000;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address yieldTokenAddr
    )
        MockedERC20Token(name, symbol, decimals)
    {
        _yieldTokenAddress = IERC20(yieldTokenAddr);
    }

    function setYieldBasisPerUnit(address holder, uint256 basis) external {
        _yieldBasisPerUnit[holder] = basis;
    }

    function yieldBasisPerUnit(address holder) external view returns (uint256) {
        return _yieldBasisPerUnit[holder] > 0 ? _yieldBasisPerUnit[holder] : DEFAULT_YIELD_BASIS;
    }

    function yieldToken() external view returns (IERC20) {
        return _yieldTokenAddress;
    }

    function setTotalSupplyAt(uint256 timestamp, uint256 supply) external {
        _totalSupplyAtTimestamp[timestamp] = supply;
    }

    function totalSupplyAt(uint256 timestamp) external view returns (uint256) {
        return _totalSupplyAtTimestamp[timestamp] > 0 ? _totalSupplyAtTimestamp[timestamp] : this.totalSupply();
    }

    function setBalanceOfAt(address holder, uint256 timestamp, uint256 balance) external {
        _balanceOfAt[holder][timestamp] = balance;
    }

    function balanceOfAt(address holder, uint256 timestamp) external view returns (uint256) {
        return _balanceOfAt[holder][timestamp] > 0 ? _balanceOfAt[holder][timestamp] : this.balanceOf(holder);
    }
}

contract ATKFixedYieldScheduleTest is Test {
    ATKFixedYieldScheduleUpgradeable public yieldSchedule;
    MockATKToken public atkToken;
    MockedERC20Token public denominationToken;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public forwarder = address(0x4);

    uint256 public constant INITIAL_SUPPLY = 1_000_000e18;
    uint256 public constant START_DATE_OFFSET = 1 days;
    uint256 public constant END_DATE_OFFSET = 10 days;
    uint256 public constant INTERVAL = 1 days;
    uint256 public constant RATE = 500; // 5%

    uint256 public startDate;
    uint256 public endDate;

    function setUp() public {
        startDate = block.timestamp + START_DATE_OFFSET;
        endDate = block.timestamp + END_DATE_OFFSET;

        // Deploy denomination token
        denominationToken = new MockedERC20Token("Denomination", "DNMTN", 6);

        // Deploy mock SMART token
        atkToken = new MockATKToken("ATK Token", "ATK", 18, address(denominationToken));

        // Deploy yield schedule directly (bypassing factory for simplicity)
        yieldSchedule = new ATKFixedYieldScheduleUpgradeable(forwarder);

        // Initialize the contract
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = owner;

        yieldSchedule.initialize(address(atkToken), startDate, endDate, RATE, INTERVAL, initialAdmins);

        // Setup tokens
        denominationToken.mint(address(this), INITIAL_SUPPLY);
        denominationToken.mint(user1, INITIAL_SUPPLY);
        denominationToken.mint(user2, INITIAL_SUPPLY);

        atkToken.mint(user1, 1000e18);
        atkToken.mint(user2, 500e18);

        // Setup historical data
        atkToken.setTotalSupplyAt(startDate + 1 days, 1500e18);
        atkToken.setBalanceOfAt(user1, startDate + 1 days, 1000e18);
        atkToken.setBalanceOfAt(user2, startDate + 1 days, 500e18);

        // Grant necessary roles to owner for testing
        vm.startPrank(owner);
        yieldSchedule.grantRole(yieldSchedule.SUPPLY_MANAGEMENT_ROLE(), owner);
        yieldSchedule.grantRole(yieldSchedule.EMERGENCY_ROLE(), owner);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(address(yieldSchedule.token()), address(atkToken));
        assertEq(address(yieldSchedule.denominationAsset()), address(denominationToken));
        assertEq(yieldSchedule.startDate(), startDate);
        assertEq(yieldSchedule.endDate(), endDate);
        assertEq(yieldSchedule.rate(), RATE);
        assertEq(yieldSchedule.interval(), INTERVAL);
    }

    function test_PeriodCalculations() public {
        // Before start
        assertEq(yieldSchedule.currentPeriod(), 0);
        assertEq(yieldSchedule.lastCompletedPeriod(), 0);

        // Move to start date
        vm.warp(startDate);
        assertEq(yieldSchedule.currentPeriod(), 1);
        assertEq(yieldSchedule.lastCompletedPeriod(), 0);

        // Move to first period end
        vm.warp(startDate + INTERVAL);
        assertEq(yieldSchedule.currentPeriod(), 2);
        assertEq(yieldSchedule.lastCompletedPeriod(), 1);

        // Move to end date
        vm.warp(endDate);
        uint256 totalPeriods = ((endDate - startDate) / INTERVAL) + 1;
        assertEq(yieldSchedule.currentPeriod(), totalPeriods);
        assertEq(yieldSchedule.lastCompletedPeriod(), totalPeriods);
    }

    function test_PeriodEndTimestamps() public view {
        uint256[] memory periods = yieldSchedule.allPeriods();
        assertTrue(periods.length > 0);

        // Check first period end
        assertEq(yieldSchedule.periodEnd(1), startDate + INTERVAL);

        // Check last period doesn't exceed end date
        uint256 lastPeriod = periods.length;
        assertTrue(yieldSchedule.periodEnd(lastPeriod) <= endDate);
    }

    function test_TimeUntilNextPeriod() public {
        // Before start
        assertEq(yieldSchedule.timeUntilNextPeriod(), startDate - block.timestamp);

        // At start
        vm.warp(startDate);
        assertEq(yieldSchedule.timeUntilNextPeriod(), INTERVAL);

        // Halfway through first period
        vm.warp(startDate + INTERVAL / 2);
        assertEq(yieldSchedule.timeUntilNextPeriod(), INTERVAL / 2);

        // After end
        vm.warp(endDate + 1);
        assertEq(yieldSchedule.timeUntilNextPeriod(), 0);
    }

    function test_YieldCalculations() public {
        // Move to after first period
        vm.warp(startDate + INTERVAL + 1);

        // Calculate expected yield for completed periods: balance * basis * rate / RATE_BASIS_POINTS
        uint256 completedPeriodYieldUser1 = (1000e18 * 1000 * 500) / 10_000; // 50e18 for period 1
        uint256 completedPeriodYieldUser2 = (500e18 * 1000 * 500) / 10_000; // 25e18 for period 1

        // Calculate pro-rata yield for current period (we're 1 second into period 2)
        // Pro-rata: (balance * basis * rate * timeInPeriod) / (interval * RATE_BASIS_POINTS)
        uint256 timeInCurrentPeriod = 1; // 1 second into the new period
        uint256 currentPeriodYieldUser1 = (1000e18 * 1000 * 500 * timeInCurrentPeriod) / (INTERVAL * 10_000);
        uint256 currentPeriodYieldUser2 = (500e18 * 1000 * 500 * timeInCurrentPeriod) / (INTERVAL * 10_000);

        // Convert to denomination asset amounts (divide by token decimals)
        uint256 tokenDecimals = atkToken.decimals();
        uint256 expectedYieldUser1 = (completedPeriodYieldUser1 + currentPeriodYieldUser1) / (10 ** tokenDecimals);
        uint256 expectedYieldUser2 = (completedPeriodYieldUser2 + currentPeriodYieldUser2) / (10 ** tokenDecimals);

        uint256 yieldForUser1 = yieldSchedule.calculateAccruedYield(user1);
        uint256 yieldForUser2 = yieldSchedule.calculateAccruedYield(user2);

        // Debug the calculation
        console.log("Expected User1:", expectedYieldUser1);
        console.log("Actual User1:  ", yieldForUser1);
        console.log(
            "Difference:    ",
            yieldForUser1 > expectedYieldUser1 ? yieldForUser1 - expectedYieldUser1 : expectedYieldUser1 - yieldForUser1
        );

        assertEq(yieldForUser1, expectedYieldUser1);
        assertEq(yieldForUser2, expectedYieldUser2);

        // Verify relative amounts
        assertTrue(yieldForUser1 > yieldForUser2); // user1 has more tokens
    }

    function test_YieldCalculations_DifferentBasis() public {
        // Set different basis for users
        atkToken.setYieldBasisPerUnit(user1, 2000); // 200% basis
        atkToken.setYieldBasisPerUnit(user2, 500); // 50% basis

        vm.warp(startDate + INTERVAL + 1);

        // Calculate expected yields with different basis for completed period
        uint256 completedYieldUser1 = (1000e18 * 2000 * 500) / 10_000; // 100e18
        uint256 completedYieldUser2 = (500e18 * 500 * 500) / 10_000; // 12.5e18

        // Calculate pro-rata for current period (1 second into period 2)
        uint256 timeInCurrentPeriod = 1;
        uint256 currentYieldUser1 = (1000e18 * 2000 * 500 * timeInCurrentPeriod) / (INTERVAL * 10_000);
        uint256 currentYieldUser2 = (500e18 * 500 * 500 * timeInCurrentPeriod) / (INTERVAL * 10_000);

        // Convert to denomination asset amounts (divide by token decimals)
        uint256 tokenDecimals = atkToken.decimals();
        uint256 expectedYieldUser1 = (completedYieldUser1 + currentYieldUser1) / (10 ** tokenDecimals);
        uint256 expectedYieldUser2 = (completedYieldUser2 + currentYieldUser2) / (10 ** tokenDecimals);

        uint256 yieldUser1 = yieldSchedule.calculateAccruedYield(user1);
        uint256 yieldUser2 = yieldSchedule.calculateAccruedYield(user2);

        // Debug the calculation
        console.log("Expected User1:", expectedYieldUser1);
        console.log("Actual User1:  ", yieldUser1);
        console.log(
            "Difference:    ",
            yieldUser1 > expectedYieldUser1 ? yieldUser1 - expectedYieldUser1 : expectedYieldUser1 - yieldUser1
        );

        assertEq(yieldUser1, expectedYieldUser1);
        assertEq(yieldUser2, expectedYieldUser2);
    }

    function test_YieldCalculations_MultipleClaimsAcrossPeriods() public {
        // Fund the contract
        uint256 fundAmount = 100_000e18;
        bool success = denominationToken.transfer(address(yieldSchedule), fundAmount);
        assertTrue(success, "Transfer failed");

        uint256 initialBalance = denominationToken.balanceOf(user1);

        // Move to after first period and claim
        vm.warp(startDate + INTERVAL + 1);
        vm.prank(user1);
        yieldSchedule.claimYield();

        uint256 balanceAfterFirstClaim = denominationToken.balanceOf(user1);
        uint256 firstClaimAmount = balanceAfterFirstClaim - initialBalance;
        uint256 expectedFirstClaim = ((1000e18 * 1000 * 500) / 10_000) / (10 ** atkToken.decimals()); // Convert from
            // token units to denomination asset units
        assertEq(firstClaimAmount, expectedFirstClaim);

        // Move to after second period and claim again
        vm.warp(startDate + (2 * INTERVAL) + 1);
        vm.prank(user1);
        yieldSchedule.claimYield();

        uint256 balanceAfterSecondClaim = denominationToken.balanceOf(user1);
        uint256 secondClaimAmount = balanceAfterSecondClaim - balanceAfterFirstClaim;
        assertEq(secondClaimAmount, expectedFirstClaim); // Same amount for second period

        // Total claimed should be 2x the period amount
        assertEq(balanceAfterSecondClaim - initialBalance, expectedFirstClaim * 2);
        assertEq(yieldSchedule.lastClaimedPeriod(user1), 2);
    }

    function test_YieldCalculations_ChangingBalances() public {
        // Set initial historical balances for first period
        atkToken.setBalanceOfAt(user1, startDate + INTERVAL, 1000e18);
        atkToken.setBalanceOfAt(user2, startDate + INTERVAL, 500e18);

        // Set different balances for second period (simulate balance changes)
        atkToken.setBalanceOfAt(user1, startDate + (2 * INTERVAL), 2000e18); // Doubled
        atkToken.setBalanceOfAt(user2, startDate + (2 * INTERVAL), 250e18); // Halved

        // Also need to update current balances for pro-rata calculation
        // Current balances: user1: 1000e18, user2: 500e18 (from setUp)
        // Target balances: user1: 1250e18, user2: 250e18
        vm.prank(user2);
        bool success = atkToken.transfer(user1, 250e18); // user1: 1250e18, user2: 250e18
        assertTrue(success, "Transfer failed");

        // Update total supply accordingly
        atkToken.setTotalSupplyAt(startDate + (2 * INTERVAL), 1500e18); // Keep total same

        // Move to after second period
        vm.warp(startDate + (2 * INTERVAL) + 1);

        uint256 actualYieldUser1 = yieldSchedule.calculateAccruedYield(user1);
        uint256 actualYieldUser2 = yieldSchedule.calculateAccruedYield(user2);

        // Verify yields are positive
        assertTrue(actualYieldUser1 > 0);
        assertTrue(actualYieldUser2 > 0);

        // Verify yield ratios reflect the balance changes
        // Period 1: user1 had 2x user2's balance (1000 vs 500)
        // Period 2: user1 had 8x user2's balance (2000 vs 250)
        // Current: user1 has 5x user2's balance (1250 vs 250)
        // So user1's total yield should be much higher than user2's
        assertTrue(actualYieldUser1 > actualYieldUser2 * 3);

        // Verify that the yield calculation is working as expected by checking components
        // At minimum, both should have earned yield from 2 completed periods (converted to denomination asset units)
        uint256 tokenDecimals = atkToken.decimals();
        uint256 minExpectedUser1 = (50e18 + 100e18) / (10 ** tokenDecimals); // Period 1 + Period 2 completed yields
        uint256 minExpectedUser2 = (25e18 + 12.5e18) / (10 ** tokenDecimals); // Period 1 + Period 2 completed yields

        assertTrue(actualYieldUser1 >= minExpectedUser1);
        assertTrue(actualYieldUser2 >= minExpectedUser2);
    }

    function test_YieldCalculations_ZeroBalance() public {
        // Check user2's initial balance
        uint256 user2Balance = atkToken.balanceOf(user2);

        // Set user2 balance to zero for the completed period
        atkToken.setBalanceOfAt(user2, startDate + INTERVAL, 0);

        // Transfer user2's tokens away to make current balance 0
        vm.prank(user2);
        assertTrue(atkToken.transfer(user1, user2Balance), "Transfer failed");

        vm.warp(startDate + INTERVAL + 1);

        uint256 yieldUser1 = yieldSchedule.calculateAccruedYield(user1);
        uint256 yieldUser2 = yieldSchedule.calculateAccruedYield(user2);

        // user1 should still get yield (including current period pro-rata)
        assertTrue(yieldUser1 > 0);
        // user2 should get no yield due to zero balance in completed period and current balance
        assertEq(yieldUser2, 0);
    }

    function test_YieldCalculations_BeforeScheduleStarts() public {
        // Before start date, no yield should be calculated
        vm.warp(startDate - 1);

        vm.expectRevert(ISMARTFixedYieldSchedule.ScheduleNotActive.selector);
        yieldSchedule.calculateAccruedYield(user1);
    }

    function test_YieldCalculations_AfterScheduleEnds() public {
        // Move to after end date
        vm.warp(endDate + 1 days);

        // Should still be able to calculate yield for completed periods
        uint256 yieldUser1 = yieldSchedule.calculateAccruedYield(user1);
        assertTrue(yieldUser1 > 0);
    }

    function test_TopUpDenominationAsset() public {
        uint256 topUpAmount = 1000e18;

        vm.startPrank(user1);
        denominationToken.approve(address(yieldSchedule), topUpAmount);

        vm.expectEmit(true, false, false, true);
        emit ISMARTFixedYieldSchedule.DenominationAssetTopUp(user1, topUpAmount);

        yieldSchedule.topUpDenominationAsset(topUpAmount);
        vm.stopPrank();

        assertEq(denominationToken.balanceOf(address(yieldSchedule)), topUpAmount);
    }

    function test_ClaimYield() public {
        // Setup: Fund the contract and move to after first period
        uint256 fundAmount = 100_000e18;
        bool success = denominationToken.transfer(address(yieldSchedule), fundAmount);
        assertTrue(success, "Transfer failed");
        vm.warp(startDate + INTERVAL + 1);

        uint256 initialBalance = denominationToken.balanceOf(user1);

        // Calculate yield for completed periods only (what claimYield actually pays)
        uint256 lastCompleted = yieldSchedule.lastCompletedPeriod();
        uint256 basis = atkToken.yieldBasisPerUnit(user1);
        uint256 expectedClaimAmount = 0;

        for (uint256 period = 1; period <= lastCompleted; period++) {
            uint256 balance = atkToken.balanceOfAt(user1, yieldSchedule.periodEnd(period));
            if (balance > 0) {
                expectedClaimAmount += (balance * basis * 500) / 10_000; // rate = 500, RATE_BASIS_POINTS = 10000
            }
        }

        // Convert to denomination asset amount by dividing by token decimals
        expectedClaimAmount = expectedClaimAmount / (10 ** atkToken.decimals());

        vm.prank(user1);
        yieldSchedule.claimYield();

        uint256 actualBalance = denominationToken.balanceOf(user1);
        uint256 expectedBalance = initialBalance + expectedClaimAmount;

        assertEq(actualBalance, expectedBalance);
        assertEq(yieldSchedule.lastClaimedPeriod(user1), lastCompleted);
    }

    function test_ClaimYield_NoYieldAvailable() public {
        // Try to claim before any periods complete
        vm.prank(user1);
        vm.expectRevert(ISMARTFixedYieldSchedule.NoYieldAvailable.selector);
        yieldSchedule.claimYield();
    }

    function test_WithdrawDenominationAsset() public {
        uint256 withdrawAmount = 1000e18;
        bool success = denominationToken.transfer(address(yieldSchedule), withdrawAmount);
        assertTrue(success, "Transfer failed");

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit ISMARTFixedYieldSchedule.DenominationAssetWithdrawn(user1, withdrawAmount);

        yieldSchedule.withdrawDenominationAsset(user1, withdrawAmount);

        assertEq(denominationToken.balanceOf(user1), INITIAL_SUPPLY + withdrawAmount);
    }

    function test_WithdrawDenominationAsset_OnlyAdmin() public {
        vm.prank(user1);
        vm.expectRevert();
        yieldSchedule.withdrawDenominationAsset(user1, 1000e18);
    }

    function test_WithdrawAllDenominationAsset() public {
        uint256 depositAmount = 1000e18;
        bool success = denominationToken.transfer(address(yieldSchedule), depositAmount);
        assertTrue(success, "Transfer failed");

        vm.prank(owner);
        yieldSchedule.withdrawAllDenominationAsset(user1);

        assertEq(denominationToken.balanceOf(address(yieldSchedule)), 0);
        assertEq(denominationToken.balanceOf(user1), INITIAL_SUPPLY + depositAmount);
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        yieldSchedule.pause();

        // Should revert when paused
        vm.prank(user1);
        vm.expectRevert();
        yieldSchedule.topUpDenominationAsset(1000e18);

        vm.prank(owner);
        yieldSchedule.unpause();

        // Should work after unpause
        vm.startPrank(user1);
        denominationToken.approve(address(yieldSchedule), 1000e18);
        yieldSchedule.topUpDenominationAsset(1000e18);
        vm.stopPrank();
    }

    function test_TotalYieldForNextPeriod() public {
        uint256 totalYield = yieldSchedule.totalYieldForNextPeriod();
        assertTrue(totalYield > 0);

        // After end date should be 0
        vm.warp(endDate + 1);
        assertEq(yieldSchedule.totalYieldForNextPeriod(), 0);
    }

    function test_TotalUnclaimedYield() public {
        // Before any periods complete
        assertEq(yieldSchedule.totalUnclaimedYield(), 0);

        // After first period
        vm.warp(startDate + INTERVAL + 1);
        uint256 unclaimed = yieldSchedule.totalUnclaimedYield();
        assertTrue(unclaimed > 0);
    }

    function test_InvalidConstructorParameters() public {
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = owner;

        // Invalid start date (in the past)
        ATKFixedYieldScheduleUpgradeable invalidSchedule1 = new ATKFixedYieldScheduleUpgradeable(forwarder);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidStartDate.selector);
        invalidSchedule1.initialize(address(atkToken), block.timestamp - 1, endDate, RATE, INTERVAL, initialAdmins);

        // Invalid end date (before start)
        ATKFixedYieldScheduleUpgradeable invalidSchedule2 = new ATKFixedYieldScheduleUpgradeable(forwarder);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidEndDate.selector);
        invalidSchedule2.initialize(address(atkToken), startDate, startDate - 1, RATE, INTERVAL, initialAdmins);

        // Invalid rate (zero)
        ATKFixedYieldScheduleUpgradeable invalidSchedule3 = new ATKFixedYieldScheduleUpgradeable(forwarder);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidRate.selector);
        invalidSchedule3.initialize(address(atkToken), startDate, endDate, 0, INTERVAL, initialAdmins);

        // Invalid interval (zero)
        ATKFixedYieldScheduleUpgradeable invalidSchedule4 = new ATKFixedYieldScheduleUpgradeable(forwarder);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidInterval.selector);
        invalidSchedule4.initialize(address(atkToken), startDate, endDate, RATE, 0, initialAdmins);
    }

    function test_InvalidPeriod() public {
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidPeriod.selector);
        yieldSchedule.periodEnd(0);

        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidPeriod.selector);
        yieldSchedule.periodEnd(1000);
    }

    function test_ScheduleNotActive() public {
        vm.expectRevert(ISMARTFixedYieldSchedule.ScheduleNotActive.selector);
        yieldSchedule.calculateAccruedYield(user1);
    }

    function test_WithdrawInvalidAmount() public {
        vm.prank(owner);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidAmount.selector);
        yieldSchedule.withdrawDenominationAsset(user1, 0);
    }

    function test_WithdrawToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(ISMARTFixedYieldSchedule.InvalidDenominationAsset.selector);
        yieldSchedule.withdrawDenominationAsset(address(0), 1000e18);
    }

    function test_InsufficientDenominationBalance() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTFixedYieldSchedule.InsufficientDenominationAssetBalance.selector, 0, 1000e18)
        );
        yieldSchedule.withdrawDenominationAsset(user1, 1000e18);
    }
}
