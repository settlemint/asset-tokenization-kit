// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { Bond } from "../contracts/Bond.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";

import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

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
    uint256 public constant CAP = 1000 * 10 ** DECIMALS; // 1000 tokens cap

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
            "Test Bond", "TBOND", DECIMALS, owner, VALID_ISIN, CAP, maturityDate, faceValue, address(underlyingAsset)
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
                CAP,
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
        new Bond("Test Bond", "TBOND", 19, owner, VALID_ISIN, CAP, maturityDate, faceValue, address(underlyingAsset));
        vm.stopPrank();
    }

    function test_RevertOnInvalidISIN() public {
        vm.startPrank(owner);

        // Test with empty ISIN
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond("Test Bond", "TBOND", DECIMALS, owner, "", CAP, maturityDate, faceValue, address(underlyingAsset));

        // Test with ISIN that's too short
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond(
            "Test Bond", "TBOND", DECIMALS, owner, "US03783310", CAP, maturityDate, faceValue, address(underlyingAsset)
        );

        // Test with ISIN that's too long
        vm.expectRevert(Bond.InvalidISIN.selector);
        new Bond(
            "Test Bond",
            "TBOND",
            DECIMALS,
            owner,
            "US0378331005XX",
            CAP,
            maturityDate,
            faceValue,
            address(underlyingAsset)
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
        bond.mint(user1, toDecimals(100));
        assertEq(bond.balanceOf(user1), toDecimals(100));

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, bond.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        bond.mint(user1, toDecimals(100));
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
        vm.stopPrank();

        vm.expectRevert();
        vm.startPrank(user1);
        bond.transfer(user2, 100);

        // Unfreeze and verify
        vm.stopPrank();

        vm.startPrank(owner);
        bond.unfreeze(user1, 100);
        assertEq(bond.frozen(user1), 0);

        // Now transfer should work
        vm.stopPrank();
        vm.startPrank(user1);
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

        // Step 1: Initial state
        uint256 t0 = block.timestamp;
        assertEq(bond.balanceAt(owner, t0), initialSupply, "Initial owner balance incorrect");
        assertEq(bond.balanceAt(user1, t0), 0, "Initial user1 balance incorrect");

        // Step 2: First transfer - owner sends 10 bonds to user1
        vm.warp(t0 + 1 hours);
        vm.prank(owner);
        bond.transfer(user1, amount);
        uint256 t1 = block.timestamp;

        assertEq(bond.balanceAt(owner, t1), initialSupply - amount, "Owner balance after first transfer");
        assertEq(bond.balanceAt(user1, t1), amount, "User1 balance after first transfer");
        assertEq(bond.balanceAt(user2, t1), 0, "User2 balance after first transfer");

        // Step 3: Second transfer - user1 sends 5 bonds to user2
        vm.warp(t1 + 1 hours);
        vm.prank(user1);
        bond.transfer(user2, amount / 2);
        uint256 t2 = block.timestamp;

        assertEq(bond.balanceAt(owner, t2), initialSupply - amount, "Owner balance after second transfer");
        assertEq(bond.balanceAt(user1, t2), amount / 2, "User1 balance after second transfer");
        assertEq(bond.balanceAt(user2, t2), amount / 2, "User2 balance after second transfer");

        // Step 4: Check future timestamp returns current balance
        uint256 t3 = t2 + 1 hours;
        assertEq(bond.balanceAt(owner, t3), initialSupply - amount, "Owner balance at future time");
        assertEq(bond.balanceAt(user1, t3), amount / 2, "User1 balance at future time");
        assertEq(bond.balanceAt(user2, t3), amount / 2, "User2 balance at future time");
    }

    function test_HistoricalBalancesWithMultipleTransfers() public {
        uint256 transferAmount = toDecimals(10); // 10.00 bonds
        uint256 halfTransfer = transferAmount / 2; // 5.00 bonds
        uint256 quarterTransfer = transferAmount / 4; // 2.50 bonds

        // Step 1: Initial state at t0 = 1000
        vm.warp(1000);
        uint256 t0 = block.timestamp;
        assertEq(bond.balanceAt(owner, t0), initialSupply, "Initial owner balance incorrect");
        assertEq(bond.balanceAt(user1, t0), 0, "Initial user1 balance incorrect");
        assertEq(bond.balanceAt(user2, t0), 0, "Initial user2 balance incorrect");

        // Step 2: First transfer at t1 = 2000
        vm.warp(2000);
        uint256 t1 = block.timestamp;
        vm.prank(owner);
        bond.transfer(user1, transferAmount);

        assertEq(bond.balanceAt(owner, t1), initialSupply - transferAmount, "Owner balance after first transfer");
        assertEq(bond.balanceAt(user1, t1), transferAmount, "User1 balance after first transfer");
        assertEq(bond.balanceAt(user2, t1), 0, "User2 balance after first transfer");

        // Step 3: Second transfer at t2 = 3000
        vm.warp(3000);
        uint256 t2 = block.timestamp;
        vm.prank(user1);
        bond.transfer(user2, halfTransfer);

        assertEq(bond.balanceAt(owner, t2), initialSupply - transferAmount, "Owner balance after second transfer");
        assertEq(bond.balanceAt(user1, t2), halfTransfer, "User1 balance after second transfer");
        assertEq(bond.balanceAt(user2, t2), halfTransfer, "User2 balance after second transfer");

        // Step 4: Third transfer at t3 = 4000
        vm.warp(4000);
        uint256 t3 = block.timestamp;
        vm.prank(owner);
        bond.transfer(user2, transferAmount);

        assertEq(bond.balanceAt(owner, t3), initialSupply - (transferAmount * 2), "Owner balance after third transfer");
        assertEq(bond.balanceAt(user1, t3), halfTransfer, "User1 balance after third transfer");
        assertEq(bond.balanceAt(user2, t3), halfTransfer + transferAmount, "User2 balance after third transfer");

        // Step 5: Fourth transfer at t4 = 5000
        vm.warp(5000);
        uint256 t4 = block.timestamp;
        vm.prank(user2);
        bond.transfer(user1, quarterTransfer);

        assertEq(bond.balanceAt(owner, t4), initialSupply - (transferAmount * 2), "Owner balance after fourth transfer");
        assertEq(bond.balanceAt(user1, t4), halfTransfer + quarterTransfer, "User1 balance after fourth transfer");
        assertEq(
            bond.balanceAt(user2, t4),
            halfTransfer + transferAmount - quarterTransfer,
            "User2 balance after fourth transfer"
        );
    }

    function test_HistoricalBalancesBeforeFirstTransfer() public {
        // First warp to a reasonable timestamp
        vm.warp(2 days);

        // Store current time
        uint256 currentTime = block.timestamp;

        // Check balance at a timestamp before deployment
        uint256 pastTimestamp = 0; // timestamp 0 is before deployment

        assertEq(bond.balanceAt(owner, pastTimestamp), 0, "Should return 0 for timestamp before deployment");
        assertEq(bond.balanceAt(user1, pastTimestamp), 0, "Should return 0 for timestamp before deployment");

        // Verify balance at deployment time shows initial supply
        assertEq(bond.balanceAt(owner, 1), initialSupply, "Owner balance at deployment should be initial supply");
        assertEq(bond.balanceAt(user1, 1), 0, "User1 balance at deployment should be 0");

        // Verify current balance shows initial supply
        assertEq(bond.balanceAt(owner, currentTime), initialSupply, "Current owner balance should be initial supply");
        assertEq(bond.balanceAt(user1, currentTime), 0, "Current user1 balance should be 0");
    }

    // Add new tests for cap functionality
    function test_CapEnforcement() public {
        vm.startPrank(owner);

        // Try to mint tokens that would exceed the cap
        uint256 remainingToCap = CAP - bond.totalSupply();
        uint256 exceedingAmount = remainingToCap + 1;

        vm.expectRevert(
            abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, exceedingAmount + bond.totalSupply(), CAP)
        );
        bond.mint(owner, exceedingAmount);

        // Should be able to mint up to the cap
        bond.mint(owner, remainingToCap);
        assertEq(bond.totalSupply(), CAP, "Total supply should equal cap");

        // Verify can't mint even 1 more token
        vm.expectRevert(abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, CAP + 1, CAP));
        bond.mint(owner, 1);

        vm.stopPrank();
    }

    function test_BurnAndRemintUpToCap() public {
        vm.startPrank(owner);

        // Verify initial state
        assertEq(bond.totalSupply(), initialSupply, "Initial supply incorrect");
        assertEq(bond.cap(), CAP, "Cap incorrect");

        // Calculate remaining amount to cap
        uint256 remainingToCap = CAP - initialSupply;

        // Mint up to the cap
        bond.mint(owner, remainingToCap);
        assertEq(bond.totalSupply(), CAP, "Supply should equal cap");

        // Try to mint one more token
        vm.expectRevert(abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, CAP + 1, CAP));
        bond.mint(owner, 1);

        vm.stopPrank();
    }

    function test_InitialCapState() public view {
        assertEq(bond.cap(), CAP, "Cap should be set correctly");
        assertTrue(bond.totalSupply() <= CAP, "Initial supply should not exceed cap");
    }

    function test_TransferWithinCap() public {
        uint256 amount = toDecimals(10);

        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.totalSupply(), initialSupply, "Total supply should remain unchanged after transfer");
        assertTrue(bond.totalSupply() <= CAP, "Total supply should still be within cap");
    }
}
