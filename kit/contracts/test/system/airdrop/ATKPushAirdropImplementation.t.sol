// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { AbstractATKAssetTest } from "../../assets/AbstractATKAssetTest.sol";
import { ATKPushAirdropImplementation } from
    "../../../contracts/system/airdrop/push-airdrop/ATKPushAirdropImplementation.sol";
import { ATKPushAirdropFactoryImplementation } from
    "../../../contracts/system/airdrop/push-airdrop/ATKPushAirdropFactoryImplementation.sol";
import { IATKPushAirdropFactory } from "../../../contracts/system/airdrop/push-airdrop/IATKPushAirdropFactory.sol";
import { IATKPushAirdrop } from "../../../contracts/system/airdrop/push-airdrop/IATKPushAirdrop.sol";
import { IATKAirdrop } from "../../../contracts/system/airdrop/IATKAirdrop.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    PushAirdropClaimNotAllowed,
    InvalidDistributionAddress,
    AlreadyDistributed,
    DistributionCapExceeded,
    ZeroAmountToDistribute
} from "../../../contracts/system/airdrop/push-airdrop/ATKPushAirdropErrors.sol";
import {
    InvalidMerkleProof,
    InvalidInputArrayLengths,
    BatchSizeExceedsLimit
} from "../../../contracts/system/airdrop/ATKAirdropErrors.sol";

/// @title ATK Push Airdrop Test
/// @notice Comprehensive test suite for ATKPushAirdropImplementation contract
contract ATKPushAirdropTest is AbstractATKAssetTest {
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
    uint256 public constant USER1_AMOUNT = 100 ether;
    uint256 public constant USER2_AMOUNT = 200 ether;
    uint256 public constant USER3_AMOUNT = 300 ether;
    uint256 public constant DISTRIBUTION_CAP = 500 ether;

    // Merkle tree data
    mapping(address => uint256) public allocations;
    mapping(address => uint256) public indices;
    mapping(address => bytes32[]) public proofs;

    // Events
    event TokensDistributed(address indexed recipient, uint256 amount, uint256 index);
    event BatchTokensDistributed(uint256 recipientCount, uint256 totalAmount, uint256[] indices);
    event DistributionCapUpdated(uint256 oldCap, uint256 newCap);

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
            ATKPushAirdropFactoryImplementation.initialize.selector, address(systemUtils.system()), platformAdmin
        );

        // Create system addon for push airdrop factory
        pushAirdropFactory = IATKPushAirdropFactory(
            systemUtils.system().createSystemAddon(
                "push-airdrop-factory", address(pushAirdropFactoryImpl), encodedInitializationData
            )
        );

        // Grant DEPLOYER_ROLE to owner so they can create push airdrops
        IAccessControl(address(pushAirdropFactory)).grantRole(ATKSystemRoles.DEPLOYER_ROLE, owner);
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

        // Create push airdrop using factory
        vm.startPrank(owner);
        address pushAirdropAddress = pushAirdropFactory.create(address(token), merkleRoot, owner, DISTRIBUTION_CAP);
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
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        uint256 balanceBefore = token.balanceOf(user1);

        vm.expectEmit(true, true, true, true);
        emit TokensDistributed(user1, amount, index);

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertEq(token.balanceOf(user1), balanceBefore + amount);
        assertEq(pushAirdrop.totalDistributed(), amount);
        assertTrue(pushAirdrop.isDistributed(index));
    }

    function testDistributeWithInvalidProof() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory invalidProof = proofs[user2];

        vm.expectRevert(InvalidMerkleProof.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, invalidProof);
    }

    function testDistributeWithZeroAddress() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert(InvalidDistributionAddress.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, address(0), amount, proof);
    }

    function testDistributeWithZeroAmount() public {
        uint256 index = indices[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert(ZeroAmountToDistribute.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, 0, proof);
    }

    function testDistributeAlreadyDistributed() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        // First distribution
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        // Second distribution should fail
        vm.expectRevert(AlreadyDistributed.selector);
        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);
    }

    function testDistributeExceedsDistributionCap() public {
        // Create airdrop with very low cap
        vm.startPrank(owner);
        address lowCapAirdropAddress = pushAirdropFactory.create(
            address(token),
            merkleRoot,
            owner,
            50 ether // Lower than USER1_AMOUNT
        );
        IATKPushAirdrop lowCapAirdrop = IATKPushAirdrop(lowCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(lowCapAirdrop), TOTAL_SUPPLY);

        uint256 index = indices[user1];
        uint256 amount = allocations[user1]; // 100 ether, exceeds 50 ether cap
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert(DistributionCapExceeded.selector);
        vm.prank(owner);
        lowCapAirdrop.distribute(index, user1, amount, proof);
    }

    function testDistributeAsUnauthorizedUser() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert();
        vm.prank(unauthorizedUser);
        pushAirdrop.distribute(index, user1, amount, proof);
    }

    function testBatchDistributeWithValidProofs() public {
        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = indices[user1];
        recipients[0] = user1;
        amounts[0] = allocations[user1];
        proofs_[0] = proofs[user1];

        indices_[1] = indices[user2];
        recipients[1] = user2;
        amounts[1] = allocations[user2];
        proofs_[1] = proofs[user2];

        uint256 totalAmount = amounts[0] + amounts[1];
        uint256 user1BalanceBefore = token.balanceOf(user1);
        uint256 user2BalanceBefore = token.balanceOf(user2);

        vm.expectEmit(true, true, true, true);
        emit BatchTokensDistributed(2, totalAmount, indices_);

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
            _createDummyBatchData(101);

        vm.expectRevert(BatchSizeExceedsLimit.selector);
        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testBatchDistributeWithMaxAllowedSize() public {
        (uint256[] memory indices_, address[] memory recipients, uint256[] memory amounts, bytes32[][] memory proofs_) =
            _createDummyBatchData(100);

        // This should fail on merkle proof verification, not on batch size limit
        vm.expectRevert();
        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);
    }

    function testBatchDistributeExceedsDistributionCap() public {
        // Create airdrop with cap that will be exceeded by batch
        vm.startPrank(owner);
        address lowCapAirdropAddress = pushAirdropFactory.create(
            address(token),
            merkleRoot,
            owner,
            250 ether // Less than USER1_AMOUNT + USER2_AMOUNT
        );
        IATKPushAirdrop lowCapAirdrop = IATKPushAirdrop(lowCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(lowCapAirdrop), TOTAL_SUPPLY);

        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = indices[user1];
        recipients[0] = user1;
        amounts[0] = allocations[user1]; // 100 ether
        proofs_[0] = proofs[user1];

        indices_[1] = indices[user2];
        recipients[1] = user2;
        amounts[1] = allocations[user2]; // 200 ether, total 300 ether > 250 ether cap
        proofs_[1] = proofs[user2];

        vm.expectRevert(DistributionCapExceeded.selector);
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
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.expectRevert(PushAirdropClaimNotAllowed.selector);
        vm.prank(user1);
        pushAirdrop.claim(index, amount, proof);
    }

    function testBatchClaimNotAllowed() public {
        uint256[] memory indices_ = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);
        bytes32[][] memory proofs_ = new bytes32[][](1);

        indices_[0] = indices[user1];
        amounts[0] = allocations[user1];
        proofs_[0] = proofs[user1];

        vm.expectRevert(PushAirdropClaimNotAllowed.selector);
        vm.prank(user1);
        pushAirdrop.batchClaim(indices_, amounts, proofs_);
    }

    function testIsDistributedBeforeDistribution() public view {
        assertFalse(pushAirdrop.isDistributed(indices[user1]));
    }

    function testIsDistributedAfterDistribution() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertTrue(pushAirdrop.isDistributed(index));
    }

    function testTotalDistributedInitiallyZero() public view {
        assertEq(pushAirdrop.totalDistributed(), 0);
    }

    function testTotalDistributedAfterSingleDistribution() public {
        uint256 index = indices[user1];
        uint256 amount = allocations[user1];
        bytes32[] memory proof = proofs[user1];

        vm.prank(owner);
        pushAirdrop.distribute(index, user1, amount, proof);

        assertEq(pushAirdrop.totalDistributed(), amount);
    }

    function testTotalDistributedAfterMultipleDistributions() public {
        // First distribution
        vm.prank(owner);
        pushAirdrop.distribute(indices[user1], user1, allocations[user1], proofs[user1]);

        // Second distribution
        vm.prank(owner);
        pushAirdrop.distribute(indices[user2], user2, allocations[user2], proofs[user2]);

        uint256 expectedTotal = allocations[user1] + allocations[user2];
        assertEq(pushAirdrop.totalDistributed(), expectedTotal);
    }

    function testDistributionCapNoCap() public {
        // Create airdrop with no cap (0)
        vm.startPrank(owner);
        address noCapAirdropAddress = pushAirdropFactory.create(address(token), merkleRoot, owner, 0);
        IATKPushAirdrop noCapAirdrop = IATKPushAirdrop(noCapAirdropAddress);
        vm.stopPrank();

        // Mint tokens to new airdrop contract
        token.mint(address(noCapAirdrop), TOTAL_SUPPLY);

        assertEq(noCapAirdrop.distributionCap(), 0);

        // Should be able to distribute even large amounts
        vm.prank(owner);
        noCapAirdrop.distribute(indices[user1], user1, allocations[user1], proofs[user1]);

        assertEq(noCapAirdrop.totalDistributed(), allocations[user1]);
    }

    function testBatchDistributeSkipsAlreadyDistributed() public {
        // First, distribute to user1
        vm.prank(owner);
        pushAirdrop.distribute(indices[user1], user1, allocations[user1], proofs[user1]);

        // Now try batch distribute including user1 (should skip) and user2 (should succeed)
        uint256[] memory indices_ = new uint256[](2);
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        bytes32[][] memory proofs_ = new bytes32[][](2);

        indices_[0] = indices[user1]; // Already distributed
        recipients[0] = user1;
        amounts[0] = allocations[user1];
        proofs_[0] = proofs[user1];

        indices_[1] = indices[user2]; // Not yet distributed
        recipients[1] = user2;
        amounts[1] = allocations[user2];
        proofs_[1] = proofs[user2];

        uint256 user2BalanceBefore = token.balanceOf(user2);
        uint256 totalDistributedBefore = pushAirdrop.totalDistributed();

        vm.prank(owner);
        pushAirdrop.batchDistribute(indices_, recipients, amounts, proofs_);

        // User1 balance should not change (already distributed)
        // User2 should receive tokens
        assertEq(token.balanceOf(user2), user2BalanceBefore + allocations[user2]);
        assertEq(pushAirdrop.totalDistributed(), totalDistributedBefore + allocations[user2]);
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
    /// @return dummyRecipients Array of dummy recipient addresses
    /// @return dummyAmounts Array of dummy amounts
    /// @return dummyProofs Array of dummy merkle proofs
    function _createDummyBatchData(uint256 size)
        internal
        pure
        returns (
            uint256[] memory dummyIndices,
            address[] memory dummyRecipients,
            uint256[] memory dummyAmounts,
            bytes32[][] memory dummyProofs
        )
    {
        dummyIndices = new uint256[](size);
        dummyRecipients = new address[](size);
        dummyAmounts = new uint256[](size);
        dummyProofs = new bytes32[][](size);

        for (uint256 i = 0; i < size; i++) {
            dummyIndices[i] = i;
            dummyRecipients[i] = address(uint160(i + 1)); // Generate dummy addresses
            dummyAmounts[i] = 1 ether;
            dummyProofs[i] = new bytes32[](1);
            dummyProofs[i][0] = bytes32(i);
        }
    }
}
