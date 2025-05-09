// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { PushAirdrop } from "../../contracts/v1/PushAirdrop.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }
}

contract PushAirdropTest is Test {
    PushAirdrop public airdrop;
    MockERC20 public token;
    address public owner = address(0x1);
    address public recipient1 = address(0x2);
    address public recipient2 = address(0x3);
    address public recipient3 = address(0x4);
    address public trustedForwarder;

    // Merkle tree data
    bytes32 public merkleRoot;
    uint256 public distributionCap = 1000 * 10 ** 18;

    // Distribution data
    uint256 public recipient1Amount = 100 * 10 ** 18;
    bytes32[] public recipient1Proof;

    uint256 public recipient2Amount = 200 * 10 ** 18;
    bytes32[] public recipient2Proof;

    uint256 public recipient3Amount = 300 * 10 ** 18;
    bytes32[] public recipient3Proof;

    // Helper function to properly hash paired nodes in correct order
    function hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? keccak256(abi.encode(a, b)) : keccak256(abi.encode(b, a));
    }

    function setUp() public {
        vm.startPrank(owner);
        token = new MockERC20();

        // Set up trusted forwarder
        trustedForwarder = makeAddr("trustedForwarder");

        // Generate leaf nodes with double hashing for security
        bytes32[] memory leaves = new bytes32[](3);

        // Double hash each leaf (recipient + amount)
        leaves[0] = keccak256(abi.encode(keccak256(abi.encode(recipient1, recipient1Amount))));
        leaves[1] = keccak256(abi.encode(keccak256(abi.encode(recipient2, recipient2Amount))));
        leaves[2] = keccak256(abi.encode(keccak256(abi.encode(recipient3, recipient3Amount))));

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

        // Recipient1 proof
        recipient1Proof = new bytes32[](2);
        recipient1Proof[0] = leaves[1]; // Sibling node
        recipient1Proof[1] = nextLevel[1]; // Next level node

        // Recipient2 proof
        recipient2Proof = new bytes32[](2);
        recipient2Proof[0] = leaves[0]; // Sibling node
        recipient2Proof[1] = nextLevel[1]; // Next level node

        // Recipient3 proof
        recipient3Proof = new bytes32[](2);
        recipient3Proof[0] = leaves[2]; // Sibling to itself (duplicated leaf)
        recipient3Proof[1] = nextLevel[0]; // Next level node

        // Deploy airdrop contract
        airdrop = new PushAirdrop(address(token), merkleRoot, owner, distributionCap, trustedForwarder);

        // Fund the airdrop contract
        token.transfer(address(airdrop), 1000 * 10 ** 18);

        vm.stopPrank();
    }

    // Test constructor with zero address
    function testConstructorRequiresValidTokenAddress() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        new PushAirdrop(
            address(0), // zero address
            merkleRoot,
            owner,
            distributionCap,
            trustedForwarder
        );
        vm.stopPrank();
    }

    // Test updateMerkleRoot
    function testUpdateMerkleRoot() public {
        bytes32 newRoot = bytes32(uint256(0xbeefcafe)); // Fixed conversion

        // Should fail when not owner
        vm.startPrank(recipient1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, recipient1));
        airdrop.updateMerkleRoot(newRoot);
        vm.stopPrank();

        // Should succeed when owner
        vm.startPrank(owner);
        vm.expectEmit(false, false, false, true);
        emit PushAirdrop.MerkleRootUpdated(merkleRoot, newRoot);
        airdrop.updateMerkleRoot(newRoot);
        assertEq(airdrop.merkleRoot(), newRoot);
        vm.stopPrank();
    }

    // Test updateDistributionCap
    function testUpdateDistributionCap() public {
        uint256 newCap = 2000 * 10 ** 18;

        // Should fail when not owner
        vm.startPrank(recipient1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, recipient1));
        airdrop.updateDistributionCap(newCap);
        vm.stopPrank();

        // Should succeed when owner
        vm.startPrank(owner);
        vm.expectEmit(false, false, false, true);
        emit PushAirdrop.DistributionCapUpdated(distributionCap, newCap);
        airdrop.updateDistributionCap(newCap);
        assertEq(airdrop.distributionCap(), newCap);
        vm.stopPrank();
    }

    // Test single distribution
    function testDistribute() public {
        vm.startPrank(owner);

        // Verify proof is valid
        bytes32 recipient1Node = keccak256(abi.encode(keccak256(abi.encode(recipient1, recipient1Amount))));
        assertTrue(MerkleProof.verify(recipient1Proof, merkleRoot, recipient1Node), "Recipient1 proof should verify");

        // Initial balances
        uint256 initialRecipientBalance = token.balanceOf(recipient1);
        uint256 initialAirdropBalance = token.balanceOf(address(airdrop));

        vm.expectEmit(true, false, false, true);
        emit PushAirdrop.TokensDistributed(recipient1, recipient1Amount);
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);

        // Check balances
        assertEq(token.balanceOf(recipient1), initialRecipientBalance + recipient1Amount);
        assertEq(token.balanceOf(address(airdrop)), initialAirdropBalance - recipient1Amount);

        // Check state
        assertTrue(airdrop.distributed(recipient1));
        assertEq(airdrop.totalDistributed(), recipient1Amount);

        // Distributing to the same address should fail
        vm.expectRevert(abi.encodeWithSignature("AlreadyDistributed()"));
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);

        vm.stopPrank();
    }

    // Test distribution with invalid proof
    function testDistributeWithInvalidProof() public {
        vm.startPrank(owner);

        // Create an invalid proof
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = bytes32(uint256(0xdeadbeef));

        vm.expectRevert(abi.encodeWithSignature("InvalidMerkleProof()"));
        airdrop.distribute(recipient1, recipient1Amount, invalidProof);

        vm.stopPrank();
    }

    // Test batch distribution
    function testBatchDistribute() public {
        vm.startPrank(owner);

        // Set up address arrays for batch
        address[] memory recipients = new address[](3);
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        recipients[2] = recipient3;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = recipient1Amount;
        amounts[1] = recipient2Amount;
        amounts[2] = recipient3Amount;

        bytes32[][] memory proofs = new bytes32[][](3);
        proofs[0] = recipient1Proof;
        proofs[1] = recipient2Proof;
        proofs[2] = recipient3Proof;

        // Initial balances
        uint256 initialRecipient1Balance = token.balanceOf(recipient1);
        uint256 initialRecipient2Balance = token.balanceOf(recipient2);
        uint256 initialRecipient3Balance = token.balanceOf(recipient3);
        uint256 initialAirdropBalance = token.balanceOf(address(airdrop));

        uint256 totalAmount = recipient1Amount + recipient2Amount + recipient3Amount;

        vm.expectEmit(true, false, false, true);
        emit PushAirdrop.TokensDistributed(recipient1, recipient1Amount);

        vm.expectEmit(true, false, false, true);
        emit PushAirdrop.TokensDistributed(recipient2, recipient2Amount);

        vm.expectEmit(true, false, false, true);
        emit PushAirdrop.TokensDistributed(recipient3, recipient3Amount);

        vm.expectEmit(false, false, false, true);
        emit PushAirdrop.BatchDistributed(3, totalAmount);

        airdrop.batchDistribute(recipients, amounts, proofs);

        // Check balances
        assertEq(token.balanceOf(recipient1), initialRecipient1Balance + recipient1Amount);
        assertEq(token.balanceOf(recipient2), initialRecipient2Balance + recipient2Amount);
        assertEq(token.balanceOf(recipient3), initialRecipient3Balance + recipient3Amount);
        assertEq(token.balanceOf(address(airdrop)), initialAirdropBalance - totalAmount);

        // Check state
        assertTrue(airdrop.distributed(recipient1));
        assertTrue(airdrop.distributed(recipient2));
        assertTrue(airdrop.distributed(recipient3));
        assertEq(airdrop.totalDistributed(), totalAmount);

        vm.stopPrank();
    }

    // Test batch distribution exceeding MAX_BATCH_SIZE
    function testBatchDistributeMaxSizeLimit() public {
        vm.startPrank(owner);

        // Create arrays with MAX_BATCH_SIZE + 1 elements
        uint256 maxSize = airdrop.MAX_BATCH_SIZE();
        uint256 tooLargeSize = maxSize + 1;

        address[] memory recipients = new address[](tooLargeSize);
        uint256[] memory amounts = new uint256[](tooLargeSize);
        bytes32[][] memory proofs = new bytes32[][](tooLargeSize);

        // Fill arrays with some values
        for (uint256 i = 0; i < tooLargeSize; i++) {
            recipients[i] = address(uint160(i + 1000)); // Use different addresses
            amounts[i] = 1 ether;
            proofs[i] = new bytes32[](0); // Empty proofs for this test
        }

        // Should fail due to batch size limit
        vm.expectRevert(abi.encodeWithSignature("BatchSizeTooLarge()"));
        airdrop.batchDistribute(recipients, amounts, proofs);

        vm.stopPrank();
    }

    // Test markAsDistributed exceeding MAX_BATCH_SIZE
    function testMarkAsDistributedMaxSizeLimit() public {
        vm.startPrank(owner);

        // Create array with MAX_BATCH_SIZE + 1 elements
        uint256 maxSize = airdrop.MAX_BATCH_SIZE();
        uint256 tooLargeSize = maxSize + 1;

        address[] memory recipients = new address[](tooLargeSize);

        // Fill array with addresses
        for (uint256 i = 0; i < tooLargeSize; i++) {
            recipients[i] = address(uint160(i + 1000));
        }

        // Should fail due to batch size limit
        vm.expectRevert(abi.encodeWithSignature("BatchSizeTooLarge()"));
        airdrop.markAsDistributed(recipients);

        vm.stopPrank();
    }

    // Test batch with mismatched array lengths
    function testBatchWithMismatchedArrayLengths() public {
        vm.startPrank(owner);

        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = recipient1Amount;
        amounts[1] = recipient2Amount;
        amounts[2] = recipient3Amount;

        bytes32[][] memory proofs = new bytes32[][](3);
        proofs[0] = recipient1Proof;
        proofs[1] = recipient2Proof;
        proofs[2] = recipient3Proof;

        vm.expectRevert(abi.encodeWithSignature("ArrayLengthMismatch()"));
        airdrop.batchDistribute(recipients, amounts, proofs);

        vm.stopPrank();
    }

    // Test batch distribution with skipping already distributed
    function testBatchDistributeSkipsAlreadyDistributed() public {
        vm.startPrank(owner);

        // First distribute to recipient1
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);

        // Set up batch that includes recipient1
        address[] memory recipients = new address[](3);
        recipients[0] = recipient1; // Already distributed
        recipients[1] = recipient2;
        recipients[2] = recipient3;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = recipient1Amount;
        amounts[1] = recipient2Amount;
        amounts[2] = recipient3Amount;

        bytes32[][] memory proofs = new bytes32[][](3);
        proofs[0] = recipient1Proof;
        proofs[1] = recipient2Proof;
        proofs[2] = recipient3Proof;

        // Only recipient2 and recipient3 amounts should be distributed
        uint256 expectedDistributedAmount = recipient2Amount + recipient3Amount;
        uint256 initialTotalDistributed = airdrop.totalDistributed();

        vm.expectEmit(false, false, false, true);
        emit PushAirdrop.BatchDistributed(2, expectedDistributedAmount);

        airdrop.batchDistribute(recipients, amounts, proofs);

        // Check total distributed increased by the right amount
        assertEq(airdrop.totalDistributed(), initialTotalDistributed + expectedDistributedAmount);

        vm.stopPrank();
    }

    // Test batch distribution with invalid proofs
    function testBatchDistributeSkipsInvalidProofs() public {
        vm.startPrank(owner);

        address[] memory recipients = new address[](3);
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        recipients[2] = recipient3;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = recipient1Amount;
        amounts[1] = recipient2Amount;
        amounts[2] = recipient3Amount;

        // Create invalid proof for recipient2
        bytes32[][] memory proofs = new bytes32[][](3);
        proofs[0] = recipient1Proof;
        proofs[1] = new bytes32[](1); // Invalid proof
        proofs[1][0] = bytes32(uint256(0xdeadbeef));
        proofs[2] = recipient3Proof;

        // Only recipient1 and recipient3 should be distributed
        uint256 expectedDistributedAmount = recipient1Amount + recipient3Amount;

        vm.expectEmit(false, false, false, true);
        emit PushAirdrop.BatchDistributed(2, expectedDistributedAmount);

        airdrop.batchDistribute(recipients, amounts, proofs);

        // Check distributions
        assertTrue(airdrop.distributed(recipient1));
        assertFalse(airdrop.distributed(recipient2)); // Should be skipped due to invalid proof
        assertTrue(airdrop.distributed(recipient3));

        assertEq(airdrop.totalDistributed(), expectedDistributedAmount);

        vm.stopPrank();
    }

    // Test distribution cap enforcement
    function testDistributionCapEnforcement() public {
        vm.startPrank(owner);

        // Set a lower cap
        uint256 lowerCap = recipient1Amount + recipient2Amount - 1; // Just below what we need
        airdrop.updateDistributionCap(lowerCap);

        // Distribute to recipient1
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);

        // Attempt to distribute to recipient2, should fail due to cap
        vm.expectRevert(abi.encodeWithSignature("DistributionCapExceeded()"));
        airdrop.distribute(recipient2, recipient2Amount, recipient2Proof);

        // Should fail in batch too
        address[] memory recipients = new address[](2);
        recipients[0] = recipient2;
        recipients[1] = recipient3;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = recipient2Amount;
        amounts[1] = recipient3Amount;

        bytes32[][] memory proofs = new bytes32[][](2);
        proofs[0] = recipient2Proof;
        proofs[1] = recipient3Proof;

        vm.expectRevert(abi.encodeWithSignature("DistributionCapExceeded()"));
        airdrop.batchDistribute(recipients, amounts, proofs);

        vm.stopPrank();
    }

    // Test markAsDistributed
    function testMarkAsDistributed() public {
        vm.startPrank(owner);

        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;

        assertFalse(airdrop.distributed(recipient1));
        assertFalse(airdrop.distributed(recipient2));

        airdrop.markAsDistributed(recipients);

        assertTrue(airdrop.distributed(recipient1));
        assertTrue(airdrop.distributed(recipient2));

        // Should not affect distribution tracker
        assertEq(airdrop.totalDistributed(), 0);

        // Should not allow distributing to marked addresses
        vm.expectRevert(abi.encodeWithSignature("AlreadyDistributed()"));
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);

        vm.stopPrank();
    }

    // Test withdrawTokens
    function testWithdrawTokens() public {
        vm.startPrank(owner);

        address withdrawTo = makeAddr("withdrawDestination");
        uint256 initialBalance = token.balanceOf(address(airdrop));

        vm.expectEmit(true, false, false, true);
        emit PushAirdrop.TokensWithdrawn(withdrawTo, initialBalance);

        airdrop.withdrawTokens(withdrawTo);

        assertEq(token.balanceOf(withdrawTo), initialBalance);
        assertEq(token.balanceOf(address(airdrop)), 0);

        vm.stopPrank();
    }

    // Test withdrawTokens with zero address
    function testWithdrawTokensZeroAddressReverts() public {
        vm.startPrank(owner);

        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        airdrop.withdrawTokens(address(0));

        vm.stopPrank();
    }

    // Test Merkle proof verification
    function testMerkleProofVerification() public view {
        // Direct verification test
        bytes32 recipient1Node = keccak256(abi.encode(keccak256(abi.encode(recipient1, recipient1Amount))));
        assertTrue(MerkleProof.verify(recipient1Proof, merkleRoot, recipient1Node), "Recipient1 proof should verify");

        bytes32 recipient2Node = keccak256(abi.encode(keccak256(abi.encode(recipient2, recipient2Amount))));
        assertTrue(MerkleProof.verify(recipient2Proof, merkleRoot, recipient2Node), "Recipient2 proof should verify");

        bytes32 recipient3Node = keccak256(abi.encode(keccak256(abi.encode(recipient3, recipient3Amount))));
        assertTrue(MerkleProof.verify(recipient3Proof, merkleRoot, recipient3Node), "Recipient3 proof should verify");
    }

    // Test ERC2771 trusted forwarder
    function testTrustedForwarder() public view {
        assertEq(address(airdrop.trustedForwarder()), trustedForwarder);
    }

    // Test isDistributed public getter
    function testIsDistributed() public {
        assertFalse(airdrop.isDistributed(recipient1));

        vm.startPrank(owner);
        airdrop.distribute(recipient1, recipient1Amount, recipient1Proof);
        vm.stopPrank();

        assertTrue(airdrop.isDistributed(recipient1));
    }

    // Test accessing MAX_BATCH_SIZE constant
    function testMaxBatchSizeConstant() public view {
        uint256 maxBatchSize = airdrop.MAX_BATCH_SIZE();
        assertEq(maxBatchSize, 100);
    }
}
