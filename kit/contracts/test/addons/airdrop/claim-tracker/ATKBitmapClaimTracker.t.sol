// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKBitmapClaimTracker } from "../../../../contracts/addons/airdrop/claim-tracker/ATKBitmapClaimTracker.sol";
import { IATKClaimTracker } from "../../../../contracts/addons/airdrop/claim-tracker/IATKClaimTracker.sol";

contract ATKBitmapClaimTrackerTest is Test {
    ATKBitmapClaimTracker public claimTracker;

    address public owner;
    address public nonOwner;

    uint256 public constant INDEX_1 = 0;
    uint256 public constant INDEX_2 = 1;
    uint256 public constant INDEX_255 = 255; // Last index in first word
    uint256 public constant INDEX_256 = 256; // First index in second word
    uint256 public constant INDEX_MAX = type(uint128).max; // Large index for testing
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
        claimTracker = new ATKBitmapClaimTracker(owner);

        vm.label(address(claimTracker), "BitmapClaimTracker");
    }

    function testConstructorWithValidOwner() public {
        vm.prank(owner);
        ATKBitmapClaimTracker tracker = new ATKBitmapClaimTracker(owner);
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

        // For bitmap tracker, any claim marks as fully claimed
        assertEq(claimTracker.getClaimedAmount(INDEX_1), type(uint256).max);
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testRecordClaimWithZeroAmount() public {
        vm.expectEmit(true, true, true, true);
        emit ClaimRecorded(INDEX_1, 0, TOTAL_AMOUNT);

        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, 0, TOTAL_AMOUNT);

        // Even zero amount marks as fully claimed in bitmap
        assertEq(claimTracker.getClaimedAmount(INDEX_1), type(uint256).max);
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testRecordClaimAsUnauthorized() public {
        vm.expectRevert();
        vm.prank(nonOwner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);
    }

    function testRecordClaimAlreadyClaimed() public {
        // First claim
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));

        // Second claim on same index should still work (bitmap doesn't prevent it)
        vm.expectEmit(true, true, true, true);
        emit ClaimRecorded(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        // Still marked as claimed
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
    }

    function testIsClaimAmountValidWithUnclaimedIndex() public view {
        // Any amount is valid for unclaimed index
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, TOTAL_AMOUNT, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, 0, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimAmountValid(INDEX_1, TOTAL_AMOUNT + 1, TOTAL_AMOUNT));
    }

    function testIsClaimAmountValidWithClaimedIndex() public {
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        // No amount is valid for already claimed index
        assertFalse(claimTracker.isClaimAmountValid(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimAmountValid(INDEX_1, 0, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimAmountValid(INDEX_1, TOTAL_AMOUNT, TOTAL_AMOUNT));
    }

    function testMultipleIndicesInSameWord() public {
        // Test multiple indices within same 256-bit word
        uint256[] memory indices = new uint256[](5);
        indices[0] = 0;
        indices[1] = 1;
        indices[2] = 100;
        indices[3] = 200;
        indices[4] = 255;

        // Claim some indices
        vm.startPrank(owner);
        claimTracker.recordClaim(indices[0], CLAIM_AMOUNT, TOTAL_AMOUNT);
        claimTracker.recordClaim(indices[2], CLAIM_AMOUNT, TOTAL_AMOUNT);
        claimTracker.recordClaim(indices[4], CLAIM_AMOUNT, TOTAL_AMOUNT);
        vm.stopPrank();

        // Verify claimed indices
        assertTrue(claimTracker.isClaimed(indices[0], TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimed(indices[2], TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimed(indices[4], TOTAL_AMOUNT));

        // Verify unclaimed indices
        assertFalse(claimTracker.isClaimed(indices[1], TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(indices[3], TOTAL_AMOUNT));
    }

    function testMultipleWordsIndices() public {
        // Test indices across different 256-bit words
        uint256[] memory indices = new uint256[](4);
        indices[0] = 255; // Last index in first word
        indices[1] = 256; // First index in second word
        indices[2] = 512; // First index in third word
        indices[3] = 1000; // Index in fourth word

        // Claim indices in different words
        vm.startPrank(owner);
        for (uint256 i = 0; i < indices.length; i++) {
            claimTracker.recordClaim(indices[i], CLAIM_AMOUNT, TOTAL_AMOUNT);
        }
        vm.stopPrank();

        // Verify all claimed
        for (uint256 i = 0; i < indices.length; i++) {
            assertTrue(claimTracker.isClaimed(indices[i], TOTAL_AMOUNT));
            assertEq(claimTracker.getClaimedAmount(indices[i]), type(uint256).max);
        }

        // Verify adjacent unclaimed indices
        assertFalse(claimTracker.isClaimed(254, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(257, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(511, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(999, TOTAL_AMOUNT));
    }

    function testLargeIndices() public {
        uint256 largeIndex = type(uint128).max;

        vm.prank(owner);
        claimTracker.recordClaim(largeIndex, CLAIM_AMOUNT, TOTAL_AMOUNT);

        assertTrue(claimTracker.isClaimed(largeIndex, TOTAL_AMOUNT));
        assertEq(claimTracker.getClaimedAmount(largeIndex), type(uint256).max);
        assertFalse(claimTracker.isClaimAmountValid(largeIndex, CLAIM_AMOUNT, TOTAL_AMOUNT));
    }

    function testGetClaimedAmountBehavior() public {
        // Unclaimed index returns 0
        assertEq(claimTracker.getClaimedAmount(INDEX_1), 0);

        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        // Claimed index returns max uint256
        assertEq(claimTracker.getClaimedAmount(INDEX_1), type(uint256).max);
    }

    function testIsClaimedWithDifferentTotalAmounts() public {
        vm.prank(owner);
        claimTracker.recordClaim(INDEX_1, CLAIM_AMOUNT, TOTAL_AMOUNT);

        // totalAmount parameter is ignored in bitmap tracker
        assertTrue(claimTracker.isClaimed(INDEX_1, 1));
        assertTrue(claimTracker.isClaimed(INDEX_1, TOTAL_AMOUNT));
        assertTrue(claimTracker.isClaimed(INDEX_1, type(uint256).max));
    }

    function testBitmapWordBoundaries() public {
        // Test indices at word boundaries
        uint256[] memory boundaryIndices = new uint256[](6);
        boundaryIndices[0] = 255; // Last bit of first word
        boundaryIndices[1] = 256; // First bit of second word
        boundaryIndices[2] = 511; // Last bit of second word
        boundaryIndices[3] = 512; // First bit of third word
        boundaryIndices[4] = 767; // Last bit of third word
        boundaryIndices[5] = 768; // First bit of fourth word

        vm.startPrank(owner);
        for (uint256 i = 0; i < boundaryIndices.length; i++) {
            claimTracker.recordClaim(boundaryIndices[i], CLAIM_AMOUNT, TOTAL_AMOUNT);
        }
        vm.stopPrank();

        // Verify all boundary indices are claimed
        for (uint256 i = 0; i < boundaryIndices.length; i++) {
            assertTrue(claimTracker.isClaimed(boundaryIndices[i], TOTAL_AMOUNT));
        }

        // Verify adjacent indices are not claimed
        assertFalse(claimTracker.isClaimed(254, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(257, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(510, TOTAL_AMOUNT));
        assertFalse(claimTracker.isClaimed(513, TOTAL_AMOUNT));
    }

    function testFuzzRecordClaim(uint256 index, uint256 claimAmount, uint256 totalAmount) public {
        // Bound inputs to reasonable ranges
        index = bound(index, 0, type(uint128).max);
        totalAmount = bound(totalAmount, 1, type(uint128).max);
        claimAmount = bound(claimAmount, 0, type(uint128).max);

        vm.prank(owner);
        claimTracker.recordClaim(index, claimAmount, totalAmount);

        // For bitmap tracker, any claim marks as fully claimed
        assertEq(claimTracker.getClaimedAmount(index), type(uint256).max);
        assertTrue(claimTracker.isClaimed(index, totalAmount));
        assertFalse(claimTracker.isClaimAmountValid(index, claimAmount, totalAmount));
    }

    function testFuzzIsClaimAmountValid(uint256 index, uint256 claimAmount, uint256 totalAmount) public {
        // Bound inputs to prevent overflow
        index = bound(index, 0, type(uint128).max);
        claimAmount = bound(claimAmount, 0, type(uint128).max);
        totalAmount = bound(totalAmount, 1, type(uint128).max);

        // Before claiming, any amount should be valid
        assertTrue(claimTracker.isClaimAmountValid(index, claimAmount, totalAmount));

        vm.prank(owner);
        claimTracker.recordClaim(index, claimAmount, totalAmount);

        // After claiming, no amount should be valid
        assertFalse(claimTracker.isClaimAmountValid(index, claimAmount, totalAmount));
        assertFalse(claimTracker.isClaimAmountValid(index, 0, totalAmount));
        assertFalse(claimTracker.isClaimAmountValid(index, 1, totalAmount));
    }

    function testFuzzMultipleIndicesInSameWord(uint256 seed) public {
        // Use seed to generate deterministic but varied test cases
        // Bound wordIndex to prevent overflow when multiplying by 256
        uint256 wordIndex = bound(seed, 0, type(uint128).max);
        uint256 baseIndex = wordIndex * 256;

        // Generate 5 different bit positions within the same word
        uint256[] memory bitPositions = new uint256[](5);
        bitPositions[0] = 0;

        // Bound seed to prevent overflow when multiplying by 3
        uint256 boundedSeed = bound(seed, 1, type(uint256).max / 3);
        bitPositions[1] = (boundedSeed % 50) + 1;
        bitPositions[2] = ((boundedSeed * 2) % 100) + 51;
        bitPositions[3] = ((boundedSeed * 3) % 100) + 151;

        bitPositions[4] = 255;

        vm.startPrank(owner);
        // Claim even-indexed positions (0, 2, 4)
        for (uint256 i = 0; i < bitPositions.length; i += 2) {
            claimTracker.recordClaim(baseIndex + bitPositions[i], CLAIM_AMOUNT, TOTAL_AMOUNT);
        }
        vm.stopPrank();

        // Verify claimed positions (even indices)
        for (uint256 i = 0; i < bitPositions.length; i += 2) {
            assertTrue(claimTracker.isClaimed(baseIndex + bitPositions[i], TOTAL_AMOUNT));
        }

        // Verify unclaimed positions (odd indices)
        for (uint256 i = 1; i < bitPositions.length; i += 2) {
            assertFalse(claimTracker.isClaimed(baseIndex + bitPositions[i], TOTAL_AMOUNT));
        }
    }
}
