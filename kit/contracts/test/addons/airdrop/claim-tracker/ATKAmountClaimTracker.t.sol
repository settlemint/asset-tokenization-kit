// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKAmountClaimTracker } from "../../../../contracts/addons/airdrop/claim-tracker/ATKAmountClaimTracker.sol";
import { IATKClaimTracker } from "../../../../contracts/addons/airdrop/claim-tracker/IATKClaimTracker.sol";

contract ATKAmountClaimTrackerTest is Test {
    ATKAmountClaimTracker public claimTracker;

    address public owner;
    address public nonOwner;

    uint256 public constant INDEX_1 = 0;
    uint256 public constant TOTAL_AMOUNT = 1000 ether;
    uint256 public constant CLAIM_AMOUNT = 100 ether;

    // Events
    event ClaimRecorded(uint256 indexed index, uint256 indexed claimedAmount, uint256 indexed totalAmount);

    function setUp() public {
        owner = makeAddr("owner");
        nonOwner = makeAddr("nonOwner");

        vm.label(owner, "Owner");
        vm.label(nonOwner, "NonOwner");

        // Deploy claim tracker
        vm.prank(owner);
        claimTracker = new ATKAmountClaimTracker(owner);

        vm.label(address(claimTracker), "ClaimTracker");
    }

    function testConstructorWithValidOwner() public {
        vm.prank(owner);
        ATKAmountClaimTracker tracker = new ATKAmountClaimTracker(owner);
        assertEq(tracker.owner(), owner);
    }

    function testInitialStateNoClaims() public view {
        assertFalse(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
        assertEq(claimTracker.getClaimedAmount(INDEX_1), 0);
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT));
    }

    function testRecordClaimWithValidAmount() public {
        vm.expectEmit(true, true, true, true);
        emit ClaimRecorded(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        assertEq(claimTracker.getClaimedAmount(INDEX_1), CLAIM_AMOUNT);
        assertFalse(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testRecordClaimWithFullAmount() public {
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, TOTAL_AMOUNT, TOTAL_AMOUNT);

        assertEq(claimTracker.getClaimedAmount(INDEX_1), TOTAL_AMOUNT);
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testRecordClaimAsUnauthorized() public {
        vm.expectRevert();
        vm.prank(nonOwner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);
    }

    function testRecordClaimPartialThenComplete() public {
        // First partial claim
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        assertEq(claimTracker.getClaimedAmount(INDEX_1), CLAIM_AMOUNT);
        assertFalse(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));

        // Complete the claim
        uint256 remainingAmount = TOTAL_AMOUNT - CLAIM_AMOUNT;
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, remainingAmount, TOTAL_AMOUNT);

        assertEq(claimTracker.getClaimedAmount(INDEX_1), TOTAL_AMOUNT);
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testIsClaimAmountValidWithValidAmount() public view {
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, TOTAL_AMOUNT, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, 0, TOTAL_AMOUNT));
    }

    function testIsClaimAmountValidWithInvalidAmount() public view {
        assertFalse(claimTracker.isClaimAmountValid(INDEX_1, TOTAL_AMOUNT + 1, TOTAL_AMOUNT));
    }

    function testIsClaimAmountValidAfterPartialClaim() public {
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        uint256 remainingAmount = TOTAL_AMOUNT - CLAIM_AMOUNT;
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, remainingAmount, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimAmountValid(INDEX_1, remainingAmount + 1, TOTAL_AMOUNT));
    }

    function testFuzzRecordClaim(uint256 index, uint256 claimAmount, uint256 totalAmount) public {
        // Bound inputs to reasonable ranges
        index = bound(index, 0, type(uint128).max);
        totalAmount = bound(totalAmount, 1, type(uint128).max);
        claimAmount = bound(claimAmount, 0, totalAmount);

        vm.prank(owner);
        claimTracker.recordClaim(index, claimAmount, totalAmount);

        assertEq(claimTracker.getClaimedAmount(index), claimAmount);

        if (claimAmount >= totalAmount) {
            assertTrue(claimTracker.isClaimed(index, totalAmount));
        } else {
            assertFalse(claimTracker.isClaimed(index, totalAmount));
        }
    }
}
