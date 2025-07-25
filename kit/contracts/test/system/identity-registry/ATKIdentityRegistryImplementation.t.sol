// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import "../../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import "../../utils/SystemUtils.sol";
import "../../utils/IdentityUtils.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC3643TrustedIssuersRegistry } from
    "../../../contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ExpressionNode, ExpressionType } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ClaimExpressionUtils } from "../../utils/ClaimExpressionUtils.sol";

contract ATKIdentityRegistryImplementationTest is Test {
    SystemUtils public systemUtils;
    IdentityUtils public identityUtils;
    ISMARTIdentityRegistry public identityRegistry;
    address public admin;
    address public user1;
    address public user2;
    address public unauthorizedUser;

    IIdentity public identity1;
    IIdentity public identity2;
    uint16 public constant COUNTRY_US = 840;
    uint16 public constant COUNTRY_UK = 826;
    uint256[] public claimTopics;

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        unauthorizedUser = makeAddr("unauthorizedUser");

        systemUtils = new SystemUtils(admin);
        identityRegistry = systemUtils.identityRegistry();

        identityUtils = new IdentityUtils(
            admin, systemUtils.identityFactory(), identityRegistry, systemUtils.trustedIssuersRegistry()
        );

        vm.startPrank(admin);

        // Create test identities
        address identity1Addr = identityUtils.createIdentity(user1);
        address identity2Addr = identityUtils.createIdentity(user2);
        identity1 = IIdentity(identity1Addr);
        identity2 = IIdentity(identity2Addr);

        vm.stopPrank();
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
        // TODO: Add comprehensive claim verification tests with proper claim setup
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
        assertTrue(impl.supportsInterface(type(IAccessControl).interfaceId));
    }

    function testAccessControlRoles() public view {
        ATKIdentityRegistryImplementation impl = ATKIdentityRegistryImplementation(address(identityRegistry));
        assertTrue(impl.hasRole(impl.DEFAULT_ADMIN_ROLE(), admin));
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
}
