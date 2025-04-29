// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { StandardAirdrop } from "../contracts/StandardAirdrop.sol";
import { AirdropBase } from "../contracts/airdrop/AirdropBase.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }
}

contract StandardAirdropTest is Test {
    StandardAirdrop public airdrop;
    MockERC20 public token;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public trustedForwarder;

    uint256 public startTime;
    uint256 public endTime;

    // Merkle tree data with actual tree generation
    bytes32 public merkleRoot;

    // Claim data for users
    uint256 public user1Index = 0;
    uint256 public user1Amount = 100 * 10 ** 18;
    bytes32[] public user1Proof;

    uint256 public user2Index = 1;
    uint256 public user2Amount = 200 * 10 ** 18;
    bytes32[] public user2Proof;

    uint256 public user3Index = 2;
    uint256 public user3Amount = 300 * 10 ** 18;
    bytes32[] public user3Proof;

    // Helper function to properly hash paired nodes in correct order
    function hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encode(a, b)) : keccak256(abi.encode(b, a));
    }

    function setUp() public {
        vm.startPrank(owner);
        token = new MockERC20();

        // Set up time constraints
        startTime = block.timestamp;
        endTime = block.timestamp + 7 days;

        // Set up trusted forwarder
        trustedForwarder = makeAddr("trustedForwarder");

        // Generate leaf nodes with double hashing for security
        bytes32[] memory leaves = new bytes32[](3);
        // Double hash each leaf
        leaves[0] = keccak256(abi.encode(keccak256(abi.encode(user1Index, user1, user1Amount))));
        leaves[1] = keccak256(abi.encode(keccak256(abi.encode(user2Index, user2, user2Amount))));
        leaves[2] = keccak256(abi.encode(keccak256(abi.encode(user3Index, user3, user3Amount))));

        // Build merkle tree (simplified version for testing purposes)
        // For leaf nodes with odd length, duplicate the last element
        bytes32[] memory level = new bytes32[](4); // Ensure even length by padding
        level[0] = leaves[0];
        level[1] = leaves[1];
        level[2] = leaves[2];
        level[3] = leaves[2]; // Duplicate last element to make even length

        // Calculate the next level up (2 nodes)
        bytes32[] memory nextLevel = new bytes32[](2);
        nextLevel[0] = hashPair(level[0], level[1]);
        nextLevel[1] = hashPair(level[2], level[3]);

        // Calculate the root
        merkleRoot = hashPair(nextLevel[0], nextLevel[1]);

        // User1 proof
        user1Proof = new bytes32[](2);
        user1Proof[0] = leaves[1]; // Sibling node
        user1Proof[1] = nextLevel[1]; // Next level node

        // User2 proof
        user2Proof = new bytes32[](2);
        user2Proof[0] = leaves[0]; // Sibling node
        user2Proof[1] = nextLevel[1]; // Next level node

        // User3 proof
        user3Proof = new bytes32[](2);
        user3Proof[0] = leaves[2]; // Sibling to itself (duplicated leaf)
        user3Proof[1] = nextLevel[0]; // Next level node

        // Deploy airdrop contract
        airdrop = new StandardAirdrop(address(token), merkleRoot, owner, startTime, endTime, trustedForwarder);

        // Fund the airdrop contract
        token.transfer(address(airdrop), 1000 * 10 ** 18);

        vm.stopPrank();
    }

    // Test constructor constraints
    function testConstructorRequiresValidTimeframe() public {
        vm.startPrank(owner);
        vm.expectRevert("End time must be after start time");
        new StandardAirdrop(
            address(token),
            merkleRoot,
            owner,
            10, // startTime
            5, // endTime < startTime, should revert
            trustedForwarder
        );
        vm.stopPrank();
    }

    // Test claiming before start time
    function testClaimBeforeStartReverts() public {
        // Deploy a new airdrop with future start time
        vm.startPrank(owner);
        StandardAirdrop futureAirdrop = new StandardAirdrop(
            address(token),
            merkleRoot,
            owner,
            block.timestamp + 1 days, // Start in the future
            block.timestamp + 2 days,
            trustedForwarder
        );
        token.transfer(address(futureAirdrop), 500 * 10 ** 18);
        vm.stopPrank();

        // Try to claim before start time
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AirdropNotStarted()"));
        futureAirdrop.claim(user1Index, user1Amount, user1Proof);
        vm.stopPrank();
    }

    // Test claiming after end time
    function testClaimAfterEndReverts() public {
        // Warp time to after end time
        vm.warp(endTime + 1);

        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AirdropEnded()"));
        airdrop.claim(user1Index, user1Amount, user1Proof);
        vm.stopPrank();
    }

    // Test claiming with invalid proof
    function testClaimWithInvalidProofReverts() public {
        vm.startPrank(user1);
        // Create an invalid proof
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = bytes32(uint256(0xdeadbeef)); // Fixed conversion

        vm.expectRevert(abi.encodeWithSignature("InvalidMerkleProof()"));
        airdrop.claim(user1Index, user1Amount, invalidProof);
        vm.stopPrank();
    }

    // Test claiming with a properly generated merkle proof
    function testClaimWithGeneratedMerkleProofs() public {
        // Verify user1 proof
        bytes32 user1Node = keccak256(abi.encode(keccak256(abi.encode(user1Index, user1, user1Amount))));
        assertTrue(MerkleProof.verify(user1Proof, merkleRoot, user1Node), "User1 proof should verify");

        // Verify user2 proof
        bytes32 user2Node = keccak256(abi.encode(keccak256(abi.encode(user2Index, user2, user2Amount))));
        assertTrue(MerkleProof.verify(user2Proof, merkleRoot, user2Node), "User2 proof should verify");

        // Verify user3 proof
        bytes32 user3Node = keccak256(abi.encode(keccak256(abi.encode(user3Index, user3, user3Amount))));
        assertTrue(MerkleProof.verify(user3Proof, merkleRoot, user3Node), "User3 proof should verify");

        // User1 claims
        uint256 user1BalanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        airdrop.claim(user1Index, user1Amount, user1Proof);
        uint256 user1BalanceAfter = token.balanceOf(user1);
        assertEq(user1BalanceAfter - user1BalanceBefore, user1Amount, "User1 claimed incorrect amount");

        // User2 claims
        uint256 user2BalanceBefore = token.balanceOf(user2);
        vm.prank(user2);
        airdrop.claim(user2Index, user2Amount, user2Proof);
        uint256 user2BalanceAfter = token.balanceOf(user2);
        assertEq(user2BalanceAfter - user2BalanceBefore, user2Amount, "User2 claimed incorrect amount");

        // User3 claims
        uint256 user3BalanceBefore = token.balanceOf(user3);
        vm.prank(user3);
        airdrop.claim(user3Index, user3Amount, user3Proof);
        uint256 user3BalanceAfter = token.balanceOf(user3);
        assertEq(user3BalanceAfter - user3BalanceBefore, user3Amount, "User3 claimed incorrect amount");

        // Check all claimed status
        assertTrue(airdrop.isClaimed(user1Index), "User1 index should be marked as claimed");
        assertTrue(airdrop.isClaimed(user2Index), "User2 index should be marked as claimed");
        assertTrue(airdrop.isClaimed(user3Index), "User3 index should be marked as claimed");
    }

    // Test double claim reverts
    function testDoubleClaimReverts() public {
        // First verify the proof is valid
        bytes32 user1Node = keccak256(abi.encode(keccak256(abi.encode(user1Index, user1, user1Amount))));
        assertTrue(MerkleProof.verify(user1Proof, merkleRoot, user1Node), "User1 proof should verify");

        // First claim should succeed
        vm.startPrank(user1);
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Second claim should revert with AlreadyClaimed
        vm.expectRevert(abi.encodeWithSignature("AlreadyClaimed()"));
        airdrop.claim(user1Index, user1Amount, user1Proof);
        vm.stopPrank();
    }

    // Test owner withdraws tokens
    function testOwnerWithdrawTokens() public {
        vm.startPrank(owner);
        uint256 airdropBalance = token.balanceOf(address(airdrop));
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        airdrop.withdrawTokens(owner);

        uint256 ownerBalanceAfter = token.balanceOf(owner);
        assertEq(ownerBalanceAfter - ownerBalanceBefore, airdropBalance, "Owner should receive all tokens");
        assertEq(token.balanceOf(address(airdrop)), 0, "Airdrop contract should have 0 balance");
        vm.stopPrank();
    }

    // Test non-owner cannot withdraw
    function testNonOwnerCannotWithdraw() public {
        vm.startPrank(user1);
        vm.expectRevert(); // Should revert with Ownable error
        airdrop.withdrawTokens(user1);
        vm.stopPrank();
    }

    // Test multiple claims from different users
    function testMultipleClaimsFromDifferentUsers() public {
        // For testing, we'll simulate valid proofs for both users

        // User1 claims
        uint256 user1BalanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        airdrop.claim(user1Index, user1Amount, user1Proof);
        uint256 user1BalanceAfter = token.balanceOf(user1);
        assertEq(user1BalanceAfter - user1BalanceBefore, user1Amount, "Incorrect amount claimed by user1");

        // User2 claims
        uint256 user2BalanceBefore = token.balanceOf(user2);
        vm.prank(user2);
        airdrop.claim(user2Index, user2Amount, user2Proof);
        uint256 user2BalanceAfter = token.balanceOf(user2);
        assertEq(user2BalanceAfter - user2BalanceBefore, user2Amount, "Incorrect amount claimed by user2");

        assertTrue(airdrop.isClaimed(user1Index), "User1 index should be marked as claimed");
        assertTrue(airdrop.isClaimed(user2Index), "User2 index should be marked as claimed");
    }

    // Test setting correct claimed status
    function testCorrectClaimedStatus() public {
        assertFalse(airdrop.isClaimed(user1Index), "Index should not be claimed before claim");

        vm.prank(user1);
        airdrop.claim(user1Index, user1Amount, user1Proof);

        assertTrue(airdrop.isClaimed(user1Index), "Index should be claimed after claim");
        assertFalse(airdrop.isClaimed(user2Index), "Different index should not be affected");
    }

    // Events for testing
    event Claimed(address indexed claimant, uint256 amount);

    function testBatchClaim() public {
        // Simulate that airdrop has started
        vm.warp(startTime + 1 days);

        // Create arrays for batch claim
        uint256[] memory indices = new uint256[](2);
        indices[0] = user1Index;
        indices[1] = user2Index;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = user1Amount;
        amounts[1] = user2Amount;

        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = user1Proof;
        proofs[1] = user2Proof;

        // Set up user1 for claim
        vm.startPrank(user1);

        // Verify proofs separately first
        bytes32 user1Node = keccak256(abi.encode(keccak256(abi.encode(user1Index, user1, user1Amount))));
        assertTrue(MerkleProof.verify(user1Proof, merkleRoot, user1Node), "User1 proof should verify");

        // Verify initial state
        assertEq(token.balanceOf(user1), 0);
        assertFalse(airdrop.isClaimed(user1Index));

        // Execute batch claim - should revert because user1 can't claim for user2
        vm.expectRevert(AirdropBase.InvalidMerkleProof.selector);
        airdrop.batchClaim(indices, amounts, proofs);

        vm.stopPrank();
    }

    function testSingleUserBatchClaim() public {
        // Simulate that airdrop has started
        vm.warp(startTime + 1 days);

        // Create arrays for batch claim with multiple indices for the same user
        uint256[] memory indices = new uint256[](1);
        indices[0] = user1Index;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = user1Amount;

        bytes32[][] memory proofs = new bytes32[][](1);
        proofs[0] = user1Proof;

        // Set up user1 for claim
        vm.startPrank(user1);

        // Verify initial state
        assertEq(token.balanceOf(user1), 0);
        assertFalse(airdrop.isClaimed(user1Index));

        // Execute batch claim
        airdrop.batchClaim(indices, amounts, proofs);

        // Verify final state
        assertEq(token.balanceOf(user1), user1Amount);
        assertTrue(airdrop.isClaimed(user1Index));

        vm.stopPrank();
    }

    function testBatchClaimWithMismatchedArrays() public {
        vm.warp(startTime + 1 days);

        // Set up mismatched arrays
        uint256[] memory indices = new uint256[](2);
        indices[0] = user1Index;
        indices[1] = user2Index;

        uint256[] memory amounts = new uint256[](1); // Only one amount
        amounts[0] = user1Amount;

        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = user1Proof;
        proofs[1] = user2Proof;

        vm.startPrank(user1);

        // Should revert with ArrayLengthMismatch
        vm.expectRevert(AirdropBase.ArrayLengthMismatch.selector);
        airdrop.batchClaim(indices, amounts, proofs);

        vm.stopPrank();
    }

    function testBatchClaimBeforeStartTime() public {
        // Deploy a new airdrop with future start time
        vm.startPrank(owner);
        StandardAirdrop futureAirdrop = new StandardAirdrop(
            address(token),
            merkleRoot,
            owner,
            block.timestamp + 1 days, // Start in the future
            block.timestamp + 2 days,
            trustedForwarder
        );
        token.transfer(address(futureAirdrop), 500 * 10 ** 18);
        vm.stopPrank();

        uint256[] memory indices = new uint256[](1);
        indices[0] = user1Index;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = user1Amount;

        bytes32[][] memory proofs = new bytes32[][](1);
        proofs[0] = user1Proof;

        vm.startPrank(user1);

        vm.expectRevert(StandardAirdrop.AirdropNotStarted.selector);
        futureAirdrop.batchClaim(indices, amounts, proofs);

        vm.stopPrank();
    }

    function testBatchClaimAfterEndTime() public {
        // Test claiming after end time (should revert)
        vm.warp(endTime + 1 hours);

        uint256[] memory indices = new uint256[](1);
        indices[0] = user1Index;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = user1Amount;

        bytes32[][] memory proofs = new bytes32[][](1);
        proofs[0] = user1Proof;

        vm.startPrank(user1);

        vm.expectRevert(StandardAirdrop.AirdropEnded.selector);
        airdrop.batchClaim(indices, amounts, proofs);

        vm.stopPrank();
    }
}
