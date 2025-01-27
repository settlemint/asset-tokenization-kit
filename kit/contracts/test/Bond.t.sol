// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

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
    uint256 public initialUnderlyingSupply;
    uint256 public maturityDate;

    uint8 public constant WHOLE_INITIAL_SUPPLY = 100;
    uint8 public constant WHOLE_FACE_FALUE = 100;
    uint8 public constant DECIMALS = 2;
    string public constant VALID_ISIN = "US0378331005";

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
        initialSupply = toDecimals(WHOLE_INITIAL_SUPPLY); // 100.00 bonds
        faceValue = toDecimals(WHOLE_FACE_FALUE); // 100.00 underlying tokens per bond
        initialUnderlyingSupply = initialSupply * faceValue / (10 ** DECIMALS);

        // Deploy mock underlying asset with same decimals
        underlyingAsset = new ERC20Mock("Mock USD", "MUSD", DECIMALS);
        underlyingAsset.mint(owner, initialUnderlyingSupply); // Mint enough for all bonds

        vm.startPrank(owner);
        bond = new Bond(
            "Test Bond", "TBOND", DECIMALS, owner, VALID_ISIN, maturityDate, faceValue, address(underlyingAsset)
        );
        bond.mint(owner, initialSupply);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(bond.name(), "Test Bond");
        assertEq(bond.symbol(), "TBOND");
        assertEq(bond.decimals(), DECIMALS);
        assertEq(bond.totalSupply(), initialSupply);
        assertEq(bond.balanceOf(owner), initialSupply);
        assertEq(bond.maturityDate(), maturityDate);
        assertEq(bond.faceValue(), faceValue);
        assertEq(address(bond.underlyingAsset()), address(underlyingAsset));
        assertEq(bond.isin(), VALID_ISIN);
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
                "Test Bond",
                "TBOND",
                decimalValues[i],
                owner,
                VALID_ISIN,
                maturityDate,
                faceValue,
                address(underlyingAsset)
            );
            assertEq(newBond.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Bond.InvalidDecimals.selector, 19));
        new Bond("Test Bond", "TBOND", 19, owner, VALID_ISIN, maturityDate, faceValue, address(underlyingAsset));
        vm.stopPrank();
    }

    function test_RevertOnInvalidISIN() public {
        vm.startPrank(owner);

        // Test with empty ISIN
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond("Test Bond", "TBOND", DECIMALS, owner, "", maturityDate, faceValue, address(underlyingAsset));

        // Test with ISIN that's too short
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond("Test Bond", "TBOND", DECIMALS, owner, "US03783310", maturityDate, faceValue, address(underlyingAsset));

        // Test with ISIN that's too long
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond(
            "Test Bond", "TBOND", DECIMALS, owner, "US0378331005XX", maturityDate, faceValue, address(underlyingAsset)
        );

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

        // Try to mature as non-supply manager
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, bond.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        bond.mature();
        vm.stopPrank();

        // Add required underlying assets
        vm.startPrank(owner);
        uint256 requiredAmount = initialUnderlyingSupply;
        underlyingAsset.mint(owner, requiredAmount);
        underlyingAsset.approve(address(bond), requiredAmount);
        bond.topUpUnderlyingAsset(requiredAmount);

        // Now mature as supply manager
        bond.mature();
        assertTrue(bond.isMatured());
        vm.stopPrank();
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
        underlyingAsset.approve(address(bond), initialUnderlyingSupply);
        bond.topUpUnderlyingAsset(initialUnderlyingSupply);

        bond.mature();
        vm.expectRevert(Bond.BondAlreadyMatured.selector);
        bond.mature();
        vm.stopPrank();
    }

    function test_CannotMatureWithoutSufficientUnderlying() public {
        vm.warp(maturityDate + 2);
        vm.startPrank(owner);

        // Try to mature without any underlying assets
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.mature();

        // Add some underlying assets but not enough
        uint256 requiredAmount = initialUnderlyingSupply;
        uint256 partialAmount = requiredAmount / 2;
        underlyingAsset.mint(owner, partialAmount);
        underlyingAsset.approve(address(bond), partialAmount);
        bond.topUpUnderlyingAsset(partialAmount);

        // Try to mature with insufficient underlying assets
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.mature();

        vm.stopPrank();
    }

    function test_CannotWithdrawBelowRequiredReserve() public {
        vm.startPrank(owner);

        // Top up with exact amount needed
        uint256 requiredAmount = initialUnderlyingSupply;
        underlyingAsset.mint(owner, requiredAmount);
        underlyingAsset.approve(address(bond), requiredAmount);
        bond.topUpUnderlyingAsset(requiredAmount);

        // Verify initial state
        assertEq(bond.underlyingAssetBalance(), requiredAmount);
        assertEq(bond.withdrawableUnderlyingAmount(), 0);

        // Withdraw should work because it's not matured yet
        bond.withdrawUnderlyingAsset(owner, 1);

        assertEq(bond.underlyingAssetBalance(), requiredAmount - 1);

        // Top up again so that we have enough to mature
        underlyingAsset.mint(owner, 1);
        underlyingAsset.approve(address(bond), 1);
        bond.topUpUnderlyingAsset(1);

        // Mature the bond
        vm.warp(maturityDate + 2);
        bond.mature();

        // Try to withdraw after maturity (should still fail)
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.withdrawUnderlyingAsset(owner, 1);

        vm.stopPrank();
    }

    function test_WithdrawReserveAfterPartialRedemption() public {
        // Setup: Add required underlying assets
        uint256 requiredAmount = initialUnderlyingSupply;
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
        uint256 newRequiredReserve = remainingBonds * faceValue / (10 ** DECIMALS);

        // Owner should be able to withdraw excess plus freed up reserve
        vm.startPrank(owner);
        bond.withdrawExcessUnderlyingAssets(owner);

        // Verify final state
        assertEq(bond.underlyingAssetBalance(), newRequiredReserve);
        vm.stopPrank();
    }

    function test_WithdrawableAmount() public {
        // Initially no excess
        assertEq(bond.withdrawableUnderlyingAmount(), 0);

        vm.startPrank(owner);

        // Top up with more than needed
        uint256 requiredAmount = initialUnderlyingSupply;
        uint256 excessAmount = toDecimals(5); // 5.00 excess tokens
        uint256 totalAmount = requiredAmount + excessAmount;

        underlyingAsset.mint(owner, totalAmount);
        underlyingAsset.approve(address(bond), totalAmount);
        bond.topUpUnderlyingAsset(totalAmount);

        assertEq(bond.underlyingAssetBalance(), totalAmount);
        assertEq(bond.totalUnderlyingNeeded(), requiredAmount);

        // Verify withdrawable amount equals excess
        uint256 withdrawable = bond.withdrawableUnderlyingAmount();
        assertEq(withdrawable, excessAmount);

        vm.stopPrank();
    }

    function test_RedeemBonds() public {
        // Setup: Add required underlying assets
        uint256 requiredAmount = initialUnderlyingSupply;
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
        uint256 expectedUnderlyingAmount = user1Bonds * faceValue / (10 ** DECIMALS);
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
        assertEq(underlyingAsset.balanceOf(owner), initialUnderlyingSupply - topUpAmount + withdrawAmount);
    }

    function test_CannotWithdrawZeroAmount() public {
        vm.startPrank(owner);
        vm.expectRevert(Bond.InvalidAmount.selector);
        bond.withdrawUnderlyingAsset(owner, 0);
        vm.stopPrank();
    }

    function test_WithdrawExcessUnderlyingAssets() public {
        vm.startPrank(owner);

        // Top up with more than needed
        uint256 requiredAmount = initialUnderlyingSupply;
        uint256 excessAmount = toDecimals(5); // 5.00 excess tokens
        uint256 totalAmount = requiredAmount + excessAmount;

        // First mint and approve the total amount needed
        underlyingAsset.mint(owner, totalAmount);
        underlyingAsset.approve(address(bond), totalAmount);

        // Top up the contract
        bond.topUpUnderlyingAsset(totalAmount);

        // Verify initial state
        assertEq(bond.underlyingAssetBalance(), totalAmount);
        assertEq(bond.withdrawableUnderlyingAmount(), excessAmount);

        // Withdraw excess
        uint256 initialBalance = underlyingAsset.balanceOf(owner);
        bond.withdrawExcessUnderlyingAssets(owner);

        // Verify final state
        assertEq(bond.underlyingAssetBalance(), requiredAmount);
        assertEq(underlyingAsset.balanceOf(owner), initialBalance + excessAmount);
        assertEq(bond.withdrawableUnderlyingAmount(), 0);

        vm.stopPrank();
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

    function test_HistoricalBalances() public {
        uint256 amount = toDecimals(10); // 10.00 bonds

        // Record initial timestamp and balances
        uint256 initialTimestamp = block.timestamp;
        assertEq(bond.balanceAt(owner, initialTimestamp), initialSupply);
        assertEq(bond.balanceAt(user1, initialTimestamp), 0);

        // Transfer some tokens and move time forward
        vm.prank(owner);
        bond.transfer(user1, amount);
        uint256 transferTimestamp = block.timestamp;

        // Check balances at transfer time
        assertEq(bond.balanceAt(owner, transferTimestamp), initialSupply - amount);
        assertEq(bond.balanceAt(user1, transferTimestamp), amount);

        // Move time forward and transfer more
        vm.warp(block.timestamp + 1 days);
        vm.prank(user1);
        bond.transfer(user2, amount / 2);
        uint256 secondTransferTimestamp = block.timestamp;

        // Verify all historical balances
        // At initial timestamp
        assertEq(bond.balanceAt(owner, initialTimestamp), initialSupply);
        assertEq(bond.balanceAt(user1, initialTimestamp), 0);
        assertEq(bond.balanceAt(user2, initialTimestamp), 0);

        // At first transfer timestamp
        assertEq(bond.balanceAt(owner, transferTimestamp), initialSupply - amount);
        assertEq(bond.balanceAt(user1, transferTimestamp), amount);
        assertEq(bond.balanceAt(user2, transferTimestamp), 0);

        // At second transfer timestamp
        assertEq(bond.balanceAt(owner, secondTransferTimestamp), initialSupply - amount);
        assertEq(bond.balanceAt(user1, secondTransferTimestamp), amount / 2);
        assertEq(bond.balanceAt(user2, secondTransferTimestamp), amount / 2);

        // Check future timestamp returns current balance
        assertEq(bond.balanceAt(owner, block.timestamp + 1 days), initialSupply - amount);
        assertEq(bond.balanceAt(user1, block.timestamp + 1 days), amount / 2);
        assertEq(bond.balanceAt(user2, block.timestamp + 1 days), amount / 2);
    }

    function test_HistoricalBalancesWithMultipleTransfers() public {
        uint256 amount = toDecimals(10); // 10.00 bonds
        uint256[] memory timestamps = new uint256[](5);

        // Initial state
        timestamps[0] = block.timestamp;

        // First transfer: owner -> user1
        vm.prank(owner);
        bond.transfer(user1, amount);
        timestamps[1] = block.timestamp;

        // Move time and transfer: user1 -> user2 (partial)
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        bond.transfer(user2, amount / 2);
        timestamps[2] = block.timestamp;

        // Move time and transfer: owner -> user2
        vm.warp(block.timestamp + 1 hours);
        vm.prank(owner);
        bond.transfer(user2, amount);
        timestamps[3] = block.timestamp;

        // Move time and transfer: user2 -> user1
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user2);
        bond.transfer(user1, amount / 4);
        timestamps[4] = block.timestamp;

        // Verify balances at each timestamp
        for (uint256 i = 0; i < timestamps.length; i++) {
            uint256 expectedOwner;
            uint256 expectedUser1;
            uint256 expectedUser2;

            if (i == 0) {
                expectedOwner = initialSupply;
                expectedUser1 = 0;
                expectedUser2 = 0;
            } else if (i == 1) {
                expectedOwner = initialSupply - amount;
                expectedUser1 = amount;
                expectedUser2 = 0;
            } else if (i == 2) {
                expectedOwner = initialSupply - amount;
                expectedUser1 = amount / 2;
                expectedUser2 = amount / 2;
            } else if (i == 3) {
                expectedOwner = initialSupply - amount * 2;
                expectedUser1 = amount / 2;
                expectedUser2 = amount + (amount / 2);
            } else if (i == 4) {
                expectedOwner = initialSupply - amount * 2;
                expectedUser1 = amount / 2 + amount / 4;
                expectedUser2 = amount + (amount / 2) - amount / 4;
            }

            assertEq(bond.balanceAt(owner, timestamps[i]), expectedOwner, "Wrong owner balance at timestamp");
            assertEq(bond.balanceAt(user1, timestamps[i]), expectedUser1, "Wrong user1 balance at timestamp");
            assertEq(bond.balanceAt(user2, timestamps[i]), expectedUser2, "Wrong user2 balance at timestamp");
        }
    }

    function test_HistoricalBalancesBeforeFirstTransfer() public {
        // Check balance at a timestamp before any transfers
        uint256 pastTimestamp = block.timestamp - 1 days;
        assertEq(bond.balanceAt(owner, pastTimestamp), 0, "Should return 0 for timestamp before first transfer");
        assertEq(bond.balanceAt(user1, pastTimestamp), 0, "Should return 0 for timestamp before first transfer");
    }
}
