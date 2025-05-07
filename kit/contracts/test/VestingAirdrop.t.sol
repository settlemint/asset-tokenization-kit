// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { VestingAirdrop } from "../contracts/VestingAirdrop.sol";
import { LinearVestingStrategy } from "../contracts/airdrop/strategies/LinearVestingStrategy.sol";
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

contract VestingAirdropTest is Test {
    VestingAirdrop public airdrop;
    LinearVestingStrategy public vestingStrategy;
    MockERC20 public token;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public trustedForwarder;

    // Claim period end
    uint256 public claimPeriodEnd;

    // Vesting parameters
    uint256 public vestingDuration = 365 days;
    uint256 public cliffDuration = 90 days;

    // Merkle tree data
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

    // Special index and proof for user1 to test multi-index claims
    uint256 public user1AltIndex = 5;
    uint256 public user1AltAmount = 150 * 10 ** 18;
    bytes32[] public user1AltProof;

    // Helper function to properly hash paired nodes in correct order
    function hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encode(a, b)) : keccak256(abi.encode(b, a));
    }

    function buildMerkleTree(bytes32[] memory leaves) internal pure returns (bytes32) {
        require(leaves.length > 0, "No leaves provided");

        // If only one leaf, it is the root
        if (leaves.length == 1) {
            return leaves[0];
        }

        // Calculate number of levels needed
        uint256 numLeaves = leaves.length;
        uint256 numLevels = 0;
        uint256 levelSize = numLeaves;
        while (levelSize > 1) {
            levelSize = (levelSize + 1) / 2;
            numLevels++;
        }

        // Build tree level by level
        bytes32[] memory currentLevel = leaves;
        for (uint256 level = 0; level < numLevels; level++) {
            uint256 currentLevelSize = currentLevel.length;
            uint256 nextLevelSize = (currentLevelSize + 1) / 2;
            bytes32[] memory nextLevel = new bytes32[](nextLevelSize);

            for (uint256 i = 0; i < currentLevelSize; i += 2) {
                bytes32 left = currentLevel[i];
                bytes32 right = i + 1 < currentLevelSize ? currentLevel[i + 1] : left;
                nextLevel[i / 2] = keccak256(abi.encodePacked(left, right));
            }

            currentLevel = nextLevel;
        }

        return currentLevel[0];
    }

    function setUp() public {
        vm.startPrank(owner);
        token = new MockERC20();

        // Set up time constraints
        claimPeriodEnd = block.timestamp + 30 days;

        // Set up trusted forwarder
        trustedForwarder = makeAddr("trustedForwarder");

        // Generate leaf nodes with double hashing for security
        bytes32[] memory leaves = new bytes32[](4); // Added an extra leaf for user1Alt
        // Double hash each leaf
        leaves[0] = keccak256(abi.encode(keccak256(abi.encode(user1Index, user1, user1Amount))));
        leaves[1] = keccak256(abi.encode(keccak256(abi.encode(user2Index, user2, user2Amount))));
        leaves[2] = keccak256(abi.encode(keccak256(abi.encode(user3Index, user3, user3Amount))));
        // Add extra leaf for user1's alternate index
        leaves[3] = keccak256(abi.encode(keccak256(abi.encode(user1AltIndex, user1, user1AltAmount))));

        // Build merkle tree (simplified version for testing purposes)
        bytes32[] memory level = new bytes32[](4);
        level[0] = leaves[0];
        level[1] = leaves[1];
        level[2] = leaves[2];
        level[3] = leaves[3];

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
        user3Proof[0] = leaves[3]; // Sibling node
        user3Proof[1] = nextLevel[0]; // Next level node

        // User1Alt proof
        user1AltProof = new bytes32[](2);
        user1AltProof[0] = leaves[2]; // Sibling node
        user1AltProof[1] = nextLevel[0]; // Next level node

        // Create vesting strategy for testing
        vestingStrategy = new LinearVestingStrategy(vestingDuration, cliffDuration, owner, trustedForwarder);

        // Deploy the vesting airdrop
        airdrop = new VestingAirdrop(
            address(token), merkleRoot, owner, address(vestingStrategy), claimPeriodEnd, trustedForwarder
        );

        // Fund the airdrop contract
        token.transfer(address(airdrop), 1000 * 10 ** 18);

        vm.stopPrank();
    }

    // Test constructor constraints
    function testConstructorRequiresValidStrategy() public {
        vm.startPrank(owner);
        vm.expectRevert("Invalid claim strategy");
        new VestingAirdrop(
            address(token),
            merkleRoot,
            owner,
            address(0), // Zero address for strategy, should revert
            claimPeriodEnd,
            trustedForwarder
        );
        vm.stopPrank();
    }

    function testConstructorRequiresFutureClaimPeriodEnd() public {
        vm.startPrank(owner);
        vm.expectRevert("Claim period must be in the future");
        new VestingAirdrop(
            address(token),
            merkleRoot,
            owner,
            address(vestingStrategy),
            block.timestamp - 1, // claimPeriodEnd in the past, should revert
            trustedForwarder
        );
        vm.stopPrank();
    }

    // Test claiming with vesting strategy
    function testInitialClaimWithVestingStrategy() public {
        vm.startPrank(user1);

        // Verify initial state
        (
            uint256 totalAmountBefore,
            uint256 claimedAmountBefore, // Skip vestedAmount // Skip claimableAmount // Skip startTimestamp
            ,
            ,
            ,
            bool initializedBefore
        ) = vestingStrategy.getVestingStatus(user1);
        assertEq(totalAmountBefore, 0, "Initial total amount should be 0");
        assertEq(claimedAmountBefore, 0, "Initial claimed amount should be 0");
        assertFalse(initializedBefore, "User1 should not be initialized");

        // Initialize vesting for user1
        uint256 timeBeforeInit = block.timestamp;
        airdrop.claim(user1Index, user1Amount, user1Proof);
        uint256 timeAfterInit = block.timestamp;

        // Verify vesting has been initialized
        (
            uint256 totalAmountAfter,
            uint256 claimedAmountAfter, // Skip vestedAmount // Skip claimableAmount
            ,
            ,
            uint256 startTimestampAfter,
            bool initializedAfter
        ) = vestingStrategy.getVestingStatus(user1);
        assertEq(totalAmountAfter, user1Amount, "Total amount should be set correctly");

        // Check start timestamp was set correctly
        assertTrue(
            startTimestampAfter >= timeBeforeInit && startTimestampAfter <= timeAfterInit, "Start timestamp incorrect"
        );

        // If there's no cliff, some amount might be immediately claimable
        if (cliffDuration == 0) {
            // Need to recalculate expected initial claim based on LinearVestingStrategy logic
            uint256 expectedInitial = 0;
            if (vestingDuration > 0) {
                expectedInitial = (user1Amount * 1) / vestingDuration; // Based on 1 sec elapsed in init
                if (expectedInitial > user1Amount) {
                    expectedInitial = user1Amount;
                }
            }
            // Check balance change or claimedAmountAfter from strategy state
            assertEq(claimedAmountAfter, expectedInitial, "Claimed amount mismatch for no cliff");
        } else {
            assertEq(claimedAmountAfter, 0, "Claimed amount should still be 0 with cliff");
        }
        assertTrue(initializedAfter, "Vesting should be initialized");

        vm.stopPrank();
    }

    // Test setting a new claim strategy
    function testSetClaimStrategy() public {
        vm.startPrank(owner);

        // Deploy a new strategy with different parameters
        LinearVestingStrategy newStrategy =
            new LinearVestingStrategy(vestingDuration + 100, cliffDuration, owner, trustedForwarder);

        // Set the new strategy
        airdrop.setClaimStrategy(address(newStrategy));

        // Verify the strategy was updated
        assertEq(address(airdrop.claimStrategy()), address(newStrategy), "Strategy should be updated");

        vm.stopPrank();
    }

    // Test only owner can set strategy
    function testSetClaimStrategyRequiresOwner() public {
        vm.startPrank(user1);

        // Non-owner attempts to set strategy
        vm.expectRevert(); // Will revert with Ownable error
        airdrop.setClaimStrategy(address(0x123));

        vm.stopPrank();
    }

    // Test strategy validation
    function testSetClaimStrategyRequiresValidAddress() public {
        vm.startPrank(owner);

        // Set zero address should fail
        vm.expectRevert("Invalid claim strategy");
        airdrop.setClaimStrategy(address(0));

        vm.stopPrank();
    }

    // Test batch claim with vesting strategy
    function testBatchClaimWithVestingStrategy() public {
        vm.startPrank(user1);

        // Prepare batch claim data - for user1's two indices
        uint256[] memory indices = new uint256[](2);
        indices[0] = user1Index;
        indices[1] = user1AltIndex;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = user1Amount;
        amounts[1] = user1AltAmount;

        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = user1Proof;
        proofs[1] = user1AltProof;

        // Initial vesting status should be uninitialized
        (
            uint256 totalAmountBefore, // Skip claimedAmountBefore // Skip vestedAmountBefore // Skip
                // claimableAmountBefore // Skip startTimestampBefore
            ,
            ,
            ,
            ,
            bool initializedBefore
        ) = vestingStrategy.getVestingStatus(user1);
        assertEq(totalAmountBefore, 0, "Initial total amount should be 0");
        assertFalse(initializedBefore, "User1 should not be initialized");

        // Execute batch claim
        uint256 timeBeforeInit = block.timestamp;
        airdrop.batchClaim(indices, amounts, proofs);
        uint256 timeAfterInit = block.timestamp;

        // Verify vesting has been initialized and total amount includes both claims
        (
            uint256 totalAmountAfter,
            uint256 claimedAmountAfter, // Skip vestedAmountAfter // Skip claimableAmountAfter
            ,
            ,
            uint256 startTimestampAfter,
            bool initializedAfter
        ) = vestingStrategy.getVestingStatus(user1);

        assertEq(totalAmountAfter, user1Amount + user1AltAmount, "Total amount should include both claims");

        // Check start timestamp was set correctly (should be from the first init in batch)
        assertTrue(
            startTimestampAfter >= timeBeforeInit && startTimestampAfter <= timeAfterInit,
            "Start timestamp incorrect after batch"
        );

        // If there's no cliff, some amount might be immediately claimable based on totalAmount
        if (cliffDuration == 0) {
            // Need to recalculate expected initial claim based on LinearVestingStrategy logic for batch
            uint256 expectedInitial = 0;
            uint256 totalBatchAmount = user1Amount + user1AltAmount;
            if (vestingDuration > 0) {
                // Logic from initializeVesting for batch:
                uint256 timeElapsed = 1; // Assumes ~1 sec elapsed during init
                expectedInitial = (totalBatchAmount * timeElapsed) / vestingDuration;
                if (expectedInitial > totalBatchAmount) {
                    expectedInitial = totalBatchAmount;
                }
            }
            // Check balance change or claimedAmountAfter from strategy state
            assertEq(claimedAmountAfter, expectedInitial, "Batch claimed amount mismatch for no cliff");
        } else {
            // With cliff, initial claimed amount should still be 0 after batch init
            assertEq(claimedAmountAfter, 0, "Batch claimed amount should be 0 with cliff");
        }

        assertTrue(initializedAfter, "Vesting should be initialized after batch");

        vm.stopPrank();
    }

    // Test owner can withdraw tokens
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
        vm.expectRevert(); // Will revert with Ownable error
        airdrop.withdrawTokens(user1);
        vm.stopPrank();
    }
}
