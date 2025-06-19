// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { AbstractATKAssetTest } from "../../assets/AbstractATKAssetTest.sol";
import { ATKVestingAirdropImplementation } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropImplementation.sol";
import { ATKVestingAirdropFactoryImplementation } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropFactoryImplementation.sol";
import { IATKVestingAirdropFactory } from
    "../../../contracts/system/airdrop/vesting-airdrop/IATKVestingAirdropFactory.sol";
import { IATKVestingAirdrop } from "../../../contracts/system/airdrop/vesting-airdrop/IATKVestingAirdrop.sol";
import { ATKLinearVestingStrategy } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKLinearVestingStrategy.sol";
import { IATKVestingStrategy } from "../../../contracts/system/airdrop/vesting-airdrop/IATKVestingStrategy.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    InitializationDeadlinePassed,
    ClaimNotEligible,
    ZeroAmountToTransfer,
    InvalidVestingStrategyAddress,
    InvalidInitializationDeadline,
    InvalidVestingStrategy,
    VestingNotInitialized,
    VestingAlreadyInitialized,
    CliffExceedsVestingDuration
} from "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropErrors.sol";
import {
    InvalidMerkleProof,
    InvalidInputArrayLengths,
    BatchSizeExceedsLimit
} from "../../../contracts/system/airdrop/ATKAirdropErrors.sol";

/// @title ATK Vesting Airdrop Test
/// @notice Comprehensive test suite for ATKVestingAirdropImplementation contract
contract ATKVestingAirdropTest is AbstractATKAssetTest {
    IATKVestingAirdropFactory public vestingAirdropFactory;
    IATKVestingAirdrop public vestingAirdrop;
    ATKLinearVestingStrategy public vestingStrategy;
    MockedERC20Token public token;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    bytes32 public merkleRoot;
    uint256 public constant TOTAL_SUPPLY = 1000 ether;
    uint256 public constant USER1_AMOUNT = 100 ether;
    uint256 public constant USER2_AMOUNT = 200 ether;
    uint256 public constant USER3_AMOUNT = 300 ether;
    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public constant CLIFF_DURATION = 30 days;
    uint256 public initializationDeadline;

    // Merkle tree data
    mapping(address => uint256) public allocations;
    mapping(address => uint256) public indices;
    mapping(address => bytes32[]) public proofs;

    // Events
    event VestingInitialized(address indexed account, uint256 totalAmount, uint256 index);
    event VestingStrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event Claimed(address indexed claimant, uint256 amount, uint256 index);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        vm.label(owner, "Owner");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
        vm.label(user3, "User3");

        // Initialize ATK system
        setUpATK(owner);

        // Deploy contracts
        token = new MockedERC20Token("Test Token", "TEST", 18);
        vestingStrategy = new ATKLinearVestingStrategy(VESTING_DURATION, CLIFF_DURATION);

        // Set up the Vesting Airdrop Factory
        ATKVestingAirdropFactoryImplementation vestingAirdropFactoryImpl =
            new ATKVestingAirdropFactoryImplementation(address(forwarder));

        vm.startPrank(platformAdmin);

        // Encode initialization data for the factory
        bytes memory encodedInitializationData = abi.encodeWithSelector(
            ATKVestingAirdropFactoryImplementation.initialize.selector, address(systemUtils.system()), platformAdmin
        );

        // Create system addon for vesting airdrop factory
        vestingAirdropFactory = IATKVestingAirdropFactory(
            systemUtils.systemAddonRegistry().registerSystemAddon(
                "vesting-airdrop-factory", address(vestingAirdropFactoryImpl), encodedInitializationData
            )
        );

        // Grant DEPLOYER_ROLE to owner so they can create vesting airdrops
        IAccessControl(address(vestingAirdropFactory)).grantRole(ATKSystemRoles.DEPLOYER_ROLE, owner);
        vm.stopPrank();

        // Set up allocations
        allocations[user1] = USER1_AMOUNT;
        allocations[user2] = USER2_AMOUNT;
        allocations[user3] = USER3_AMOUNT;

        indices[user1] = 0;
        indices[user2] = 1;
        indices[user3] = 2;

        // Generate Merkle tree
        merkleRoot = _generateMerkleRoot();
        _generateMerkleProofs();

        initializationDeadline = block.timestamp + 30 days;

        // Create vesting airdrop using factory
        vm.startPrank(owner);
        address vestingAirdropAddress = vestingAirdropFactory.create(
            address(token), merkleRoot, owner, address(vestingStrategy), initializationDeadline
        );
        vestingAirdrop = IATKVestingAirdrop(vestingAirdropAddress);
        vm.stopPrank();

        // Mint tokens to airdrop contract
        token.mint(address(vestingAirdrop), TOTAL_SUPPLY);

        vm.label(address(token), "Token");
        vm.label(address(vestingAirdrop), "VestingAirdrop");
        vm.label(address(vestingStrategy), "VestingStrategy");
        vm.label(address(vestingAirdropFactory), "VestingAirdropFactory");
    }

    function testConstructorWithValidParameters() public view {
        assertEq(address(vestingAirdrop.token()), address(token));
        assertEq(vestingAirdrop.merkleRoot(), merkleRoot);
        assertEq(address(vestingAirdrop.vestingStrategy()), address(vestingStrategy));
        assertEq(vestingAirdrop.claimPeriodEnd(), initializationDeadline);
    }

    function testFactoryCreateWithInvalidVestingStrategy() public {
        vm.startPrank(owner);
        vm.expectRevert(InvalidVestingStrategyAddress.selector);
        vestingAirdropFactory.create(address(token), merkleRoot, owner, address(0), initializationDeadline);
        vm.stopPrank();
    }

    function testFactoryCreateWithInvalidDeadline() public {
        vm.startPrank(owner);
        vm.expectRevert(InvalidInitializationDeadline.selector);
        vestingAirdropFactory.create(address(token), merkleRoot, owner, address(vestingStrategy), block.timestamp - 1);
        vm.stopPrank();
    }

    function testVestingStrategyWithCliffExceedsVestingDuration() public {
        vm.expectRevert(CliffExceedsVestingDuration.selector);
        new ATKLinearVestingStrategy(CLIFF_DURATION, VESTING_DURATION); // cliff > vesting
    }

    function testInitializeVestingWithValidProof() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectEmit(true, true, true, true);
        emit VestingInitialized(user1, amount, index);

        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertTrue(vestingAirdrop.isVestingInitialized(index));
        assertEq(vestingAirdrop.getInitializationTimestamp(index), block.timestamp);
    }

    function testInitializeVestingWithInvalidProof() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory invalidProof = proofs[user2];

        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, invalidProof);
    }

    function testInitializeVestingAlreadyInitialized() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // First initialization
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Second initialization should fail
        vm.expectRevert(VestingAlreadyInitialized.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);
    }

    function testInitializeVestingAfterDeadline() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // Fast forward past deadline
        vm.warp(initializationDeadline + 1);

        vm.expectRevert(InitializationDeadlinePassed.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);
    }

    function testClaimBeforeInitialization() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert(VestingNotInitialized.selector);
        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);
    }

    function testClaimDuringCliffPeriod() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward to within cliff period
        vm.warp(block.timestamp + CLIFF_DURATION - 1 days);

        vm.expectRevert(ZeroAmountToTransfer.selector);
        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);
    }

    function testClaimAfterCliffPeriod() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward past cliff period
        vm.warp(block.timestamp + CLIFF_DURATION + 1 days);

        // Calculate expected claimable amount
        uint256 timeElapsed = CLIFF_DURATION + 1 days;
        uint256 expectedClaimable = (amount * timeElapsed) / VESTING_DURATION;

        vm.expectEmit(true, true, true, true);
        emit Claimed(user1, expectedClaimable, index);

        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);

        assertEq(token.balanceOf(user1), expectedClaimable);
        assertEq(vestingAirdrop.getClaimedAmount(index), expectedClaimable);
    }

    function testClaimFullyVested() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward past full vesting period
        vm.warp(block.timestamp + VESTING_DURATION + 1 days);

        vm.expectEmit(true, true, true, true);
        emit Claimed(user1, amount, index);

        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);

        assertEq(token.balanceOf(user1), amount);
        assertEq(vestingAirdrop.getClaimedAmount(index), amount);
        assertTrue(vestingAirdrop.isClaimed(index, amount));
    }

    function testSetVestingStrategyWithValidStrategy() public {
        ATKLinearVestingStrategy newStrategy = new ATKLinearVestingStrategy(VESTING_DURATION * 2, 0);

        vm.expectEmit(true, true, true, true);
        emit VestingStrategyUpdated(address(vestingStrategy), address(newStrategy));

        vm.prank(owner);
        vestingAirdrop.setVestingStrategy(address(newStrategy));

        assertEq(address(vestingAirdrop.vestingStrategy()), address(newStrategy));
    }

    function testSetVestingStrategyWithInvalidStrategy() public {
        vm.expectRevert(InvalidVestingStrategyAddress.selector);
        vm.prank(owner);
        vestingAirdrop.setVestingStrategy(address(0));
    }

    function testSetVestingStrategyAsUnauthorized() public {
        ATKLinearVestingStrategy newStrategy = new ATKLinearVestingStrategy(VESTING_DURATION * 2, 0);

        vm.expectRevert();
        vm.prank(user1);
        vestingAirdrop.setVestingStrategy(address(newStrategy));
    }

    function testBatchInitializeVestingWithInvalidArrayLengths() public {
        uint256[] memory indices_ = new uint256[](2);
        uint256[] memory amounts = new uint256[](1); // Different length
        bytes32[][] memory proofs_ = new bytes32[][](2);

        vm.expectRevert(InvalidInputArrayLengths.selector);
        vm.prank(user1);
        vestingAirdrop.batchInitializeVesting(indices_, amounts, proofs_);
    }

    function testBatchInitializeVestingExceedsMaxBatchSize() public {
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) = _createDummyBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(user1);
        vestingAirdrop.batchInitializeVesting(indices_, amounts, proofs_);
    }

    function testBatchClaimExceedsMaxBatchSize() public {
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) = _createDummyBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(user1);
        vestingAirdrop.batchClaim(indices_, amounts, proofs_);
    }

    function testBatchOperationsWithMaxAllowedSize() public {
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) = _createDummyBatchData(100);

        // This should fail on merkle proof verification, not on batch size limit
        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(user1);
        vestingAirdrop.batchInitializeVesting(indices_, amounts, proofs_);
    }

    function testIsVestingInitializedNotInitialized() public view {
        assertFalse(vestingAirdrop.isVestingInitialized(indices[user1]));
    }

    function testIsVestingInitializedAfterInitialization() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertTrue(vestingAirdrop.isVestingInitialized(index));
    }

    function testGetInitializationTimestampNotInitialized() public view {
        assertEq(vestingAirdrop.getInitializationTimestamp(indices[user1]), 0);
    }

    function testGetInitializationTimestampAfterInitialization() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        uint256 initTime = block.timestamp;
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertEq(vestingAirdrop.getInitializationTimestamp(index), initTime);
    }

    function testMultipleUsersInitializeVesting() public {
        // User1 initializes vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(indices[user1], allocations[user1], proofs[user1]);

        // User2 initializes vesting
        vm.prank(user2);
        vestingAirdrop.initializeVesting(indices[user2], allocations[user2], proofs[user2]);

        // Both should be initialized
        assertTrue(vestingAirdrop.isVestingInitialized(indices[user1]));
        assertTrue(vestingAirdrop.isVestingInitialized(indices[user2]));

        // Timestamps should be the same (same block)
        assertEq(
            vestingAirdrop.getInitializationTimestamp(indices[user1]),
            vestingAirdrop.getInitializationTimestamp(indices[user2])
        );
    }

    // Helper functions for Merkle tree generation
    function _generateMerkleRoot() internal view returns (bytes32) {
        bytes32 leaf1 = keccak256(abi.encode(keccak256(abi.encode(indices[user1], user1, allocations[user1]))));
        bytes32 leaf2 = keccak256(abi.encode(keccak256(abi.encode(indices[user2], user2, allocations[user2]))));
        bytes32 leaf3 = keccak256(abi.encode(keccak256(abi.encode(indices[user3], user3, allocations[user3]))));

        bytes32 node1 = _hashPair(leaf1, leaf2);
        bytes32 root = _hashPair(node1, leaf3);

        return root;
    }

    function _generateMerkleProofs() internal {
        bytes32 leaf1 = keccak256(abi.encode(keccak256(abi.encode(indices[user1], user1, allocations[user1]))));
        bytes32 leaf2 = keccak256(abi.encode(keccak256(abi.encode(indices[user2], user2, allocations[user2]))));
        bytes32 leaf3 = keccak256(abi.encode(keccak256(abi.encode(indices[user3], user3, allocations[user3]))));

        bytes32 node1 = _hashPair(leaf1, leaf2);

        // Proof for user1: [leaf2, leaf3]
        proofs[user1] = new bytes32[](2);
        proofs[user1][0] = leaf2;
        proofs[user1][1] = leaf3;

        // Proof for user2: [leaf1, leaf3]
        proofs[user2] = new bytes32[](2);
        proofs[user2][0] = leaf1;
        proofs[user2][1] = leaf3;

        // Proof for user3: [node1]
        proofs[user3] = new bytes32[](1);
        proofs[user3][0] = node1;
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    /// @dev Helper function to create dummy batch data for testing
    /// @param size The size of arrays to create
    /// @return dummyIndices Array of dummy indices
    /// @return dummyAmounts Array of dummy amounts
    /// @return dummyProofs Array of dummy merkle proofs
    function _createDummyBatchData(uint256 size)
        internal
        pure
        returns (uint256[] memory dummyIndices, uint256[] memory dummyAmounts, bytes32[][] memory dummyProofs)
    {
        dummyIndices = new uint256[](size);
        dummyAmounts = new uint256[](size);
        dummyProofs = new bytes32[][](size);

        for (uint256 i = 0; i < size; i++) {
            dummyIndices[i] = i;
            dummyAmounts[i] = 1 ether;
            dummyProofs[i] = new bytes32[](1);
            dummyProofs[i][0] = bytes32(i);
        }
    }
}
