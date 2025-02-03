// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { Fund } from "../contracts/Fund.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error ERC20Blocked(address account);

contract FundTest is Test {
    Fund public fund;
    address public owner;
    address public investor1;
    address public investor2;

    // Constants for fund setup
    string constant NAME = "Test Fund";
    string constant SYMBOL = "TFUND";
    uint8 constant DECIMALS = 18;
    string constant ISIN = "US0378331005";
    uint16 constant MANAGEMENT_FEE_BPS = 200; // 2%
    string constant FUND_CLASS = "Hedge Fund";
    string constant FUND_CATEGORY = "Long/Short Equity";

    // Test constants
    uint256 constant INITIAL_SUPPLY = 1000 ether;
    uint256 constant INVESTMENT_AMOUNT = 100 ether;

    event ManagementFeeCollected(uint256 amount, uint256 timestamp);
    event PerformanceFeeCollected(uint256 amount, uint256 timestamp);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        vm.startPrank(owner);
        fund = new Fund(NAME, SYMBOL, DECIMALS, owner, ISIN, MANAGEMENT_FEE_BPS, FUND_CLASS, FUND_CATEGORY);

        // Initial supply for testing
        fund.mint(address(fund), INITIAL_SUPPLY);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(fund.name(), NAME);
        assertEq(fund.symbol(), SYMBOL);
        assertEq(fund.decimals(), DECIMALS);
        assertEq(fund.isin(), ISIN);
        assertEq(fund.fundClass(), FUND_CLASS);
        assertEq(fund.fundCategory(), FUND_CATEGORY);
        assertTrue(fund.hasRole(fund.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(fund.hasRole(fund.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(fund.hasRole(fund.USER_MANAGEMENT_ROLE(), owner));
    }

    function test_Mint() public {
        vm.startPrank(owner);
        fund.mint(investor1, INVESTMENT_AMOUNT);
        vm.stopPrank();

        assertEq(fund.balanceOf(investor1), INVESTMENT_AMOUNT);
    }

    function test_BlockUnblockUser() public {
        uint256 amount = INVESTMENT_AMOUNT;
        vm.startPrank(owner);
        fund.mint(investor1, amount);
        vm.stopPrank();

        // Test that non-authorized user can't block
        vm.startPrank(investor2);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", investor2, fund.USER_MANAGEMENT_ROLE()
            )
        );
        fund.blockUser(investor1);
        vm.stopPrank();

        // Test successful blocking by owner
        vm.startPrank(owner);
        fund.blockUser(investor1);
        vm.stopPrank();
        assertTrue(fund.blocked(investor1));

        // Test that blocked user can't transfer
        vm.startPrank(investor1);
        vm.expectRevert(abi.encodeWithSignature("ERC20Blocked(address)", investor1));
        fund.transfer(investor2, amount / 2);
        vm.stopPrank();

        // Test unblocking and subsequent transfer
        vm.startPrank(owner);
        fund.unblockUser(investor1);
        vm.stopPrank();

        vm.startPrank(investor1);
        fund.transfer(investor2, amount / 2);
        vm.stopPrank();

        assertEq(fund.balanceOf(investor2), amount / 2);
    }

    function test_CollectManagementFee() public {
        // Wait for one year
        vm.warp(block.timestamp + 365 days);

        uint256 initialOwnerBalance = fund.balanceOf(owner);

        vm.startPrank(owner);
        uint256 fee = fund.collectManagementFee();
        vm.stopPrank();

        // Expected fee = AUM * fee_rate * time_elapsed / (100% * 1 year)
        uint256 expectedFee = (INITIAL_SUPPLY * MANAGEMENT_FEE_BPS * 365 days) / (10_000 * 365 days);
        assertEq(fee, expectedFee);
        assertEq(fund.balanceOf(owner) - initialOwnerBalance, expectedFee);
    }

    function test_WithdrawToken() public {
        address mockToken = makeAddr("mockToken");
        uint256 withdrawAmount = 100 ether;

        // Setup mock token
        vm.mockCall(
            mockToken, abi.encodeWithSelector(IERC20.balanceOf.selector, address(fund)), abi.encode(withdrawAmount)
        );
        vm.mockCall(
            mockToken, abi.encodeWithSelector(IERC20.transfer.selector, investor1, withdrawAmount), abi.encode(true)
        );

        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit TokenWithdrawn(mockToken, investor1, withdrawAmount);
        fund.withdrawToken(mockToken, investor1, withdrawAmount);
        vm.stopPrank();
    }

    function test_PauseUnpause() public {
        vm.startPrank(owner);

        // Mint some tokens first
        fund.mint(owner, INVESTMENT_AMOUNT);

        // Pause the contract
        fund.pause();
        assertTrue(fund.paused());

        // Try to transfer while paused - should revert with EnforcedPause error
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        fund.transfer(investor1, INVESTMENT_AMOUNT);

        // Unpause
        fund.unpause();
        assertFalse(fund.paused());

        // Transfer should now succeed
        fund.transfer(investor1, INVESTMENT_AMOUNT);
        assertEq(fund.balanceOf(investor1), INVESTMENT_AMOUNT);

        vm.stopPrank();
    }
}
