// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { Fund } from "../contracts/Fund.sol";

contract FundTest is Test {
    Fund public fund;
    address public owner;
    address public investor1;
    address public investor2;
    address public navManager;

    // Constants for fund setup
    string constant NAME = "Test Fund";
    string constant SYMBOL = "TFUND";
    uint8 constant DECIMALS = 18;
    string constant ISIN = "US0378331005";
    uint256 constant MANAGEMENT_FEE_BPS = 200; // 2%
    uint256 constant HURDLE_RATE_BPS = 1000; // 10%
    string constant FUND_CLASS = "Hedge Fund";
    string constant FUND_CATEGORY = "Long/Short Equity";

    // Test constants
    uint256 constant INITIAL_NAV = 1000 ether;
    uint256 constant MIN_INVESTMENT_AMOUNT = 100 ether;
    uint256 constant LARGE_INVESTMENT_AMOUNT = 1000 ether;

    event NAVUpdated(uint256 oldNAV, uint256 newNAV, uint256 timestamp);
    event InvestmentReceived(address indexed investor, uint256 amount, uint256 shares, uint256 navPerShare);
    event RedemptionProcessed(address indexed investor, uint256 shares, uint256 amount, uint256 navPerShare);
    event ManagementFeeCollected(uint256 amount, uint256 timestamp, uint256 navPerShare);
    event PerformanceFeeCollected(uint256 amount, uint256 timestamp, uint256 navPerShare);
    event HighWaterMarkUpdated(uint256 oldValue, uint256 newValue);

    function setUp() public {
        owner = makeAddr("owner");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");
        navManager = makeAddr("navManager");

        vm.startPrank(owner);
        fund = new Fund(
            NAME, SYMBOL, DECIMALS, owner, ISIN, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS, FUND_CLASS, FUND_CATEGORY
        );

        // Grant NAV manager role
        fund.grantRole(fund.NAV_MANAGER_ROLE(), navManager);
        vm.stopPrank();

        // Set initial NAV
        vm.startPrank(navManager);
        fund.updateNAV(INITIAL_NAV, 10_000);
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(fund.name(), NAME);
        assertEq(fund.symbol(), SYMBOL);
        assertEq(fund.decimals(), DECIMALS);
        assertEq(fund.isin(), ISIN);
        assertEq(fund.fundClass(), FUND_CLASS);
        assertEq(fund.fundCategory(), FUND_CATEGORY);
        assertEq(fund.currentNAV(), INITIAL_NAV);
        assertTrue(fund.hasRole(fund.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(fund.hasRole(fund.NAV_MANAGER_ROLE(), navManager));
    }

    function test_UpdateNAV() public {
        uint256 newNAV = 1100 ether;

        vm.startPrank(navManager);
        vm.expectEmit(true, true, true, true);
        emit NAVUpdated(INITIAL_NAV, newNAV, block.timestamp);
        fund.updateNAV(newNAV, 10_000);
        vm.stopPrank();

        assertEq(fund.currentNAV(), newNAV);
    }

    function test_UpdateNAV_Slippage() public {
        uint256 newNAV = 1500 ether; // 50% increase

        vm.startPrank(navManager);
        vm.expectRevert(Fund.SlippageExceeded.selector);
        fund.updateNAV(newNAV, 1000); // 10% max slippage
        vm.stopPrank();
    }

    function test_ProcessInvestment() public {
        uint256 investmentAmount = LARGE_INVESTMENT_AMOUNT;
        uint256 expectedShares = (investmentAmount * 10 ** DECIMALS) / INITIAL_NAV;

        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit InvestmentReceived(investor1, investmentAmount, expectedShares, INITIAL_NAV);
        fund.processInvestment(investor1, investmentAmount);
        vm.stopPrank();

        assertEq(fund.balanceOf(investor1), expectedShares);
    }

    function test_ProcessInvestment_TooSmall() public {
        uint256 smallAmount = MIN_INVESTMENT_AMOUNT - 1;

        vm.startPrank(owner);
        vm.expectRevert(Fund.InvestmentTooSmall.selector);
        fund.processInvestment(investor1, smallAmount);
        vm.stopPrank();
    }

    function test_ProcessRedemption() public {
        // First make an investment
        uint256 investmentAmount = LARGE_INVESTMENT_AMOUNT;
        vm.startPrank(owner);
        fund.processInvestment(investor1, investmentAmount);
        vm.stopPrank();
        uint256 shares = fund.balanceOf(investor1);

        // Wait for cooldown period
        vm.warp(block.timestamp + fund.REDEMPTION_COOLDOWN());

        // Process redemption
        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit RedemptionProcessed(investor1, shares, investmentAmount, INITIAL_NAV);
        uint256 redeemedAmount = fund.processRedemption(investor1, shares);
        vm.stopPrank();

        assertEq(redeemedAmount, investmentAmount);
        assertEq(fund.balanceOf(investor1), 0);
    }

    function test_ProcessRedemption_InsufficientCooldown() public {
        // First make an investment
        vm.startPrank(owner);
        fund.processInvestment(investor1, LARGE_INVESTMENT_AMOUNT);
        vm.stopPrank();
        uint256 shares = fund.balanceOf(investor1);

        // Try to redeem immediately
        vm.startPrank(owner);
        vm.expectRevert(Fund.InsufficientCooldown.selector);
        fund.processRedemption(investor1, shares);
        vm.stopPrank();
    }

    function test_CollectManagementFee() public {
        // Make initial investment
        vm.startPrank(owner);
        fund.processInvestment(investor1, LARGE_INVESTMENT_AMOUNT);
        vm.stopPrank();

        // Wait for one year
        vm.warp(block.timestamp + 365 days);

        // Collect management fee
        vm.startPrank(owner);
        uint256 fee = fund.collectManagementFee();
        vm.stopPrank();

        // Expected fee = AUM * fee_rate * time_elapsed / (100% * 1 year)
        uint256 expectedFee = (LARGE_INVESTMENT_AMOUNT * MANAGEMENT_FEE_BPS * 365 days) / (10_000 * 365 days);
        assertEq(fee, expectedFee);
    }

    function test_CollectPerformanceFee() public {
        // Make initial investment
        vm.startPrank(owner);
        fund.processInvestment(investor1, LARGE_INVESTMENT_AMOUNT);
        vm.stopPrank();

        // Increase NAV by 20%
        uint256 newNAV = (INITIAL_NAV * 120) / 100;
        vm.startPrank(navManager);
        fund.updateNAV(newNAV, 10_000);
        vm.stopPrank();

        // Collect performance fee
        vm.startPrank(owner);
        uint256 fee = fund.collectPerformanceFee();
        vm.stopPrank();

        // Calculate expected fee
        uint256 hurdleAmount = (INITIAL_NAV * HURDLE_RATE_BPS) / 10_000;
        uint256 hurdleNav = INITIAL_NAV + hurdleAmount;
        uint256 excessReturn = newNAV - hurdleNav;
        uint256 expectedFee = (excessReturn * 2000) / 10_000; // 20% of excess return
        assertEq(fee, expectedFee);
    }

    function test_BatchProcessInvestment() public {
        address[] memory investors = new address[](2);
        investors[0] = investor1;
        investors[1] = investor2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = LARGE_INVESTMENT_AMOUNT;
        amounts[1] = LARGE_INVESTMENT_AMOUNT;

        vm.prank(owner);
        fund.batchProcessInvestment(investors, amounts);

        assertEq(fund.balanceOf(investor1), (LARGE_INVESTMENT_AMOUNT * 10 ** DECIMALS) / INITIAL_NAV);
        assertEq(fund.balanceOf(investor2), (LARGE_INVESTMENT_AMOUNT * 10 ** DECIMALS) / INITIAL_NAV);
    }

    function test_BatchProcessRedemption() public {
        // First make investments
        address[] memory investors = new address[](2);
        investors[0] = investor1;
        investors[1] = investor2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = LARGE_INVESTMENT_AMOUNT;
        amounts[1] = LARGE_INVESTMENT_AMOUNT;

        vm.prank(owner);
        fund.batchProcessInvestment(investors, amounts);

        // Wait for cooldown
        vm.warp(block.timestamp + fund.REDEMPTION_COOLDOWN());

        // Prepare redemption arrays
        uint256[] memory shares = new uint256[](2);
        shares[0] = fund.balanceOf(investor1);
        shares[1] = fund.balanceOf(investor2);

        // Process redemptions
        vm.prank(owner);
        uint256[] memory redeemedAmounts = fund.batchProcessRedemption(investors, shares);

        assertEq(redeemedAmounts[0], LARGE_INVESTMENT_AMOUNT);
        assertEq(redeemedAmounts[1], LARGE_INVESTMENT_AMOUNT);
        assertEq(fund.balanceOf(investor1), 0);
        assertEq(fund.balanceOf(investor2), 0);
    }

    function test_SubscriptionRedemptionWindows() public {
        // Set windows
        vm.startPrank(owner);
        uint256 subStart = block.timestamp + 1 days;
        uint256 subEnd = subStart + 30 days;
        fund.setSubscriptionWindow(subStart, subEnd);

        uint256 redStart = subEnd + 1 days;
        uint256 redEnd = redStart + 30 days;
        fund.setRedemptionWindow(redStart, redEnd);

        // Set to closed-ended after windows are set
        fund.setOpenEnded(false);

        // Verify window settings
        (uint256 actualSubStart, uint256 actualSubEnd) = fund.subscriptionWindow();
        assertEq(actualSubStart, subStart, "Subscription window start mismatch");
        assertEq(actualSubEnd, subEnd, "Subscription window end mismatch");

        (uint256 actualRedStart, uint256 actualRedEnd) = fund.redemptionWindow();
        assertEq(actualRedStart, redStart, "Redemption window start mismatch");
        assertEq(actualRedEnd, redEnd, "Redemption window end mismatch");

        assertFalse(fund.isOpenEnded(), "Fund should be closed-ended");
        vm.stopPrank();

        // Try to invest outside window
        vm.prank(owner);
        vm.expectRevert(Fund.OutsideSubscriptionWindow.selector);
        fund.processInvestment(investor1, LARGE_INVESTMENT_AMOUNT);

        // Move to subscription window and invest
        vm.warp(subStart + 1 days);
        vm.prank(owner);
        fund.processInvestment(investor1, LARGE_INVESTMENT_AMOUNT);

        // Wait for cooldown period
        vm.warp(2_700_000);

        vm.startPrank(owner);
        uint256 shares = fund.balanceOf(investor1);
        vm.expectRevert(Fund.OutsideRedemptionWindow.selector);
        fund.processRedemption(investor1, shares);
        vm.stopPrank();
    }
}
