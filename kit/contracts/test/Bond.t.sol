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
    uint256 public constant INITIAL_SUPPLY = 100;
    uint256 public constant FACE_VALUE = 100;
    uint256 public maturityDate;
    uint8 public constant DECIMALS = 2;

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

        // Deploy mock underlying asset
        underlyingAsset = new ERC20Mock("Mock USD", "MUSD");
        underlyingAsset.mint(owner, INITIAL_SUPPLY * FACE_VALUE); // Mint enough for all bonds

        vm.startPrank(owner);
        bond = new Bond("Test Bond", "TBOND", DECIMALS, owner, maturityDate, FACE_VALUE, address(underlyingAsset));
        bond.mint(owner, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public {
        assertEq(bond.name(), "Test Bond");
        assertEq(bond.symbol(), "TBOND");
        assertEq(bond.decimals(), DECIMALS);
        assertEq(bond.totalSupply(), INITIAL_SUPPLY);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(bond.maturityDate(), maturityDate);
        assertEq(bond.faceValue(), FACE_VALUE);
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
                "Test Bond", "TBOND", decimalValues[i], owner, maturityDate, FACE_VALUE, address(underlyingAsset)
            );
            assertEq(newBond.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Bond.InvalidDecimals.selector, 19));
        new Bond("Test Bond", "TBOND", 19, owner, maturityDate, FACE_VALUE, address(underlyingAsset));
        vm.stopPrank();
    }

    function test_Transfer() public {
        uint256 amount = 100e18;
        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.balanceOf(user1), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 100e18;

        // Check initial state
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY, "Initial balance incorrect");
        assertEq(bond.frozen(owner), 0, "Should not have frozen tokens");

        vm.startPrank(owner);
        bond.approve(user1, amount);
        vm.stopPrank();

        vm.prank(user1);
        bond.transferFrom(owner, user2, amount);

        assertEq(bond.balanceOf(user2), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
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
        bond.transfer(user1, 100e18);

        bond.unpause();
        assertFalse(bond.paused());

        bond.transfer(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);
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
        uint256 burnAmount = 100e18;
        vm.prank(owner);
        bond.burn(burnAmount);

        assertEq(bond.totalSupply(), INITIAL_SUPPLY - burnAmount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    function test_BurnFrom() public {
        uint256 burnAmount = 100e18;
        vm.prank(owner);
        bond.approve(user1, burnAmount);

        vm.prank(user1);
        bond.burnFrom(owner, burnAmount);

        assertEq(bond.totalSupply(), INITIAL_SUPPLY - burnAmount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    // Blocklist functionality tests
    function test_OnlyUserManagementCanBlock() public {
        vm.startPrank(owner);
        bond.blockUser(user1);
        assertTrue(bond.blocked(user1));

        vm.expectRevert();
        bond.transfer(user1, 100e18);

        bond.unblockUser(user1);
        assertFalse(bond.blocked(user1));

        bond.transfer(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);
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

        vm.startPrank(owner);
        bond.mature();
        vm.expectRevert();
        bond.mature();
        vm.stopPrank();
    }

    // Permit functionality tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        vm.prank(owner);
        bond.mint(signer, 1000e18);

        uint256 deadline = block.timestamp + 1 days;
        uint256 nonce = bond.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = bond.DOMAIN_SEPARATOR();
        bytes32 permitTypehash =
            keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

        bytes32 structHash = keccak256(abi.encode(permitTypehash, signer, user1, 1000e18, nonce, deadline));

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        bond.permit(signer, user1, 1000e18, deadline, v, r, s);
        assertEq(bond.allowance(signer, user1), 1000e18);
    }

    // Fuzz tests
    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount <= INITIAL_SUPPLY);

        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.balanceOf(user1), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testFuzz_Approve(uint256 amount) public {
        vm.prank(owner);
        bond.approve(user1, amount);
        assertEq(bond.allowance(owner, user1), amount);
    }

    // New tests for redemption functionality
    function test_RedeemBonds() public {
        uint256 redeemAmount = 10;
        uint256 underlyingAmount = (redeemAmount / (10 ** DECIMALS)) * FACE_VALUE;

        // Top up underlying assets
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), underlyingAmount);
        bond.topUpUnderlyingAsset(underlyingAmount);
        vm.stopPrank();

        // Transfer bonds to user1
        vm.prank(owner);
        bond.transfer(user1, redeemAmount);

        // Mature the bond
        vm.warp(maturityDate + 1);
        vm.prank(owner);
        bond.mature();

        // Redeem bonds
        vm.prank(user1);
        bond.redeem(redeemAmount);

        // Check state after redemption
        assertEq(bond.balanceOf(user1), 0);
        assertEq(bond.bondRedeemed(user1), redeemAmount);
        assertEq(underlyingAsset.balanceOf(user1), underlyingAmount);
    }

    function test_RedeemAll() public {
        uint256 redeemAmount = 10;
        uint256 underlyingAmount = (redeemAmount / (10 ** DECIMALS)) * FACE_VALUE;

        // Top up underlying assets
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), underlyingAmount);
        bond.topUpUnderlyingAsset(underlyingAmount);
        vm.stopPrank();

        // Transfer bonds to user1
        vm.prank(owner);
        bond.transfer(user1, redeemAmount);

        // Mature the bond
        vm.warp(maturityDate + 1);
        vm.prank(owner);
        bond.mature();

        // Redeem all bonds
        vm.prank(user1);
        bond.redeemAll();

        // Check state after redemption
        assertEq(bond.balanceOf(user1), 0);
        assertEq(bond.bondRedeemed(user1), redeemAmount);
        assertEq(underlyingAsset.balanceOf(user1), underlyingAmount);
    }

    function test_CannotRedeemBeforeMaturity() public {
        uint256 redeemAmount = 10;

        // Transfer bonds to user1
        vm.prank(owner);
        bond.transfer(user1, redeemAmount);

        // Try to redeem before maturity
        vm.prank(user1);
        vm.expectRevert(Bond.BondNotYetMatured.selector);
        bond.redeem(redeemAmount);
    }

    function test_CannotRedeemWithoutUnderlyingAssets() public {
        uint256 redeemAmount = 10;

        // Transfer bonds to user1
        vm.prank(owner);
        bond.transfer(user1, redeemAmount);

        // Mature the bond
        vm.warp(maturityDate + 1);
        vm.prank(owner);
        bond.mature();

        // Try to redeem without underlying assets
        vm.prank(user1);
        vm.expectRevert(Bond.InsufficientUnderlyingBalance.selector);
        bond.redeem(redeemAmount);
    }

    // Tests for underlying asset management
    function test_TopUpUnderlyingAsset() public {
        uint256 topUpAmount = 100;

        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), topUpAmount);
        bond.topUpUnderlyingAsset(topUpAmount);
        vm.stopPrank();

        assertEq(bond.underlyingAssetBalance(), topUpAmount);
    }

    function test_WithdrawUnderlyingAsset() public {
        uint256 topUpAmount = 100;

        // Top up first
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), topUpAmount);
        bond.topUpUnderlyingAsset(topUpAmount);

        // Withdraw half
        uint256 withdrawAmount = topUpAmount / 2;
        bond.withdrawUnderlyingAsset(owner, withdrawAmount);
        vm.stopPrank();

        assertEq(bond.underlyingAssetBalance(), withdrawAmount);
        assertEq(underlyingAsset.balanceOf(owner), INITIAL_SUPPLY * FACE_VALUE - withdrawAmount);
    }

    function test_WithdrawAllUnderlyingAssets() public {
        uint256 topUpAmount = 100;

        // Top up first
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), topUpAmount);
        bond.topUpUnderlyingAsset(topUpAmount);

        // Withdraw all
        bond.withdrawAllUnderlyingAssets(owner);
        vm.stopPrank();

        assertEq(bond.underlyingAssetBalance(), 0);
        assertEq(underlyingAsset.balanceOf(owner), INITIAL_SUPPLY * FACE_VALUE);
    }

    function test_TopUpMissingAmount() public {
        uint256 bondAmount = 10;
        uint256 underlyingAmount = (bondAmount / (10 ** DECIMALS)) * FACE_VALUE;

        // Debug assertions
        assertEq(FACE_VALUE, 100, "Face value should be 100");
        assertEq(DECIMALS, 2, "Decimals should be 2");
        assertEq(bond.faceValue(), FACE_VALUE, "Bond face value should match");
        assertEq(bond.decimals(), DECIMALS, "Bond decimals should match");

        // Transfer bonds to user1
        vm.prank(owner);
        bond.transfer(user1, bondAmount);

        // Check missing amount
        uint256 missing = bond.missingUnderlyingAmount();
        assertEq(missing, underlyingAmount, "Missing amount should match underlying amount");

        // Top up missing amount
        vm.startPrank(owner);
        underlyingAsset.approve(address(bond), underlyingAmount);
        bond.topUpMissingAmount();
        vm.stopPrank();

        // Verify no more missing amount
        assertEq(bond.missingUnderlyingAmount(), 0);
    }
}
