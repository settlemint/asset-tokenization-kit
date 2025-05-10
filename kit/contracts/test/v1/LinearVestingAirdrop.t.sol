// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { VestingAirdrop } from "../../contracts/v1/VestingAirdrop.sol";
import { LinearVestingStrategy } from "../../contracts/v1/airdrop/strategies/LinearVestingStrategy.sol";
import { AirdropBase } from "../../contracts/v1/airdrop/AirdropBase.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }
}

contract LinearVestingAirdropTest is Test {
    VestingAirdrop public airdrop;
    LinearVestingStrategy public vestingStrategy;
    MockERC20 public token;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public trustedForwarder;

    // Vesting parameters
    uint256 public vestingDuration = 365 days;
    uint256 public cliffDuration = 90 days;
    uint256 public claimPeriodEnd;

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

    // Special proof for user1 with different index (for testing multiple claims per user)
    uint256 public user1AltIndex = 5;
    uint256 public user1AltAmount = 150 * 10 ** 18;
    bytes32[] public user1AltProof;

    // Helper function to properly hash paired nodes in correct order
    function hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encode(a, b)) : keccak256(abi.encode(b, a));
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
        // New leaf for user1 with alternate index/amount
        leaves[3] = keccak256(abi.encode(keccak256(abi.encode(user1AltIndex, user1, user1AltAmount))));

        // Build merkle tree (simplified version for testing purposes)
        // For leaf nodes with odd length, duplicate the last element
        bytes32[] memory level = new bytes32[](4); // Ensure even length by padding
        level[0] = leaves[0];
        level[1] = leaves[1];
        level[2] = leaves[2];
        level[3] = leaves[3]; // Use the new leaf instead of duplication

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
        user3Proof[0] = leaves[3]; // Sibling node - now uses user1Alt leaf
        user3Proof[1] = nextLevel[0]; // Next level node

        // User1Alt proof
        user1AltProof = new bytes32[](2);
        user1AltProof[0] = leaves[2]; // Sibling node
        user1AltProof[1] = nextLevel[0]; // Next level node

        // Deploy vesting strategy
        vestingStrategy = new LinearVestingStrategy(vestingDuration, cliffDuration, owner, trustedForwarder);

        // Deploy vesting airdrop with linear vesting strategy
        airdrop = new VestingAirdrop(
            address(token), merkleRoot, owner, address(vestingStrategy), claimPeriodEnd, trustedForwarder
        );

        // Fund the airdrop contract
        token.transfer(address(airdrop), 1000 * 10 ** 18);

        vm.stopPrank();
    }

    // Test constructor constraints
    function testConstructorRequiresPositiveVestingDuration() public {
        vm.startPrank(owner);
        vm.expectRevert("Vesting duration must be positive");
        new LinearVestingStrategy(
            0, // vestingDuration = 0, should revert
            cliffDuration,
            owner,
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

    // Test initializing vesting with valid proof
    function testInitializeVesting() public {
        vm.startPrank(user1);
        uint256 timeBeforeInit = block.timestamp;

        // Initialize vesting
        airdrop.claim(user1Index, user1Amount, user1Proof);
        uint256 timeAfterInit = block.timestamp;

        // Verify vesting has been initialized using the strategy's getter
        (
            uint256 totalAmount,
            uint256 claimedAmount, // Skip vestedAmount // Skip claimableAmount
            ,
            ,
            uint256 startTimestamp,
            bool initialized
        ) = vestingStrategy.getVestingStatus(user1);

        assertEq(totalAmount, user1Amount, "Total amount should be set correctly");
        // Claimed amount might be non-zero if cliff=0, check relative to expected
        // In setUp, cliff is 90 days, so claimedAmount should be 0 initially.
        assertEq(claimedAmount, 0, "Claimed amount should start at 0 (with cliff)");
        assertTrue(initialized, "Vesting should be initialized");

        // Check that the start timestamp is the block timestamp during initialization
        assertTrue(startTimestamp >= timeBeforeInit && startTimestamp <= timeAfterInit, "Start timestamp incorrect");

        // Cannot directly check VestingAirdrop's internal mappings
        // // Check VestingAirdrop's internal state as well
        // assertTrue(
        //     airdrop.initializedClaims(user1Index),
        //     "VestingAirdrop should mark index as initialized"
        // );
        //  assertEq(
        //      airdrop.claimTimestamps(user1Index),
        //      startTimestamp,
        //     "VestingAirdrop timestamp should match strategy"
        //  );

        vm.stopPrank();
    }

    // Test claiming after cliff period
    function testClaimAfterCliff() public {
        vm.startPrank(user1);

        // Initialize vesting
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Fast forward past cliff
        vm.warp(block.timestamp + cliffDuration + 1 days);

        // Get balance before claim
        uint256 balanceBefore = token.balanceOf(user1);

        // Claim vested tokens
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance after claim
        uint256 balanceAfter = token.balanceOf(user1);
        uint256 claimed = balanceAfter - balanceBefore;

        // Assert some tokens were claimed
        assertGt(claimed, 0, "Should have claimed some tokens");

        // Roughly 91/365 days passed, so approximately 25% should be vested
        uint256 expectedVested = (user1Amount * (cliffDuration + 1 days)) / vestingDuration;
        assertApproxEqRel(claimed, expectedVested, 0.01e18, "Incorrect vested amount");

        vm.stopPrank();
    }

    // Test claiming after vesting is complete
    function testClaimAfterFullVesting() public {
        vm.startPrank(user1);

        // Initialize vesting
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Fast forward past full vesting duration
        vm.warp(block.timestamp + vestingDuration + 1 days);

        // Get balance before claim
        uint256 balanceBefore = token.balanceOf(user1);

        // Claim vested tokens
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance after claim
        uint256 balanceAfter = token.balanceOf(user1);
        uint256 claimed = balanceAfter - balanceBefore;

        // All tokens should be claimed
        assertEq(claimed, user1Amount, "All tokens should be claimed after full vesting");

        vm.stopPrank();
    }

    // Test claiming multiple times
    function testMultipleClaims() public {
        vm.startPrank(user1);

        // Initialize vesting
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Fast forward to middle of vesting period
        uint256 halfwayPoint = vestingDuration / 2;
        vm.warp(block.timestamp + cliffDuration + halfwayPoint);

        // Get balance before claim
        uint256 balanceBefore = token.balanceOf(user1);

        // First claim at halfway
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance after claim
        uint256 balanceAfter = token.balanceOf(user1);
        uint256 claimed = balanceAfter - balanceBefore;

        // Check roughly half the tokens are claimed
        uint256 expectedHalfway = (user1Amount * (cliffDuration + halfwayPoint)) / vestingDuration;
        assertApproxEqRel(
            claimed,
            expectedHalfway,
            0.01e18, // 1% tolerance
            "Should have claimed roughly half the tokens"
        );

        // Fast forward to the end of vesting
        vm.warp(block.timestamp + halfwayPoint);

        // Get balance before final claim
        balanceBefore = token.balanceOf(user1);

        // Second claim at end
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance after final claim
        balanceAfter = token.balanceOf(user1);
        claimed = balanceAfter - balanceBefore;

        // Verify all remaining tokens are claimed
        uint256 remaining = user1Amount - expectedHalfway;
        assertApproxEqRel(claimed, remaining, 0.01e18, "All remaining tokens should be claimed after full vesting");

        vm.stopPrank();
    }

    // Test claiming before cliff period - LinearVestingStrategy behaves differently
    // than VestingAirdrop for claims before cliff
    function testCannotClaimBeforeCliff() public {
        vm.startPrank(user1);

        // Initialize vesting
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance before attempt to claim again
        uint256 balanceBefore = token.balanceOf(user1);

        // Try to claim again before cliff (should not revert but transfer 0 tokens)
        airdrop.claim(user1Index, user1Amount, user1Proof);

        // Get balance after claim attempt
        uint256 balanceAfter = token.balanceOf(user1);

        // User should not have received any tokens
        assertEq(balanceAfter, balanceBefore, "User should not receive tokens before cliff");

        vm.stopPrank();
    }

    // Test attempting to claim with invalid proof
    function testCannotClaimWithInvalidProof() public {
        vm.startPrank(user1);

        // Try to claim with user2's proof (should revert)
        vm.expectRevert(AirdropBase.InvalidMerkleProof.selector);
        airdrop.claim(user1Index, user1Amount, user2Proof);

        vm.stopPrank();
    }

    // Test attempting to claim after claim period ends
    function testCannotInitializeAfterClaimPeriodEnds() public {
        // Fast forward past claim period end
        vm.warp(claimPeriodEnd + 1);

        vm.startPrank(user1);

        // Try to initialize vesting (should revert)
        vm.expectRevert(VestingAirdrop.ClaimPeriodEnded.selector);
        airdrop.claim(user1Index, user1Amount, user1Proof);

        vm.stopPrank();
    }

    // Test that we can change the claim strategy
    function testChangeClaimStrategy() public {
        vm.startPrank(owner);

        // Deploy a new vesting strategy with different parameters
        LinearVestingStrategy newStrategy = new LinearVestingStrategy(
            730 days, // 2 years
            180 days, // 6 months cliff
            owner,
            trustedForwarder
        );

        // Update the claim strategy
        airdrop.setClaimStrategy(address(newStrategy));

        // Verify the strategy was updated
        assertEq(address(airdrop.claimStrategy()), address(newStrategy), "Claim strategy should be updated");

        vm.stopPrank();
    }
}
