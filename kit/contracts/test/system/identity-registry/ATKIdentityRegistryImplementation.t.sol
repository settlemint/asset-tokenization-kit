// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { Test } from "forge-std/Test.sol";
import { ISMARTIdentityRegistry } from "../../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import {
    ATKIdentityRegistryImplementation
} from "../../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ExpressionNode, ExpressionType } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ClaimExpressionUtils } from "../../utils/ClaimExpressionUtils.sol";

contract ATKIdentityRegistryImplementationTest is Test {
    SystemUtils public systemUtils;
    IdentityUtils public identityUtils;
    ClaimUtils public claimUtils;
    ISMARTIdentityRegistry public identityRegistry;
    address public admin;
    address public user1;
    address public user2;
    address public unauthorizedUser;

    // Additional test users for comprehensive expression testing
    address public userWithKYC; // Has only KYC claim
    address public userWithAML; // Has only AML claim
    address public userWithBoth; // Has KYC and AML claims
    address public userWithNone; // Has no claims
    address public claimIssuer;

    IIdentity public identity1;
    IIdentity public identity2;
    IIdentity public identityKYC;
    IIdentity public identityAML;
    IIdentity public identityBoth;
    IIdentity public identityNone;

    uint16 public constant COUNTRY_US = 840;
    uint16 public constant COUNTRY_UK = 826;
    uint256[] public claimTopics;

    // Topic IDs for testing
    uint256 public kycTopicId;
    uint256 public amlTopicId;
    uint256 public collateralTopicId;

    // Private key for claim issuer
    uint256 internal claimIssuerPrivateKey = 0x12345;

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        unauthorizedUser = makeAddr("unauthorizedUser");

        // Initialize additional test users for expression testing
        userWithKYC = makeAddr("userWithKYC");
        userWithAML = makeAddr("userWithAML");
        userWithBoth = makeAddr("userWithBoth");
        userWithNone = makeAddr("userWithNone");
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        systemUtils = new SystemUtils(admin);
        identityRegistry = systemUtils.identityRegistry();

        identityUtils = new IdentityUtils(
            admin, systemUtils.identityFactory(), identityRegistry, systemUtils.trustedIssuersRegistry()
        );

        claimUtils = new ClaimUtils(
            admin,
            claimIssuer,
            claimIssuerPrivateKey,
            identityRegistry,
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );

        // Get topic IDs
        kycTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        amlTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);
        collateralTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);

        vm.startPrank(admin);

        // Create basic test identities
        address identity1Addr = identityUtils.createIdentity(user1);
        address identity2Addr = identityUtils.createIdentity(user2);
        identity1 = IIdentity(identity1Addr);
        identity2 = IIdentity(identity2Addr);

        // Create comprehensive test identities for expression testing
        address identityKYCAddr = identityUtils.createClientIdentity(userWithKYC, COUNTRY_US);
        address identityAMLAddr = identityUtils.createClientIdentity(userWithAML, COUNTRY_US);
        address identityBothAddr = identityUtils.createClientIdentity(userWithBoth, COUNTRY_US);
        address identityNoneAddr = identityUtils.createClientIdentity(userWithNone, COUNTRY_US);

        identityKYC = IIdentity(identityKYCAddr);
        identityAML = IIdentity(identityAMLAddr);
        identityBoth = IIdentity(identityBothAddr);
        identityNone = IIdentity(identityNoneAddr);

        vm.stopPrank();

        // Set up claim issuer with proper topics
        uint256[] memory issuerTopics = new uint256[](3);
        issuerTopics[0] = kycTopicId;
        issuerTopics[1] = amlTopicId;
        issuerTopics[2] = collateralTopicId;

        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, issuerTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");

        // Issue claims to create different verification scenarios
        claimUtils.issueKYCClaim(userWithKYC); // Only KYC
        claimUtils.issueAMLClaim(userWithAML); // Only AML
        claimUtils.issueKYCClaim(userWithBoth); // Both KYC and AML
        claimUtils.issueAMLClaim(userWithBoth);
        // userWithNone gets no claims
    }

    function testInitialState() public view {
        assertTrue(address(identityRegistry.identityStorage()) != address(0));
        assertTrue(address(identityRegistry.issuersRegistry()) != address(0));
        // Cast to implementation to access supportsInterface
        ATKIdentityRegistryImplementation impl = ATKIdentityRegistryImplementation(address(identityRegistry));
        assertTrue(impl.supportsInterface(type(ISMARTIdentityRegistry).interfaceId));
    }

    function testRegisterIdentity() public {
        vm.expectEmit(true, true, true, true);
        emit ISMARTIdentityRegistry.IdentityRegistered(admin, user1, identity1, COUNTRY_US);

        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        assertTrue(identityRegistry.contains(user1));
        assertEq(address(identityRegistry.identity(user1)), address(identity1));
        assertEq(identityRegistry.investorCountry(user1), COUNTRY_US);
    }

    function testRegisterIdentityRevertsWithZeroUser() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidUserAddress.selector);
        identityRegistry.registerIdentity(address(0), identity1, COUNTRY_US);
    }

    function testRegisterIdentityRevertsWithZeroIdentity() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidIdentityAddress.selector);
        identityRegistry.registerIdentity(user1, IIdentity(address(0)), COUNTRY_US);
    }

    function testRegisterIdentityRevertsIfAlreadyRegistered() public {
        vm.startPrank(admin);

        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityAlreadyRegistered.selector, user1)
        );
        identityRegistry.registerIdentity(user1, identity2, COUNTRY_UK);

        vm.stopPrank();
    }

    function testRegisterIdentityRevertsWithUnauthorizedCaller() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
    }

    function testDeleteIdentity() public {
        vm.startPrank(admin);

        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        assertTrue(identityRegistry.contains(user1));

        vm.expectEmit(true, true, true, true);
        emit ISMARTIdentityRegistry.IdentityRemoved(admin, user1, identity1);

        identityRegistry.deleteIdentity(user1);

        assertFalse(identityRegistry.contains(user1));

        vm.stopPrank();
    }

    function testDeleteIdentityRevertsIfNotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, user1));
        identityRegistry.deleteIdentity(user1);
    }

    function testDeleteIdentityRevertsWithUnauthorizedCaller() public {
        vm.startPrank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.deleteIdentity(user1);
    }

    function testUpdateCountry() public {
        vm.startPrank(admin);

        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        vm.expectEmit(true, true, false, true);
        emit ISMARTIdentityRegistry.CountryUpdated(admin, user1, COUNTRY_UK);

        identityRegistry.updateCountry(user1, COUNTRY_UK);

        assertEq(identityRegistry.investorCountry(user1), COUNTRY_UK);

        vm.stopPrank();
    }

    function testUpdateCountryRevertsIfNotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, user1));
        identityRegistry.updateCountry(user1, COUNTRY_UK);
    }

    function testUpdateCountryRevertsWithUnauthorizedCaller() public {
        vm.startPrank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.updateCountry(user1, COUNTRY_UK);
    }

    function testUpdateIdentity() public {
        vm.startPrank(admin);

        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        vm.expectEmit(true, true, true, true);
        emit ISMARTIdentityRegistry.IdentityUpdated(admin, identity1, identity2);

        identityRegistry.updateIdentity(user1, identity2);

        assertEq(address(identityRegistry.identity(user1)), address(identity2));

        vm.stopPrank();
    }

    function testUpdateIdentityRevertsIfNotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, user1));
        identityRegistry.updateIdentity(user1, identity2);
    }

    function testUpdateIdentityRevertsWithZeroIdentity() public {
        vm.startPrank(admin);

        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidIdentityAddress.selector);
        identityRegistry.updateIdentity(user1, IIdentity(address(0)));

        vm.stopPrank();
    }

    function testUpdateIdentityRevertsWithUnauthorizedCaller() public {
        vm.startPrank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.updateIdentity(user1, identity2);
    }

    function testBatchRegisterIdentity() public {
        address[] memory users = new address[](2);
        IIdentity[] memory identities = new IIdentity[](2);
        uint16[] memory countries = new uint16[](2);

        users[0] = user1;
        users[1] = user2;
        identities[0] = identity1;
        identities[1] = identity2;
        countries[0] = COUNTRY_US;
        countries[1] = COUNTRY_UK;

        vm.prank(admin);
        identityRegistry.batchRegisterIdentity(users, identities, countries);

        assertTrue(identityRegistry.contains(user1));
        assertTrue(identityRegistry.contains(user2));
        assertEq(address(identityRegistry.identity(user1)), address(identity1));
        assertEq(address(identityRegistry.identity(user2)), address(identity2));
        assertEq(identityRegistry.investorCountry(user1), COUNTRY_US);
        assertEq(identityRegistry.investorCountry(user2), COUNTRY_UK);
    }

    function testBatchRegisterIdentityRevertsWithMismatchedArrays() public {
        address[] memory users = new address[](2);
        IIdentity[] memory identities = new IIdentity[](1); // Different length
        uint16[] memory countries = new uint16[](2);

        users[0] = user1;
        users[1] = user2;
        identities[0] = identity1;
        countries[0] = COUNTRY_US;
        countries[1] = COUNTRY_UK;

        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.ArrayLengthMismatch.selector);
        identityRegistry.batchRegisterIdentity(users, identities, countries);
    }

    function testBatchRegisterIdentityRevertsWithUnauthorizedCaller() public {
        address[] memory users = new address[](1);
        IIdentity[] memory identities = new IIdentity[](1);
        uint16[] memory countries = new uint16[](1);

        users[0] = user1;
        identities[0] = identity1;
        countries[0] = COUNTRY_US;

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.batchRegisterIdentity(users, identities, countries);
    }

    function testContainsReturnsFalseForUnregistered() public view {
        assertFalse(identityRegistry.contains(user1));
    }

    function testContainsReturnsTrueForRegistered() public {
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        assertTrue(identityRegistry.contains(user1));
    }

    function testIsVerifiedReturnsFalseForUnregistered() public view {
        assertFalse(identityRegistry.isVerified(user1, _topicsToExpressionNodes(claimTopics)));
    }

    function testIsVerifiedReturnsTrueForEmptyClaimTopics() public {
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        uint256[] memory emptyTopics = new uint256[](0);
        // Verification should pass when no claims are required
        assertTrue(identityRegistry.isVerified(user1, _topicsToExpressionNodes(emptyTopics)));
    }

    function testIsVerifiedWithClaimTopics() public {
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        // Setup claim topics for this specific test
        uint256[] memory testClaimTopics = new uint256[](2);
        testClaimTopics[0] = 1; // KYC topic
        testClaimTopics[1] = 2; // AML topic

        // Should return false since we haven't set up proper claims for verification
        assertFalse(identityRegistry.isVerified(user1, _topicsToExpressionNodes(testClaimTopics)));
    }

    function testIsVerifiedReturnsFalseForLostWallet() public {
        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        // Initially should be able to verify (with empty claim topics)
        uint256[] memory emptyTopics = new uint256[](0);
        assertTrue(identityRegistry.isVerified(user1, _topicsToExpressionNodes(emptyTopics)));

        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        // Perform recovery
        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);

        // Lost wallet should not be verified anymore
        assertFalse(identityRegistry.isVerified(user1, _topicsToExpressionNodes(emptyTopics)));

        // New wallet should be verified
        assertTrue(identityRegistry.isVerified(newWallet, _topicsToExpressionNodes(emptyTopics)));
    }

    function testInvestorCountryRevertsIfNotRegistered() public {
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, user1));
        identityRegistry.investorCountry(user1);
    }

    function testSetIdentityRegistryStorage() public {
        address newStorage = makeAddr("newStorage");

        vm.expectEmit(true, true, false, false);
        emit ISMARTIdentityRegistry.IdentityStorageSet(admin, newStorage);

        vm.prank(admin);
        identityRegistry.setIdentityRegistryStorage(newStorage);

        assertEq(address(identityRegistry.identityStorage()), newStorage);
    }

    function testSetIdentityRegistryStorageRevertsWithZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidStorageAddress.selector);
        identityRegistry.setIdentityRegistryStorage(address(0));
    }

    function testSetIdentityRegistryStorageRevertsWithUnauthorizedCaller() public {
        address newStorage = makeAddr("newStorage");

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.setIdentityRegistryStorage(newStorage);
    }

    function testSetTrustedIssuersRegistry() public {
        address newRegistry = makeAddr("newRegistry");

        vm.expectEmit(true, true, false, false);
        emit ISMARTIdentityRegistry.TrustedIssuersRegistrySet(admin, newRegistry);

        vm.prank(admin);
        identityRegistry.setTrustedIssuersRegistry(newRegistry);

        assertEq(address(identityRegistry.issuersRegistry()), newRegistry);
    }

    function testSetTrustedIssuersRegistryRevertsWithZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidRegistryAddress.selector);
        identityRegistry.setTrustedIssuersRegistry(address(0));
    }

    function testSetTrustedIssuersRegistryRevertsWithUnauthorizedCaller() public {
        address newRegistry = makeAddr("newRegistry");

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.setTrustedIssuersRegistry(newRegistry);
    }

    function testSupportsInterface() public view {
        ATKIdentityRegistryImplementation impl = ATKIdentityRegistryImplementation(address(identityRegistry));
        assertTrue(impl.supportsInterface(type(ISMARTIdentityRegistry).interfaceId));
        assertTrue(impl.supportsInterface(type(IERC165).interfaceId));
        assertTrue(impl.supportsInterface(type(IATKSystemAccessManaged).interfaceId));
    }

    // --- recoverIdentity Tests ---

    function testRecoverIdentity() public {
        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        // Create a new wallet and new identity for recovery (NOT pre-registered)
        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        vm.expectEmit(true, true, true, false);
        emit ISMARTIdentityRegistry.IdentityRecovered(admin, user1, newWallet, newIdentityAddr, address(identity1));

        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);

        // Verify old wallet is no longer registered
        assertFalse(identityRegistry.contains(user1));

        // Verify new wallet is registered with the new identity and preserves the lost wallet's country
        assertTrue(identityRegistry.contains(newWallet));
        assertEq(address(identityRegistry.identity(newWallet)), newIdentityAddr);
        assertEq(identityRegistry.investorCountry(newWallet), COUNTRY_US);

        // Verify old wallet is marked as lost
        assertTrue(identityRegistry.isWalletLost(user1));

        // Verify recovery link is established
        assertEq(identityRegistry.getRecoveredWallet(user1), newWallet);
    }

    function testRecoverIdentityRevertsWithInvalidIdentityAddress() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidIdentityAddress.selector);
        identityRegistry.recoverIdentity(user1, user2, address(0));
    }

    function testRecoverIdentityRevertsWithInvalidNewWalletAddress() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidUserAddress.selector);
        identityRegistry.recoverIdentity(user1, address(0), address(identity1));
    }

    function testRecoverIdentityRevertsWithInvalidOldWalletAddress() public {
        vm.prank(admin);
        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidUserAddress.selector);
        identityRegistry.recoverIdentity(address(0), user2, address(identity1));
    }

    function testRecoverIdentityRevertsWhenOldWalletNotRegistered() public {
        address unregisteredWallet = makeAddr("unregisteredWallet");
        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, unregisteredWallet)
        );
        identityRegistry.recoverIdentity(unregisteredWallet, newWallet, newIdentityAddr);
    }

    function testRecoverIdentityRevertsWhenOldWalletAlreadyMarkedAsLost() public {
        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        address firstNewWallet = makeAddr("firstNewWallet");
        address firstNewIdentity = identityUtils.createIdentity(firstNewWallet);
        address secondNewWallet = makeAddr("secondNewWallet");
        address secondNewIdentity = identityUtils.createIdentity(secondNewWallet);

        // First recovery - should succeed
        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, firstNewWallet, firstNewIdentity);

        // Second recovery attempt with the same old wallet - should fail
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityNotRegistered.selector, user1));
        identityRegistry.recoverIdentity(user1, secondNewWallet, secondNewIdentity);
    }

    function testRecoverIdentityWorksWhenNewWalletAlreadyRegisteredToCorrectIdentity() public {
        // SPECIAL CASE: Test recovery when the new wallet is already pre-registered to the correct identity

        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        // Pre-register the new wallet with the new identity
        vm.prank(admin);
        identityRegistry.registerIdentity(newWallet, IIdentity(newIdentityAddr), COUNTRY_UK);

        // Verify pre-registration
        assertTrue(identityRegistry.contains(newWallet));
        assertEq(address(identityRegistry.identity(newWallet)), newIdentityAddr);
        assertEq(identityRegistry.investorCountry(newWallet), COUNTRY_UK);

        vm.expectEmit(true, true, true, false);
        emit ISMARTIdentityRegistry.IdentityRecovered(admin, user1, newWallet, newIdentityAddr, address(identity1));

        // This should succeed even though newWallet is already registered to the correct identity
        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);

        // Verify old wallet is no longer registered
        assertFalse(identityRegistry.contains(user1));

        // Verify new wallet is still registered with the new identity
        assertTrue(identityRegistry.contains(newWallet));
        assertEq(address(identityRegistry.identity(newWallet)), newIdentityAddr);

        // Verify country code is preserved from the existing registration (UK) not overwritten by lost wallet's country
        // (US)
        assertEq(identityRegistry.investorCountry(newWallet), COUNTRY_UK);

        // Verify old wallet is marked as lost
        assertTrue(identityRegistry.isWalletLost(user1));

        // Verify recovery link is established
        assertEq(identityRegistry.getRecoveredWallet(user1), newWallet);
    }

    function testRecoverIdentityRevertsWhenNewWalletAlreadyRegistered() public {
        // Setup: Register both users
        vm.startPrank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        identityRegistry.registerIdentity(user2, identity2, COUNTRY_UK);
        vm.stopPrank();

        // Create a completely new identity for recovery attempt (not linked to user2)
        address newWalletForRecovery = makeAddr("newWalletForRecovery");
        address newIdentityAddr = identityUtils.createIdentity(newWalletForRecovery);

        // Try to recover user1's identity to user2's wallet (already registered to different identity)
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryImplementation.IdentityAlreadyRegistered.selector, user2)
        );
        identityRegistry.recoverIdentity(user1, user2, newIdentityAddr);
    }

    function testRecoverIdentityRevertsWhenNewWalletAlreadyMarkedAsLost() public {
        // Setup: Register user1 and user2
        vm.startPrank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);
        identityRegistry.registerIdentity(user2, identity2, COUNTRY_UK);
        vm.stopPrank();

        address firstNewWallet = makeAddr("firstNewWallet");
        address firstNewIdentity = identityUtils.createIdentity(firstNewWallet);

        // First, recover user2's identity to firstNewWallet (this marks user2 as lost)
        vm.prank(admin);
        identityRegistry.recoverIdentity(user2, firstNewWallet, firstNewIdentity);

        // Create a new identity for the second recovery attempt
        address secondRecoveryWallet = makeAddr("secondRecoveryWallet");
        address newIdentityForUser1 = identityUtils.createIdentity(secondRecoveryWallet);

        // Now try to recover user1's identity to user2 (which is now marked as lost)
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryImplementation.WalletAlreadyMarkedAsLost.selector, user2)
        );
        identityRegistry.recoverIdentity(user1, user2, newIdentityForUser1);
    }

    function testRecoverIdentityRevertsWithUnauthorizedCaller() public {
        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);
    }

    function testRecoverIdentityPreservesCountryCode() public {
        // Setup: Register user1 with a specific country
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_UK);

        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);

        // Verify the country code is preserved
        assertEq(identityRegistry.investorCountry(newWallet), COUNTRY_UK);
    }

    function testGetLostWalletsForIdentity() public {
        // Setup: Register user1 with identity1
        vm.prank(admin);
        identityRegistry.registerIdentity(user1, identity1, COUNTRY_US);

        address newWallet = makeAddr("newWallet");
        address newIdentityAddr = identityUtils.createIdentity(newWallet);

        // Perform recovery
        vm.prank(admin);
        identityRegistry.recoverIdentity(user1, newWallet, newIdentityAddr);

        // Verify recovery link is established instead of checking lost wallets array
        assertEq(identityRegistry.getRecoveredWallet(user1), newWallet);
        assertTrue(identityRegistry.isWalletLost(user1));
    }

    /**
     * @notice Converts an array of claim topic IDs to an array of ExpressionNode structs
     * @dev Each topic ID is converted to a TOPIC node type
     * @param topics Array of topic IDs to convert
     * @return Array of ExpressionNode structs
     */
    function _topicsToExpressionNodes(uint256[] memory topics) internal pure returns (ExpressionNode[] memory) {
        return ClaimExpressionUtils.topicsToExpressionNodes(topics);
    }

    // =====================================================================
    //                    POSTFIX EXPRESSION TESTS
    // =====================================================================

    /// @dev Helper function to create a single topic expression: [TOPIC]
    function _createSingleTopicExpression(uint256 topic) internal pure returns (ExpressionNode[] memory) {
        ExpressionNode[] memory nodes = new ExpressionNode[](1);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topic });
        return nodes;
    }

    /// @dev Helper function to create A AND B expression: [TOPIC_A, TOPIC_B, AND]
    function _createAndExpression(uint256 topicA, uint256 topicB) internal pure returns (ExpressionNode[] memory) {
        ExpressionNode[] memory nodes = new ExpressionNode[](3);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicA });
        nodes[1] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicB });
        nodes[2] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });
        return nodes;
    }

    /// @dev Helper function to create A OR B expression: [TOPIC_A, TOPIC_B, OR]
    function _createOrExpression(uint256 topicA, uint256 topicB) internal pure returns (ExpressionNode[] memory) {
        ExpressionNode[] memory nodes = new ExpressionNode[](3);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicA });
        nodes[1] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicB });
        nodes[2] = ExpressionNode({ nodeType: ExpressionType.OR, value: 0 });
        return nodes;
    }

    /// @dev Helper function to create NOT A expression: [TOPIC_A, NOT]
    function _createNotExpression(uint256 topic) internal pure returns (ExpressionNode[] memory) {
        ExpressionNode[] memory nodes = new ExpressionNode[](2);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topic });
        nodes[1] = ExpressionNode({ nodeType: ExpressionType.NOT, value: 0 });
        return nodes;
    }

    /// @dev Helper function to create (A AND B) OR C expression: [TOPIC_A, TOPIC_B, AND, TOPIC_C, OR]
    function _createComplexExpression1(uint256 topicA, uint256 topicB, uint256 topicC)
        internal
        pure
        returns (ExpressionNode[] memory)
    {
        ExpressionNode[] memory nodes = new ExpressionNode[](5);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicA });
        nodes[1] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicB });
        nodes[2] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });
        nodes[3] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicC });
        nodes[4] = ExpressionNode({ nodeType: ExpressionType.OR, value: 0 });
        return nodes;
    }

    /// @dev Helper function to create A AND NOT B expression: [TOPIC_A, TOPIC_B, NOT, AND]
    function _createAndNotExpression(uint256 topicA, uint256 topicB) internal pure returns (ExpressionNode[] memory) {
        ExpressionNode[] memory nodes = new ExpressionNode[](4);
        nodes[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicA });
        nodes[1] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: topicB });
        nodes[2] = ExpressionNode({ nodeType: ExpressionType.NOT, value: 0 });
        nodes[3] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });
        return nodes;
    }

    // Test single topic expressions
    function testPostfixSingleTopicKYC() public view {
        ExpressionNode[] memory expression = _createSingleTopicExpression(kycTopicId);

        // User with KYC should pass
        assertTrue(identityRegistry.isVerified(userWithKYC, expression));

        // User with only AML should fail
        assertFalse(identityRegistry.isVerified(userWithAML, expression));

        // User with both should pass
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // User with none should fail
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    function testPostfixSingleTopicAML() public view {
        ExpressionNode[] memory expression = _createSingleTopicExpression(amlTopicId);

        // User with AML should pass
        assertTrue(identityRegistry.isVerified(userWithAML, expression));

        // User with only KYC should fail
        assertFalse(identityRegistry.isVerified(userWithKYC, expression));

        // User with both should pass
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // User with none should fail
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test AND expressions
    function testPostfixKYCAndAML() public view {
        ExpressionNode[] memory expression = _createAndExpression(kycTopicId, amlTopicId);

        // Only user with both claims should pass
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // Users with only one claim should fail
        assertFalse(identityRegistry.isVerified(userWithKYC, expression));
        assertFalse(identityRegistry.isVerified(userWithAML, expression));

        // User with no claims should fail
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test OR expressions
    function testPostfixKYCOrAML() public view {
        ExpressionNode[] memory expression = _createOrExpression(kycTopicId, amlTopicId);

        // Users with either claim should pass
        assertTrue(identityRegistry.isVerified(userWithKYC, expression));
        assertTrue(identityRegistry.isVerified(userWithAML, expression));
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // User with no claims should fail
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test NOT expressions
    function testPostfixNotKYC() public view {
        ExpressionNode[] memory expression = _createNotExpression(kycTopicId);

        // Users without KYC should pass
        assertTrue(identityRegistry.isVerified(userWithAML, expression));
        assertTrue(identityRegistry.isVerified(userWithNone, expression));

        // Users with KYC should fail
        assertFalse(identityRegistry.isVerified(userWithKYC, expression));
        assertFalse(identityRegistry.isVerified(userWithBoth, expression));
    }

    // Test complex expressions: (KYC AND AML) OR COLLATERAL
    function testPostfixComplexExpression() public view {
        ExpressionNode[] memory expression = _createComplexExpression1(kycTopicId, amlTopicId, collateralTopicId);

        // User with both KYC and AML should pass (first part of OR)
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // Users with only one claim should fail (since no one has collateral)
        assertFalse(identityRegistry.isVerified(userWithKYC, expression));
        assertFalse(identityRegistry.isVerified(userWithAML, expression));

        // User with no claims should fail
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test KYC AND NOT AML expression
    function testPostfixKYCAndNotAML() public view {
        ExpressionNode[] memory expression = _createAndNotExpression(kycTopicId, amlTopicId);

        // User with only KYC should pass
        assertTrue(identityRegistry.isVerified(userWithKYC, expression));

        // User with both should fail (has AML)
        assertFalse(identityRegistry.isVerified(userWithBoth, expression));

        // User with only AML should fail (no KYC)
        assertFalse(identityRegistry.isVerified(userWithAML, expression));

        // User with none should fail (no KYC)
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test three-way AND chain: KYC AND AML AND COLLATERAL
    function testPostfixThreeWayAnd() public view {
        uint256[] memory topics = new uint256[](3);
        topics[0] = kycTopicId;
        topics[1] = amlTopicId;
        topics[2] = collateralTopicId;

        ExpressionNode[] memory expression = _topicsToExpressionNodes(topics);

        // No user has all three claims, so all should fail
        assertFalse(identityRegistry.isVerified(userWithKYC, expression));
        assertFalse(identityRegistry.isVerified(userWithAML, expression));
        assertFalse(identityRegistry.isVerified(userWithBoth, expression));
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test caching by using repeated topics in complex expression
    function testPostfixCachingWithRepeatedTopics() public view {
        // Create expression: KYC AND (KYC OR AML) - KYC appears twice
        ExpressionNode[] memory expression = new ExpressionNode[](5);
        expression[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: kycTopicId });
        expression[1] =
            ExpressionNode({
                nodeType: ExpressionType.TOPIC,
                value: kycTopicId // Repeated topic for caching test
            });
        expression[2] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: amlTopicId });
        expression[3] = ExpressionNode({ nodeType: ExpressionType.OR, value: 0 });
        expression[4] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });

        // Users with KYC should pass (KYC AND (KYC OR AML) = KYC AND true = KYC)
        assertTrue(identityRegistry.isVerified(userWithKYC, expression));
        assertTrue(identityRegistry.isVerified(userWithBoth, expression));

        // Users without KYC should fail
        assertFalse(identityRegistry.isVerified(userWithAML, expression));
        assertFalse(identityRegistry.isVerified(userWithNone, expression));
    }

    // Test error conditions
    function testPostfixEmptyExpressionReturnsTrue() public view {
        ExpressionNode[] memory emptyExpression = new ExpressionNode[](0);

        // Empty expression should return true (no requirements)
        assertTrue(identityRegistry.isVerified(userWithKYC, emptyExpression));
        assertTrue(identityRegistry.isVerified(userWithNone, emptyExpression));
    }

    function testPostfixStackOverflowError() public {
        // Create malformed expression that will cause stack overflow
        ExpressionNode[] memory expression = new ExpressionNode[](10);
        // Fill with only topics (no operators) - will overflow stack
        for (uint256 i = 0; i < 10; i++) {
            expression[i] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: kycTopicId });
        }

        vm.expectRevert(ATKIdentityRegistryImplementation.InvalidExpressionStackResult.selector);
        identityRegistry.isVerified(userWithKYC, expression);
    }

    function testPostfixNotOperationRequiresOneOperand() public {
        // Create malformed expression: [NOT] - no operand
        ExpressionNode[] memory expression = new ExpressionNode[](1);
        expression[0] = ExpressionNode({ nodeType: ExpressionType.NOT, value: 0 });

        vm.expectRevert(ATKIdentityRegistryImplementation.NotOperationRequiresOneOperand.selector);
        identityRegistry.isVerified(userWithKYC, expression);
    }

    function testPostfixAndOperationRequiresTwoOperands() public {
        // Create malformed expression: [TOPIC, AND] - only one operand
        ExpressionNode[] memory expression = new ExpressionNode[](2);
        expression[0] = ExpressionNode({ nodeType: ExpressionType.TOPIC, value: kycTopicId });
        expression[1] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });

        vm.expectRevert(ATKIdentityRegistryImplementation.AndOrOperationsRequireTwoOperands.selector);
        identityRegistry.isVerified(userWithKYC, expression);
    }

    function testPostfixUnregisteredUserReturnsFalse() public {
        address unregisteredUser = makeAddr("unregistered");
        ExpressionNode[] memory expression = _createSingleTopicExpression(kycTopicId);

        // Unregistered user should always return false
        assertFalse(identityRegistry.isVerified(unregisteredUser, expression));
    }

    function testPostfixInvalidTopicReturnsFalse() public view {
        uint256 invalidTopic = 99_999; // Non-existent topic
        ExpressionNode[] memory expression = _createSingleTopicExpression(invalidTopic);

        // Invalid topic should return false even for users with valid claims
        assertFalse(identityRegistry.isVerified(userWithBoth, expression));
    }
}
