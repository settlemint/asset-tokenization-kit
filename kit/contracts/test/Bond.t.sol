// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { Bond } from "../contracts/Bond.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";

contract BondTest is Test {
    Bond public bond;
    ERC20Mock public underlyingAsset;
    address public owner;
    address public user1;
    address public user2;
    address public spender;
    uint256 public initialSupply;
    uint256 public faceValue;
    uint256 public maturityDate;

    uint8 public constant DECIMALS = 2;

    // Utility functions for decimal conversions
    function toDecimals(uint256 amount) internal pure returns (uint256) {
        return amount * 10 ** DECIMALS;
    }

    function fromDecimals(uint256 amount) internal pure returns (uint256) {
        return amount / 10 ** DECIMALS;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event BondMatured(uint256 timestamp);
    event UnderlyingAssetTopUp(address indexed from, uint256 amount);
    event BondRedeemed(address indexed holder, uint256 bondAmount, uint256 underlyingAmount);
    event UnderlyingAssetWithdrawn(address indexed to, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");
        maturityDate = block.timestamp + 365 days;

        // Initialize supply and face value using toDecimals
        initialSupply = toDecimals(100); // 100.00 bonds
        faceValue = toDecimals(100); // 100.00 underlying tokens per bond

        // Deploy mock underlying asset with same decimals
        underlyingAsset = new ERC20Mock("Mock USD", "MUSD", DECIMALS);
        underlyingAsset.mint(owner, initialSupply * faceValue); // Mint enough for all bonds

        vm.startPrank(owner);
        bond = new Bond("Test Bond", "TBOND", DECIMALS, owner, maturityDate, faceValue, address(underlyingAsset));
        bond.mint(owner, initialSupply);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public {
        assertEq(bond.name(), "Test Bond");
        assertEq(bond.symbol(), "TBOND");
        assertEq(bond.decimals(), DECIMALS);
        assertEq(bond.totalSupply(), initialSupply);
        assertEq(bond.balanceOf(owner), initialSupply);
        assertEq(bond.maturityDate(), maturityDate);
        assertEq(bond.faceValue(), faceValue);
        assertEq(address(bond.underlyingAsset()), address(underlyingAsset));
        assertFalse(bond.isMatured());
        assertTrue(bond.hasRole(bond.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(bond.hasRole(bond.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(bond.hasRole(bond.USER_MANAGEMENT_ROLE(), owner));
        assertTrue(bond.hasRole(bond.FINANCIAL_MANAGEMENT_ROLE(), owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.prank(owner);
            Bond newBond = new Bond(
                "Test Bond", "TBOND", decimalValues[i], owner, maturityDate, faceValue, address(underlyingAsset)
            );
            assertEq(newBond.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Bond.InvalidDecimals.selector, 19));
        new Bond("Test Bond", "TBOND", 19, owner, maturityDate, faceValue, address(underlyingAsset));
        vm.stopPrank();
    }

    function test_Transfer() public {
        uint256 amount = toDecimals(10); // 10.00 bonds
        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.balanceOf(user1), amount);
        assertEq(bond.balanceOf(owner), initialSupply - amount);
    }

    function test_TransferFrom() public {
        uint256 amount = toDecimals(10); // 10.00 bonds

        // Check initial state
        assertEq(bond.balanceOf(owner), initialSupply, "Initial balance incorrect");
        assertEq(bond.frozen(owner), 0, "Should not have frozen tokens");

        vm.startPrank(owner);
        bond.approve(user1, amount);
        vm.stopPrank();

        vm.prank(user1);
        bond.transferFrom(owner, user2, amount);

        assertEq(bond.balanceOf(user2), amount);
        assertEq(bond.balanceOf(owner), initialSupply - amount);
    }

    // Role-based access control tests
    function test_OnlySupplyManagementCanMint() public {
        vm.prank(owner);
        bond.mint(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, bond.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        bond.mint(user1, 100e18);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        bond.grantRole(bond.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertTrue(bond.hasRole(bond.SUPPLY_MANAGEMENT_ROLE(), user1));

        bond.revokeRole(bond.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertFalse(bond.hasRole(bond.SUPPLY_MANAGEMENT_ROLE(), user1));
        vm.stopPrank();
    }

    // Pausable functionality tests
    function test_PauseUnpause() public {
        vm.startPrank(owner);
        bond.pause();
        assertTrue(bond.paused());

        vm.expectRevert();
        bond.transfer(user1, toDecimals(10)); // 10.00 bonds

        bond.unpause();
        assertFalse(bond.paused());

        bond.transfer(user1, toDecimals(10)); // 10.00 bonds
        assertEq(bond.balanceOf(user1), toDecimals(10));
        vm.stopPrank();
    }

    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, bond.DEFAULT_ADMIN_ROLE()
            )
        );
        bond.pause();
        vm.stopPrank();
        vm.prank(owner);
        bond.pause();
        assertTrue(bond.paused());
    }

    // Burnable functionality tests
    function test_Burn() public {
        uint256 burnAmount = toDecimals(10); // 10.00 bonds
        vm.prank(owner);
        bond.burn(burnAmount);

        assertEq(bond.totalSupply(), initialSupply - burnAmount);
        assertEq(bond.balanceOf(owner), initialSupply - burnAmount);
    }

    function test_BurnFrom() public {
        uint256 burnAmount = toDecimals(10); // 10.00 bonds
        vm.prank(owner);
        bond.approve(user1, burnAmount);

        vm.prank(user1);
        bond.burnFrom(owner, burnAmount);

        assertEq(bond.totalSupply(), initialSupply - burnAmount);
        assertEq(bond.balanceOf(owner), initialSupply - burnAmount);
    }

    // Blocklist functionality tests
    function test_OnlyUserManagementCanBlock() public {
        vm.startPrank(owner);
        bond.blockUser(user1);
        assertTrue(bond.blocked(user1));

        vm.expectRevert();
        bond.transfer(user1, toDecimals(10)); // 10.00 bonds

        bond.unblockUser(user1);
        assertFalse(bond.blocked(user1));

        bond.transfer(user1, toDecimals(10)); // 10.00 bonds
        assertEq(bond.balanceOf(user1), toDecimals(10));
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, bond.USER_MANAGEMENT_ROLE()
            )
        );
        bond.blockUser(user1);
        vm.stopPrank();
    }

    // ERC20Custodian tests
    function test_CustodianFunctionality() public {
        vm.startPrank(owner);
        bond.mint(user1, 100);

        // Freeze all tokens
        bond.freeze(user1, 100);
        assertEq(bond.frozen(user1), 100);

        // Try to transfer the frozen amount
        vm.expectRevert();
        vm.prank(user1);
        bond.transfer(user2, 100);

        // Unfreeze and verify
        bond.unfreeze(user1, 100);
        assertEq(bond.frozen(user1), 0);

        // Now transfer should work
        vm.prank(user1);
        bond.transfer(user2, 100);
        assertEq(bond.balanceOf(user2), 100);
    }

    // Maturity functionality tests
    function test_OnlySupplyManagementCanMature() public {
        vm.warp(maturityDate + 1);

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, bond.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        bond.mature();
        vm.stopPrank();
        vm.prank(owner);
        bond.mature();
        assertTrue(bond.isMatured());

        vm.expectRevert();
        vm.prank(owner);
        bond.transfer(user1, 100e18);
    }

    function test_CannotMatureBeforeMaturityDate() public {
        vm.prank(owner);
        vm.expectRevert();
        bond.mature();
    }

    function test_CannotMatureTwice() public {
        vm.warp(maturityDate + 1);

        // Add sufficient underlying assets first
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), initialSupply * faceValue);
        bond.topUpUnderlyingAsset(initialSupply * faceValue);

        bond.mature();
        vm.expectRevert(Bond.BondAlreadyMatured.selector);
        bond.mature();
        vm.stopPrank();
    }

    function test_CannotMatureWithoutSufficientUnderlying() public {
        vm.warp(maturityDate + 1);

        // Try to mature without any underlying assets
        vm.startPrank(owner);
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.mature();

        // Add some underlying assets, but not enough
        uint256 partialAmount = (initialSupply * faceValue) / 2;
        underlyingAsset.approve(address(bond), partialAmount);
        bond.topUpUnderlyingAsset(partialAmount);

        // Try to mature with insufficient underlying assets
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.mature();

        // Add remaining required underlying assets
        uint256 remainingAmount = (initialSupply * faceValue) - partialAmount;
        underlyingAsset.approve(address(bond), remainingAmount);
        bond.topUpUnderlyingAsset(remainingAmount);

        // Now maturity should succeed
        bond.mature();
        assertTrue(bond.isMatured());
        vm.stopPrank();
    }

    function test_CannotWithdrawBelowRequiredReserve() public {
        uint256 requiredAmount = initialSupply * faceValue;
        uint256 excessAmount = toDecimals(50); // 50.00 extra tokens
        uint256 totalAmount = requiredAmount + excessAmount;

        // Top up with required amount plus excess
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), totalAmount);
        bond.topUpUnderlyingAsset(totalAmount);

        // Mature the bond
        vm.warp(maturityDate + 1);
        bond.mature();

        // Try to withdraw more than excess
        uint256 tooMuchWithdraw = excessAmount + toDecimals(1);
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.withdrawUnderlyingAsset(owner, tooMuchWithdraw);

        // Should be able to withdraw exactly the excess amount
        bond.withdrawUnderlyingAsset(owner, excessAmount);

        // Try to withdraw any remaining amount
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.withdrawUnderlyingAsset(owner, 1);
        vm.stopPrank();

        // Verify final state
        assertEq(bond.underlyingAssetBalance(), requiredAmount);
    }

    function test_WithdrawReserveAfterPartialRedemption() public {
        // Setup: Add required underlying assets
        uint256 requiredAmount = initialSupply * faceValue;
        uint256 excessAmount = toDecimals(50);
        uint256 totalAmount = requiredAmount + excessAmount;

        vm.startPrank(owner);
        underlyingAsset.mint(owner, totalAmount); // Mint additional tokens
        underlyingAsset.approve(address(bond), totalAmount);
        bond.topUpUnderlyingAsset(totalAmount);

        // Transfer some bonds to user1
        uint256 user1Bonds = toDecimals(10);
        bond.transfer(user1, user1Bonds);

        // Mature the bond
        vm.warp(maturityDate + 1);
        bond.mature();
        vm.stopPrank();

        // User1 redeems their bonds
        vm.prank(user1);
        bond.redeem(user1Bonds);

        // Calculate new required reserve after redemption
        uint256 remainingBonds = initialSupply - user1Bonds;
        uint256 newRequiredReserve = remainingBonds * faceValue;

        // Owner should be able to withdraw excess plus freed up reserve
        vm.startPrank(owner);
        bond.withdrawExcessUnderlyingAssets(owner);

        // Verify final state
        assertEq(bond.underlyingAssetBalance(), newRequiredReserve);
        vm.stopPrank();
    }

    function test_WithdrawableAmount() public {
        // Initially no withdrawable amount
        assertEq(bond.withdrawableUnderlyingAmount(), 0);

        uint256 requiredAmount = initialSupply * faceValue;
        uint256 excessAmount = toDecimals(50);
        uint256 totalAmount = requiredAmount + excessAmount;

        // Top up with excess
        vm.startPrank(owner);
        underlyingAsset.mint(owner, totalAmount); // Mint additional tokens
        underlyingAsset.approve(address(bond), totalAmount);
        bond.topUpUnderlyingAsset(totalAmount);

        // Verify withdrawable amount equals excess
        assertEq(bond.withdrawableUnderlyingAmount(), excessAmount);
        vm.stopPrank();
    }

    function test_RedeemBonds() public {
        // Setup: Add required underlying assets
        uint256 requiredAmount = initialSupply * faceValue;
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), requiredAmount);
        bond.topUpUnderlyingAsset(requiredAmount);

        // Transfer some bonds to user1
        uint256 user1Bonds = toDecimals(10);
        bond.transfer(user1, user1Bonds);

        // Mature the bond
        vm.warp(maturityDate + 1);
        bond.mature();
        vm.stopPrank();

        // User1 redeems their bonds
        vm.startPrank(user1);
        uint256 expectedUnderlyingAmount = user1Bonds * faceValue;
        bond.redeem(user1Bonds);

        // Verify redemption
        assertEq(bond.balanceOf(user1), 0);
        assertEq(underlyingAsset.balanceOf(user1), expectedUnderlyingAmount);
        vm.stopPrank();
    }

    // Tests for underlying asset management
    function test_TopUpUnderlyingAsset() public {
        uint256 topUpAmount = toDecimals(100);

        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), topUpAmount);

        vm.expectEmit(true, false, false, true);
        emit UnderlyingAssetTopUp(owner, topUpAmount);
        bond.topUpUnderlyingAsset(topUpAmount);
        vm.stopPrank();

        assertEq(bond.underlyingAssetBalance(), topUpAmount);
    }

    function test_CannotTopUpZeroAmount() public {
        vm.startPrank(owner);
        vm.expectRevert(Bond.InvalidAmount.selector);
        bond.topUpUnderlyingAsset(0);
        vm.stopPrank();
    }

    function test_WithdrawUnderlyingAsset() public {
        uint256 topUpAmount = toDecimals(200); // 200.00 underlying tokens
        uint256 withdrawAmount = toDecimals(50); // 50.00 underlying tokens

        // Top up first
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), topUpAmount);
        bond.topUpUnderlyingAsset(topUpAmount);

        // Withdraw partial amount
        bond.withdrawUnderlyingAsset(owner, withdrawAmount);
        vm.stopPrank();

        assertEq(bond.underlyingAssetBalance(), topUpAmount - withdrawAmount);
        assertEq(underlyingAsset.balanceOf(owner), initialSupply * faceValue - topUpAmount + withdrawAmount);
    }

    function test_CannotWithdrawZeroAmount() public {
        vm.startPrank(owner);
        vm.expectRevert(Bond.InvalidAmount.selector);
        bond.withdrawUnderlyingAsset(owner, 0);
        vm.stopPrank();
    }

    function test_WithdrawExcessUnderlyingAssets() public {
        uint256 requiredAmount = initialSupply * faceValue;
        uint256 excessAmount = toDecimals(50); // 50 extra tokens
        uint256 totalAmount = requiredAmount + excessAmount;

        // Top up with excess amount
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), totalAmount);
        bond.topUpUnderlyingAsset(totalAmount);

        // Verify withdrawable amount
        assertEq(bond.withdrawableUnderlyingAmount(), excessAmount);

        // Withdraw excess
        bond.withdrawExcessUnderlyingAssets(owner);
        vm.stopPrank();

        // Verify state after withdrawal
        assertEq(bond.underlyingAssetBalance(), requiredAmount);
        assertEq(underlyingAsset.balanceOf(owner), initialSupply - requiredAmount);
    }

    function test_CannotWithdrawWithoutExcess() public {
        uint256 neededAmount = toDecimals(100); // Exact amount needed for bonds

        // Top up with exact amount needed
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), neededAmount);
        bond.topUpUnderlyingAsset(neededAmount);

        // Try to withdraw excess when there is none
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.withdrawExcessUnderlyingAssets(owner);
        vm.stopPrank();
    }
}
