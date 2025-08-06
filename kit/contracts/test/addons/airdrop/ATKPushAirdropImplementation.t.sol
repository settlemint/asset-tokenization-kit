// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "../../assets/AbstractATKAssetTest.sol";
import { ATKPushAirdropFactoryImplementation } from
    "../../../contracts/addons/airdrop/push-airdrop/ATKPushAirdropFactoryImplementation.sol";
import { IATKPushAirdropFactory } from "../../../contracts/addons/airdrop/push-airdrop/IATKPushAirdropFactory.sol";
import { IATKPushAirdrop } from "../../../contracts/addons/airdrop/push-airdrop/IATKPushAirdrop.sol";
import { IATKAirdrop } from "../../../contracts/addons/airdrop/IATKAirdrop.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { AirdropUtils } from "../../utils/AirdropUtils.sol";
import {
    InvalidMerkleProof,
    InvalidInputArrayLengths,
    BatchSizeExceedsLimit
} from "../../../contracts/addons/airdrop/ATKAirdropErrors.sol";

/// @title ATK Push Airdrop Test
/// @notice Comprehensive test suite for ATKPushAirdropImplementation contract
contract ATKPushAirdropTest is AbstractATKAssetTest {
    using AirdropUtils for AirdropUtils.TestUserData;

    IATKPushAirdropFactory public pushAirdropFactory;
    IATKPushAirdrop public pushAirdrop;
    MockedERC20Token public token;

    address public owner;
    address public user1;
    address public user2;
    address public user3;
    address public unauthorizedUser;

    bytes32 public merkleRoot;
    uint256 public constant TOTAL_SUPPLY = 1000 ether;
    uint256 public constant DISTRIBUTION_CAP = 500 ether;

    // Test user data structure
    AirdropUtils.TestUserData public testUserData;

    // Events
    event AirdropTokensTransferred(address indexed recipient, uint256 indexed index, uint256 indexed amount);
    event AirdropBatchTokensTransferred(address[] recipients, uint256[] indices, uint256[] amounts);
    event DistributionCapUpdated(uint256 indexed oldCap, uint256 indexed newCap);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        unauthorizedUser = makeAddr("unauthorizedUser");

        vm.label(owner, "Owner");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
        vm.label(user3, "User3");
        vm.label(unauthorizedUser, "UnauthorizedUser");

        // Initialize ATK system
        setUpATK(owner);

        // Deploy contracts
        token = new MockedERC20Token("Test Token", "TEST", 18);

        // Set up the Push Airdrop Factory
        ATKPushAirdropFactoryImplementation pushAirdropFactoryImpl =
            new ATKPushAirdropFactoryImplementation(address(forwarder));

        vm.startPrank(platformAdmin);

        // Encode initialization data for the factory
        bytes memory encodedInitializationData = abi.encodeWithSelector(
            ATKPushAirdropFactoryImplementation.initialize.selector,
            address(systemUtils.systemAccessManager()),
            address(systemUtils.system())
        );

        // Create system addon for push airdrop factory
        pushAirdropFactory = IATKPushAirdropFactory(
            systemUtils.systemAddonRegistry().registerSystemAddon(
                "push-airdrop-factory", address(pushAirdropFactoryImpl), encodedInitializationData
            )
        );

        // Grant DEPLOYER_ROLE to owner so they can create push airdrops
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, owner);

        vm.stopPrank();

        // Set up test user data using utility
        merkleRoot = AirdropUtils.setupCompleteTestEnvironment(testUserData, user1, user2, user3);

        // Create push airdrop using factory
        vm.startPrank(owner);
        address pushAirdropAddress =
            pushAirdropFactory.create("Test Push Airdrop", address(token), merkleRoot, owner, DISTRIBUTION_CAP);
        pushAirdrop = IATKPushAirdrop(pushAirdropAddress);
        vm.stopPrank();

        // Mint tokens to airdrop contract
        token.mint(address(pushAirdrop), TOTAL_SUPPLY);

        vm.label(address(token), "Token");
        vm.label(address(pushAirdrop), "PushAirdrop");
        vm.label(address(pushAirdropFactory), "PushAirdropFactory");
    }

    function testConstructorWithValidParameters() public view {
        assertEq(address(IATKAirdrop(address(pushAirdrop)).token()), address(token));
        assertEq(IATKAirdrop(address(pushAirdrop)).merkleRoot(), merkleRoot);
        assertEq(pushAirdrop.distributionCap(), DISTRIBUTION_CAP);
        assertEq(pushAirdrop.totalDistributed(), 0);
    }

    function testFactoryCreateWithValidParameters() public {
        vm.startPrank(owner);
        address newPushAirdropAddress = pushAirdropFactory.create(
            "Test Factory Airdrop",
            address(token),
            merkleRoot,
            owner,
            0 // No cap
        );
        IATKPushAirdrop newPushAirdrop = IATKPushAirdrop(newPushAirdropAddress);
        vm.stopPrank();

        assertEq(address(IATKAirdrop(address(newPushAirdrop)).token()), address(token));
        assertEq(IATKAirdrop(address(newPushAirdrop)).merkleRoot(), merkleRoot);
        assertEq(newPushAirdrop.distributionCap(), 0);
        assertEq(newPushAirdrop.totalDistributed(), 0);
    }

    function testDistributeWithValidProof() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        uint256 balanceBefore = token.balanceOf(user1);

        vm.expectEmit(true, true, true, true);
        emit AirdropTokensTransferred(user1, index, amount);

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertEq(token.balanceOf(user1), balanceBefore + amount);
        assertEq(pushAirdrop.totalDistributed(), amount);
        assertTrue(pushAirdrop.isDistributed(index));
    }

    function testDistributeWithInvalidProof() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory invalidProof = testUserData.proofs[user2];

        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, invalidProof);
    }

    function testDistributeWithZeroAddress() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert(IATKPushAirdrop.InvalidDistributionAddress.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, address(0), amount, proof);
    }

    function testDistributeWithZeroAmount() public {
        uint256 index = testUserData.indices[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert(IATKPushAirdrop.ZeroAmountToDistribute.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, 0, proof);
    }

    function testDistributeAlreadyDistributed() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        // First distribution
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        // Second distribution should fail
        vm.expectRevert(IATKPushAirdrop.AlreadyDistributed.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);
    }

    function testDistributeExceedsDistributionCap() public {
        // Create airdrop with very low cap
        vm.startPrank(owner);
        address lowCapAirdropAddress = pushAirdropFactory.create(
            "Low Cap Airdrop",
            address(token),
            merkleRoot,
            owner,
            50 ether // Lower than AirdropUtils.USER1_AMOUNT
        );
        IATKPushAirdrop lowCapAirdrop = IATKPushAirdrop(lowCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(lowCapAirdrop), TOTAL_SUPPLY);

        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1]; // 100 ether, exceeds 50 ether cap
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert(IATKPushAirdrop.DistributionCapExceeded.selector);
        vm.prank(owner);
        lowCapAirdrop.distribute(index, user1, amount, proof);
    }

    function testDistributeAsUnauthorizedUser() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert();
        vm.prank(unauthorizedUser);
        pushAirdrop.distribute(index, user1, amount, proof);
    }

    function testBatchDistributeWithValidProofs() public {
        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = testUserData.indices[user1];
        recipients[0] = user1;
        amounts[0] = testUserData.allocations[user1];
        proofs_[0] = testUserData.proofs[user1];

        indices_[1] = testUserData.indices[user2];
        recipients[1] = user2;
        amounts[1] = testUserData.allocations[user2];
        proofs_[1] = testUserData.proofs[user2];

        uint256 totalAmount = amounts[0] + amounts[1];
        uint256 user1BalanceBefore = token.balanceOf(user1);
        uint256 user2BalanceBefore = token.balanceOf(user2);

        vm.expectEmit(true, true, true, true);
        emit AirdropBatchTokensTransferred(recipients, indices_, amounts);

        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);

        assertEq(token.balanceOf(user1), user1BalanceBefore + amounts[0]);
        assertEq(token.balanceOf(user2), user2BalanceBefore + amounts[1]);
        assertEq(pushAirdrop.totalDistributed(), totalAmount);
        assertTrue(pushAirdrop.isDistributed(indices_[0]));
        assertTrue(pushAirdrop.isDistributed(indices_[1]));
    }

    function testBatchDistributeWithInvalidArrayLengths() public {
        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](1); // Different length
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        vm.expectRevert(InvalidInputArrayLengths.selector);
        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testBatchDistributeExceedsMaxBatchSize() public {
        (uint256[] memory indices_, address[] memory recipients, uint256[] memory amounts, bytes32[][] memory proofs_) =
            AirdropUtils.createDummyPushBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testBatchDistributeWithMaxAllowedSize() public {
        (uint256[] memory indices_, address[] memory recipients, uint256[] memory amounts, bytes32[][] memory proofs_) =
            AirdropUtils.createDummyPushBatchData(100);

        // This should fail on merkle proof verification, not on batch size limit
        vm.expectRevert();
        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testBatchDistributeExceedsDistributionCap() public {
        // Create airdrop with cap that will be exceeded by batch
        vm.startPrank(owner);
        address lowCapAirdropAddress = pushAirdropFactory.create(
            "Batch Low Cap Airdrop",
            address(token),
            merkleRoot,
            owner,
            250 ether // Less than AirdropUtils.USER1_AMOUNT + AirdropUtils.USER2_AMOUNT
        );
        IATKPushAirdrop lowCapAirdrop = IATKPushAirdrop(lowCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(lowCapAirdrop), TOTAL_SUPPLY);

        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = testUserData.indices[user1];
        recipients[0] = user1;
        amounts[0] = testUserData.allocations[user1]; // 100 ether
        proofs_[0] = testUserData.proofs[user1];

        indices_[1] = testUserData.indices[user2];
        recipients[1] = user2;
        amounts[1] = testUserData.allocations[user2]; // 200 ether, total 300 ether > 250 ether cap
        proofs_[1] = testUserData.proofs[user2];

        vm.expectRevert(IATKPushAirdrop.DistributionCapExceeded.selector);
        vm.prank(owner);
        lowCapAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testSetDistributionCap() public {
        uint256 newCap = 1000 ether;
        uint256 oldCap = pushAirdrop.distributionCap();

        vm.expectEmit(true, true, true, true);
        emit DistributionCapUpdated(oldCap, newCap);

        vm.prank(owner);
        pushAirdrop.setDistributionCap(newCap);

        assertEq(pushAirdrop.distributionCap(), newCap);
    }

    function testSetDistributionCapAsUnauthorized() public {
        uint256 newCap = 1000 ether;

        vm.expectRevert();
        vm.prank(unauthorizedUser);
        pushAirdrop.setDistributionCap(newCap);
    }

    function testClaimNotAllowed() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.expectRevert(IATKPushAirdrop.PushAirdropClaimNotAllowed.selector);
        vm.prank(user1);
        pushAirdrop.claim(index, amount, proof);
    }

    function testBatchClaimNotAllowed() public {
        uint256[] memory indices_ = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);
        bytes32[][] memory proofs_ = new bytes32[][](1);

        indices_[0] = testUserData.indices[user1];
        amounts[0] = testUserData.allocations[user1];
        proofs_[0] = testUserData.proofs[user1];

        vm.expectRevert(IATKPushAirdrop.PushAirdropClaimNotAllowed.selector);
        vm.prank(user1);
        pushAirdrop.batchClaim(indices_, amounts, proofs_);
    }

    function testIsDistributedBeforeDistribution() public view {
        assertFalse(pushAirdrop.isDistributed(testUserData.indices[user1]));
    }

    function testIsDistributedAfterDistribution() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertTrue(pushAirdrop.isDistributed(index));
    }

    function testTotalDistributedInitiallyZero() public view {
        assertEq(pushAirdrop.totalDistributed(), 0);
    }

    function testTotalDistributedAfterSingleDistribution() public {
        uint256 index = testUserData.indices[user1];
        uint256 amount = testUserData.allocations[user1];
        bytes32[] memory proof = testUserData.proofs[user1];

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertEq(pushAirdrop.totalDistributed(), amount);
    }

    function testTotalDistributedAfterMultipleDistributions() public {
        // First distribution
        vm.prank(owner);
        pushAirdrop.distribute(
            testUserData.indices[user1], user1, testUserData.allocations[user1], testUserData.proofs[user1]
        );

        // Second distribution
        vm.prank(owner);
        pushAirdrop.distribute(
            testUserData.indices[user2], user2, testUserData.allocations[user2], testUserData.proofs[user2]
        );

        uint256 expectedTotal = testUserData.allocations[user1] + testUserData.allocations[user2];
        assertEq(pushAirdrop.totalDistributed(), expectedTotal);
    }

    function testDistributionCapNoCap() public {
        // Create airdrop with no cap (0)
        vm.startPrank(owner);
        address noCapAirdropAddress = pushAirdropFactory.create("No Cap Airdrop", address(token), merkleRoot, owner, 0);
        IATKPushAirdrop noCapAirdrop = IATKPushAirdrop(noCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(noCapAirdrop), TOTAL_SUPPLY);

        assertEq(noCapAirdrop.distributionCap(), 0);

        // Should be able to distribute even large amounts
        vm.prank(owner);
        noCapAirdrop.distribute(
            testUserData.indices[user1], user1, testUserData.allocations[user1], testUserData.proofs[user1]
        );

        assertEq(noCapAirdrop.totalDistributed(), testUserData.allocations[user1]);
    }

    function testBatchDistributeRevertsOnAlreadyDistributed() public {
        // First, distribute to user1
        vm.prank(owner);
        pushAirdrop.distribute(
            testUserData.indices[user1], user1, testUserData.allocations[user1], testUserData.proofs[user1]
        );

        // Now try batch distribute including user1 (already distributed) and user2
        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = testUserData.indices[user1]; // Already distributed
        recipients[0] = user1;
        amounts[0] = testUserData.allocations[user1];
        proofs_[0] = testUserData.proofs[user1];

        indices_[1] = testUserData.indices[user2]; // Not yet distributed
        recipients[1] = user2;
        amounts[1] = testUserData.allocations[user2];
        proofs_[1] = testUserData.proofs[user2];

        // Batch distribute should revert because user1 index is already distributed
        vm.prank(owner);
        vm.expectRevert(IATKPushAirdrop.AlreadyDistributed.selector);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }
}
