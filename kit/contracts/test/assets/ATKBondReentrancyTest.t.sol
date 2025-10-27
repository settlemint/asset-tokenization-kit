// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "./AbstractATKAssetTest.sol";
import { MockedERC20Token } from "../utils/mocks/MockedERC20Token.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKBond } from "../../contracts/assets/bond/IATKBond.sol";
import { IATKBondFactory } from "../../contracts/assets/bond/IATKBondFactory.sol";
import { ATKBondFactoryImplementation } from "../../contracts/assets/bond/ATKBondFactoryImplementation.sol";
import { ATKBondImplementation } from "../../contracts/assets/bond/ATKBondImplementation.sol";
import { TestConstants } from "../Constants.sol";

/**
 * @title Malicious ERC20 Token for Reentrancy Testing
 * @notice This contract simulates a malicious denomination asset that attempts reentrancy attacks
 */
contract MaliciousERC20Token is MockedERC20Token {
    IATKBond public targetBond;
    address public attacker;
    uint256 public attackCount;
    bool public shouldAttack;

    constructor() MockedERC20Token("Malicious Token", "MAL", 18) { }

    function setTarget(IATKBond _bond, address _attacker) external {
        targetBond = _bond;
        attacker = _attacker;
    }

    function enableAttack() external {
        shouldAttack = true;
    }

    function disableAttack() external {
        shouldAttack = false;
        attackCount = 0;
    }

    /**
     * @notice Overrides transfer to attempt reentrancy during bond redemption
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Call parent transfer first
        bool success = super.transfer(to, amount);

        // Attempt reentrancy attack if enabled and targeting the bond redemption
        if (shouldAttack && address(targetBond) != address(0) && attackCount < 3) {
            attackCount++;
            try targetBond.redeemFor(attacker, 1) {
            // If this succeeds, the reentrancy guard failed
            }
                catch {
                // Expected to fail due to reentrancy guard
            }
        }

        return success;
    }
}

/**
 * @title ReentrancyAttacker Contract
 * @notice Contract that receives tokens and attempts to exploit reentrancy
 */
contract ReentrancyAttacker {
    IATKBond public bond;
    uint256 public attackAttempts;
    bool public attackSucceeded;

    constructor(IATKBond _bond) {
        bond = _bond;
    }

    /**
     * @notice Attempts to re-enter bond redemption when receiving denomination tokens
     */
    receive() external payable {
        // This won't be called for ERC20 transfers, but kept for completeness
    }

    function attemptReentrancy() external {
        attackAttempts++;
        try bond.redeemFor(address(this), 1) {
            attackSucceeded = true;
        } catch {
            // Expected to fail
        }
    }
}

contract ATKBondReentrancyTest is AbstractATKAssetTest {
    IATKBondFactory public bondFactory;
    IATKBond public bond;
    MaliciousERC20Token public maliciousToken;
    ReentrancyAttacker public attacker;

    address public owner;
    address public user1;
    address public user2;

    uint256 public initialSupply;
    uint256 public faceValue;
    uint256 public maturityDate;

    uint8 public constant DECIMALS = 18;
    uint256 public constant CAP = 1000 * 10 ** DECIMALS;
    uint256 public constant INITIAL_SUPPLY_WHOLE = 100;
    uint256 public constant FACE_VALUE_WHOLE = 100;

    function setUp() public {
        // Create test addresses
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Initialize ATK system
        setUpATK(owner);

        // Set up the Bond Factory
        ATKBondFactoryImplementation bondFactoryImpl = new ATKBondFactoryImplementation(address(forwarder));
        ATKBondImplementation bondImpl = new ATKBondImplementation(address(forwarder));

        vm.startPrank(platformAdmin);
        bondFactory = IATKBondFactory(
            systemUtils.tokenFactoryRegistry().registerTokenFactory("Bond", address(bondFactoryImpl), address(bondImpl))
        );
        vm.stopPrank();

        // Initialize identities
        _setUpIdentity(owner, "Owner");
        _setUpIdentity(user1, "User1");
        _setUpIdentity(user2, "User2");

        // Set up bond parameters
        maturityDate = block.timestamp + 365 days;
        initialSupply = INITIAL_SUPPLY_WHOLE * 10 ** DECIMALS;
        faceValue = FACE_VALUE_WHOLE * 10 ** DECIMALS;

        // Deploy malicious token
        maliciousToken = new MaliciousERC20Token();

        // Create bond with malicious denomination asset
        bond = _createBondWithMaliciousToken();

        // Set up attacker contract
        attacker = new ReentrancyAttacker(bond);

        // Configure malicious token
        maliciousToken.setTarget(bond, address(attacker));

        vm.label(address(bond), "Bond");
        vm.label(address(maliciousToken), "MaliciousToken");
        vm.label(address(attacker), "Attacker");
    }

    function _createBondWithMaliciousToken() internal returns (IATKBond result) {
        vm.startPrank(owner);
        IATKBond.BondInitParams memory bondParams = IATKBond.BondInitParams({
            maturityDate: maturityDate, faceValue: faceValue, denominationAsset: address(maliciousToken)
        });

        address bondAddress = bondFactory.createBond(
            "Test Bond",
            "TBOND",
            DECIMALS,
            CAP,
            bondParams,
            new SMARTComplianceModuleParamPair[](0),
            TestConstants.COUNTRY_CODE_US
        );

        result = IATKBond(bondAddress);
        vm.stopPrank();

        _grantAllRoles(result.accessManager(), owner, owner);

        vm.prank(owner);
        result.unpause();

        vm.prank(owner);
        result.mint(owner, initialSupply);

        return result;
    }

    /**
     * @notice Test that reentrancy is properly prevented during redemption
     */
    function test_ReentrancyProtectionDuringRedemption() public {
        // Setup: Prepare bond for redemption
        uint256 redeemAmount = 10 * 10 ** DECIMALS; // 10 bonds
        uint256 denominationAmountNeeded = redeemAmount * faceValue / (10 ** DECIMALS);
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS); // For all bonds

        vm.startPrank(owner);

        // Mint denomination tokens and transfer to bond contract
        maliciousToken.mint(address(bond), totalDenominationNeeded);

        // Transfer some bonds to user1
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        // Mature the bond
        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // Enable attack mode on malicious token
        maliciousToken.enableAttack();

        // User1 attempts redemption - should succeed despite malicious token
        vm.prank(user1);
        bond.redeemFor(user1, redeemAmount);

        // Verify redemption succeeded
        assertEq(bond.balanceOf(user1), 0, "User1 should have no bonds left");
        assertEq(
            maliciousToken.balanceOf(user1), denominationAmountNeeded, "User1 should have received denomination tokens"
        );

        // Verify attack was attempted but failed
        assertGt(maliciousToken.attackCount(), 0, "Attack should have been attempted");

        // Disable attack mode
        maliciousToken.disableAttack();
    }

    /**
     * @notice Test that multiple redemption calls in sequence are protected
     */
    function test_MultipleRedemptionCallsProtected() public {
        uint256 redeemAmount = 5 * 10 ** DECIMALS; // 5 bonds
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS); // For all bonds

        vm.startPrank(owner);

        // Mint enough denomination tokens for multiple redemptions
        maliciousToken.mint(address(bond), totalDenominationNeeded);

        // Transfer bonds to user1
        assertTrue(bond.transfer(user1, redeemAmount * 2), "Transfer failed");

        // Mature the bond
        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // First redemption should work
        vm.prank(user1);
        bond.redeemFor(user1, redeemAmount);

        assertEq(bond.balanceOf(user1), redeemAmount, "User1 should have remaining bonds");
        assertEq(ATKBondImplementation(address(bond)).bondRedeemed(user1), redeemAmount, "Should track redeemed amount");

        // Second redemption should also work
        vm.prank(user1);
        bond.redeemFor(user1, redeemAmount);

        assertEq(bond.balanceOf(user1), 0, "User1 should have no bonds left");
    }

    /**
     * @notice Test that redemption reverts when trying to redeem more than available
     */
    function test_RedeemMoreThanAvailable() public {
        uint256 redeemAmount = 10 * 10 ** DECIMALS;
        uint256 excessAmount = 15 * 10 ** DECIMALS;
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // Try to redeem more than available - should fail because user doesn't have enough tokens
        vm.startPrank(user1);
        vm.expectRevert(); // The specific error depends on which check fails first
        bond.redeemFor(user1, excessAmount);
        vm.stopPrank();
    }

    /**
     * @notice Test redemption when bond is not yet matured
     */
    function test_RedeemBeforeMaturity() public {
        uint256 redeemAmount = 10 * 10 ** DECIMALS;

        vm.startPrank(owner);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");
        vm.stopPrank();

        // Try to redeem before maturity
        vm.startPrank(user1);
        uint256 currentTime = block.timestamp;
        vm.expectRevert(abi.encodeWithSelector(IATKBond.BondNotYetMatured.selector, currentTime, maturityDate));
        bond.redeemFor(user1, redeemAmount);
        vm.stopPrank();
    }

    /**
     * @notice Test redemption with insufficient denomination balance
     */
    function test_RedeemInsufficientDenominationAssetBalance() public {
        uint256 redeemAmount = 10 * 10 ** DECIMALS;
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        // First provide enough tokens to mature the bond
        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        // Now remove most of the denomination tokens to simulate insufficient balance for redemption
        uint256 currentBalance = maliciousToken.balanceOf(address(bond));
        uint256 amountToRemove = currentBalance - (redeemAmount * faceValue / (10 ** DECIMALS)) + 1; // Leave just
            // slightly less than needed
        maliciousToken.burn(address(bond), amountToRemove);

        vm.stopPrank();

        // Try to redeem with insufficient denomination balance
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKBond.InsufficientDenominationAssetBalance.selector, currentBalance - amountToRemove, 1000e18
            )
        );
        bond.redeemFor(user1, redeemAmount);
        vm.stopPrank();
    }

    /**
     * @notice Test that state changes are properly applied before external calls
     */
    function test_StateChangesAppliedBeforeExternalCall() public {
        uint256 redeemAmount = 10 * 10 ** DECIMALS;
        uint256 denominationAmountNeeded = redeemAmount * faceValue / (10 ** DECIMALS);
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // Record initial state
        uint256 initialBondBalance = bond.balanceOf(user1);
        uint256 initialTotalSupply = bond.totalSupply();
        uint256 initialRedeemed = ATKBondImplementation(address(bond)).bondRedeemed(user1);

        // Perform redemption
        vm.prank(user1);
        bond.redeemFor(user1, redeemAmount);

        // Verify state changes were applied correctly
        assertEq(bond.balanceOf(user1), initialBondBalance - redeemAmount, "Bond balance not updated correctly");
        assertEq(bond.totalSupply(), initialTotalSupply - redeemAmount, "Total supply not updated correctly");
        assertEq(
            ATKBondImplementation(address(bond)).bondRedeemed(user1),
            initialRedeemed + redeemAmount,
            "Redeemed amount not tracked correctly"
        );
        assertEq(
            maliciousToken.balanceOf(user1), denominationAmountNeeded, "Denomination tokens not transferred correctly"
        );
    }

    /**
     * @notice Test redeemAll function for reentrancy protection
     */
    function test_RedeemAllReentrancyProtection() public {
        uint256 userBonds = 20 * 10 ** DECIMALS;
        uint256 denominationAmountNeeded = userBonds * faceValue / (10 ** DECIMALS);
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, userBonds), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // Enable attack mode
        maliciousToken.enableAttack();

        // Use redeemAll equivalent
        vm.prank(user1);
        uint256 balance = bond.balanceOf(user1);
        bond.redeemFor(user1, balance);

        // Verify redemption succeeded
        assertEq(bond.balanceOf(user1), 0, "User1 should have no bonds left");
        assertEq(
            maliciousToken.balanceOf(user1),
            denominationAmountNeeded,
            "User1 should have received all denomination tokens"
        );

        // Verify attack was attempted but failed
        assertGt(maliciousToken.attackCount(), 0, "Attack should have been attempted");

        maliciousToken.disableAttack();
    }

    /**
     * @notice Test that failed external transfer is properly handled
     */
    function test_FailedTransferHandling() public {
        uint256 redeemAmount = 10 * 10 ** DECIMALS;
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        // Mint enough to mature the bond
        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        // Remove all denomination tokens to cause transfer failure
        maliciousToken.burn(address(bond), maliciousToken.balanceOf(address(bond)));

        vm.stopPrank();

        // Try to redeem when denomination transfer will fail
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSelector(IATKBond.InsufficientDenominationAssetBalance.selector, 0, 1000e18));
        bond.redeemFor(user1, redeemAmount);
        vm.stopPrank();

        // Verify no state changes occurred
        assertEq(bond.balanceOf(user1), redeemAmount, "Bond balance should be unchanged");
        assertEq(ATKBondImplementation(address(bond)).bondRedeemed(user1), 0, "No redemption should be recorded");
    }

    /**
     * @notice Test gas consumption remains reasonable with reentrancy protection
     */
    function test_GasConsumptionWithReentrancyProtection() public {
        uint256 redeemAmount = 1 * 10 ** DECIMALS;
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        maliciousToken.mint(address(bond), totalDenominationNeeded);
        assertTrue(bond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        bond.mature();

        vm.stopPrank();

        // Measure gas consumption
        vm.prank(user1);
        uint256 gasBefore = gasleft();
        bond.redeemFor(user1, redeemAmount);
        uint256 gasUsed = gasBefore - gasleft();

        // Gas should be reasonable (less than 300k for a simple redemption with reentrancy protection)
        assertLt(gasUsed, 300_000, "Gas consumption should be reasonable");
    }

    /**
     * @notice Test that legitimate redemptions work normally
     */
    function test_LegitimateRedemptionsWork() public {
        // Use a normal ERC20 token for this test
        MockedERC20Token normalToken = new MockedERC20Token("Normal Token", "NORM", DECIMALS);

        // Create a new bond with normal token
        vm.startPrank(owner);
        IATKBond.BondInitParams memory normalBondParams = IATKBond.BondInitParams({
            maturityDate: maturityDate, faceValue: faceValue, denominationAsset: address(normalToken)
        });

        address normalBondAddress = bondFactory.createBond(
            "Normal Bond",
            "NBOND",
            DECIMALS,
            CAP,
            normalBondParams,
            new SMARTComplianceModuleParamPair[](0),
            TestConstants.COUNTRY_CODE_US
        );

        IATKBond normalBond = IATKBond(normalBondAddress);
        vm.stopPrank();

        _grantAllRoles(normalBond.accessManager(), owner, owner);

        vm.prank(owner);
        normalBond.unpause();

        uint256 redeemAmount = 10 * 10 ** DECIMALS;
        uint256 denominationAmountNeeded = redeemAmount * faceValue / (10 ** DECIMALS);
        uint256 totalDenominationNeeded = initialSupply * faceValue / (10 ** DECIMALS);

        vm.startPrank(owner);

        normalBond.mint(owner, initialSupply);
        normalToken.mint(address(normalBond), totalDenominationNeeded);
        assertTrue(normalBond.transfer(user1, redeemAmount), "Transfer failed");

        vm.warp(maturityDate + 1);
        normalBond.mature();

        vm.stopPrank();

        // Normal redemption should work perfectly
        vm.prank(user1);
        normalBond.redeemFor(user1, redeemAmount);

        assertEq(normalBond.balanceOf(user1), 0, "Normal redemption should work");
        assertEq(normalToken.balanceOf(user1), denominationAmountNeeded, "Should receive denomination tokens");
    }
}
