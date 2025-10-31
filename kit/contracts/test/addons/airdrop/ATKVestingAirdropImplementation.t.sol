// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "../../assets/AbstractATKAssetTest.sol";
import { ATKVestingAirdropFactoryImplementation } from
    "../../../contracts/addons/airdrop/vesting-airdrop/ATKVestingAirdropFactoryImplementation.sol";
import { IATKVestingAirdropFactory } from
    "../../../contracts/addons/airdrop/vesting-airdrop/IATKVestingAirdropFactory.sol";
import { IATKVestingAirdrop } from "../../../contracts/addons/airdrop/vesting-airdrop/IATKVestingAirdrop.sol";
import { ATKLinearVestingStrategy } from
    "../../../contracts/addons/airdrop/vesting-airdrop/ATKLinearVestingStrategy.sol";
import { IATKVestingStrategy } from "../../../contracts/addons/airdrop/vesting-airdrop/IATKVestingStrategy.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { AirdropUtils } from "../../utils/AirdropUtils.sol";

import {
    InvalidMerkleProof,
    InvalidInputArrayLengths,
    BatchSizeExceedsLimit
} from "../../../contracts/addons/airdrop/ATKAirdropErrors.sol";

/// @title ATK Vesting Airdrop Test
/// @notice Comprehensive test suite for ATKVestingAirdropImplementation contract
contract ATKVestingAirdropTest is AbstractATKAssetTest {
    using AirdropUtils for AirdropUtils.TestUserData;

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
    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public constant CLIFF_DURATION = 30 days;
    uint256 public initializationDeadline;

    // Test user data structure
    AirdropUtils.TestUserData public testUserData;

    // Events
    event VestingInitialized(address indexed account, uint256 indexed totalAmount, uint256 indexed index);
    event VestingStrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event AirdropTokensTransferred(address indexed recipient, uint256 indexed index, uint256 indexed amount);

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
            ATKVestingAirdropFactoryImplementation.initialize.selector,
            address(systemUtils.systemAccessManager()),
            address(systemUtils.system())
        );

        // Create system addon for vesting airdrop factory
        vestingAirdropFactory = IATKVestingAirdropFactory(
            systemUtils.systemAddonRegistry().registerSystemAddon(
                "vesting-airdrop-factory", address(vestingAirdropFactoryImpl), encodedInitializationData
            )
        );

        // Grant DEPLOYER_ROLE to owner so they can create vesting airdrops
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, owner);

        vm.stopPrank();

        // Set up test user data using utility
        merkleRoot = AirdropUtils.setupCompleteTestEnvironment(testUserData, user1, user2, user3);

        initializationDeadline = block.timestamp + 30 days;

        // Create vesting airdrop using factory
        vm.startPrank(owner);
        address vestingAirdropAddress = vestingAirdropFactory.create(
            "Test Vesting Airdrop", address(token), merkleRoot, owner, address(vestingStrategy), initializationDeadline
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
        assertEq(vestingAirdrop.initializationDeadline(), initializationDeadline);
    }

    function testFactoryCreateWithInvalidVestingStrategy() public {
        vm.startPrank(owner);
        vm.expectRevert(IATKVestingAirdrop.InvalidVestingStrategyAddress.selector);
        vestingAirdropFactory.create(
            "Test Airdrop", address(token), merkleRoot, owner, address(0), initializationDeadline
        );
        vm.stopPrank();
    }

    function testFactoryCreateWithInvalidDeadline() public {
        vm.startPrank(owner);
        vm.expectRevert(IATKVestingAirdrop.InvalidInitializationDeadline.selector);
        vestingAirdropFactory.create(
            "Test Airdrop", address(token), merkleRoot, owner, address(vestingStrategy), block.timestamp - 1
        );
        vm.stopPrank();
    }

    function testVestingStrategyWithCliffExceedsVestingDuration() public {
        vm.expectRevert(IATKVestingStrategy.CliffExceedsVestingDuration.selector);
        new ATKLinearVestingStrategy(CLIFF_DURATION, VESTING_DURATION); // cliff > vesting
    }

    function testInitializeVestingWithValidProof() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectEmit(true, true, true, true);
        emit VestingInitialized(user1, amount, index);

        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertTrue(vestingAirdrop.isVestingInitialized(index));
        assertEq(vestingAirdrop.getInitializationTimestamp(index), block.timestamp);
    }

    function testInitializeVestingWithInvalidProof() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory invalidProof = testUserData.proofs[user2];

        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, invalidProof);
    }

    function testInitializeVestingAlreadyInitialized() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // First initialization
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Second initialization should fail
        vm.expectRevert(IATKVestingAirdrop.VestingAlreadyInitialized.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);
    }

    function testInitializeVestingAfterDeadline() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // Fast forward past deadline
        vm.warp(initializationDeadline + 1);

        vm.expectRevert(IATKVestingAirdrop.InitializationDeadlinePassed.selector);
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);
    }

    function testClaimBeforeInitialization() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert(IATKVestingAirdrop.VestingNotInitialized.selector);
        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);
    }

    function testClaimDuringCliffPeriod() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward to within cliff period
        vm.warp(block.timestamp + CLIFF_DURATION - 1 days);

        vm.expectRevert(IATKVestingAirdrop.ZeroAmountToTransfer.selector);
        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);
    }

    function testClaimAfterCliffPeriod() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward past cliff period
        vm.warp(block.timestamp + CLIFF_DURATION + 1 days);

        // Calculate expected claimable amount
        uint256 timeElapsed = CLIFF_DURATION + 1 days;
        uint256 expectedClaimable = (amount * timeElapsed) / VESTING_DURATION;

        vm.expectEmit(true, true, true, true);
        emit AirdropTokensTransferred(user1, index, expectedClaimable);

        vm.prank(user1);
        vestingAirdrop.claim(index, amount, proof);

        assertEq(token.balanceOf(user1), expectedClaimable);
        assertEq(vestingAirdrop.getClaimedAmount(index), expectedClaimable);
    }

    function testClaimFullyVested() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // Initialize vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        // Fast forward past full vesting period
        vm.warp(block.timestamp + VESTING_DURATION + 1 days);

        vm.expectEmit(true, true, true, true);
        emit AirdropTokensTransferred(user1, index, amount);

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
        vm.expectRevert(IATKVestingAirdrop.InvalidVestingStrategyAddress.selector);
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
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) =
            AirdropUtils.createDummyBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(user1);
        vestingAirdrop.batchInitializeVesting(indices_, amounts, proofs_);
    }

    function testBatchClaimExceedsMaxBatchSize() public {
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) =
            AirdropUtils.createDummyBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(user1);
        vestingAirdrop.batchClaim(indices_, amounts, proofs_);
    }

    function testBatchOperationsWithMaxAllowedSize() public {
        (uint256[] memory indices_, uint256[] memory amounts, bytes32[][] memory proofs_) =
            AirdropUtils.createDummyBatchData(100);

        // This should fail on merkle proof verification, not on batch size limit
        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(user1);
        vestingAirdrop.batchInitializeVesting(indices_, amounts, proofs_);
    }

    function testIsVestingInitializedNotInitialized() public view {
        assertFalse(vestingAirdrop.isVestingInitialized(testUserData.indices[user1]));
    }

    function testIsVestingInitializedAfterInitialization() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertTrue(vestingAirdrop.isVestingInitialized(index));
    }

    function testGetInitializationTimestampNotInitialized() public view {
        assertEq(vestingAirdrop.getInitializationTimestamp(testUserData.indices[user1]), 0);
    }

    function testGetInitializationTimestampAfterInitialization() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        uint256 initTime = block.timestamp;
        vm.prank(user1);
        vestingAirdrop.initializeVesting(index, amount, proof);

        assertEq(vestingAirdrop.getInitializationTimestamp(index), initTime);
    }

    function testMultipleUsersInitializeVesting() public {
        // User1 initializes vesting
        vm.prank(user1);
        vestingAirdrop.initializeVesting(
            testUserData.indices[user1], testUserData.allocations[user1], testUserData.proofs[user1]
        );

        // User2 initializes vesting
        vm.prank(user2);
        vestingAirdrop.initializeVesting(
            testUserData.indices[user2], testUserData.allocations[user2], testUserData.proofs[user2]
        );

        // Both should be initialized
        assertTrue(vestingAirdrop.isVestingInitialized(testUserData.indices[user1]));
        assertTrue(vestingAirdrop.isVestingInitialized(testUserData.indices[user2]));

        // Timestamps should be the same (same block)
        assertEq(
            vestingAirdrop.getInitializationTimestamp(testUserData.indices[user1]),
            vestingAirdrop.getInitializationTimestamp(testUserData.indices[user2])
        );
    }
}
